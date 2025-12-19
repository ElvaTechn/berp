/**
 * Rate Limiting Module - 100% Prisma (Enterprise Grade)
 * 
 * Sem dependências externas (Redis/Upstash)
 * Persiste entre restarts, controle total dos dados
 * Performance otimizada com índices no Prisma
 */
import "server-only";
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Clean expired entries (executar em cron job ou startup)
 */
export async function cleanExpiredEntries(): Promise<void> {
  try {
    const now = new Date();
    
    // Limpar rate limit entries expiradas
    await prisma.rateLimitEntry.deleteMany({
      where: { resetAt: { lt: now } }
    });
    
    // Limpar login attempts desbloqueadas
    await prisma.loginAttempt.deleteMany({
      where: {
        lockUntil: { not: null, lt: now },
        attempts: { lt: 5 }
      }
    });
    
    logger.info('Expired security entries cleaned');
  } catch (error) {
    logger.error('Failed to clean expired entries', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Rate limit check com Prisma
 */
async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    // Buscar ou criar entry
    const entry = await prisma.rateLimitEntry.upsert({
      where: { identifier },
      update: {
        count: { increment: 1 },
        updatedAt: now
      },
      create: {
        identifier,
        count: 1,
        resetAt,
        updatedAt: now
      }
    });

    // Se passou do reset, resetar contagem
    if (entry.resetAt < now) {
      const updated = await prisma.rateLimitEntry.update({
        where: { identifier },
        data: {
          count: 1,
          resetAt,
          updatedAt: now
        }
      });

      return {
        success: true,
        remaining: maxRequests - 1,
        resetAt: updated.resetAt
      };
    }

    const success = entry.count <= maxRequests;
    const remaining = Math.max(0, maxRequests - entry.count);

    return { success, remaining, resetAt: entry.resetAt };
  } catch (error) {
    logger.error('Rate limit check failed, allowing request', {
      error: error instanceof Error ? error.message : 'Unknown error',
      identifier
    });
    
    // Fail open - allow request on error
    return { success: true, remaining: maxRequests, resetAt };
  }
}

/**
 * General rate limiter: 10 requests per 15 minutes
 */
export const rateLimit = {
  limit: async (identifier: string) => {
    const result = await checkRateLimit(identifier, 10, 15 * 60);
    return { success: result.success, reset: result.resetAt.getTime() };
  }
};

/**
 * Auth rate limiter: 5 attempts per 15 minutes
 */
export const authRateLimit = {
  limit: async (identifier: string) => {
    const result = await checkRateLimit(`auth:${identifier}`, 5, 15 * 60);
    return { success: result.success, reset: result.resetAt.getTime() };
  }
};

/**
 * API rate limiter: 100 requests per hour
 */
export const apiRateLimit = {
  limit: async (identifier: string) => {
    const result = await checkRateLimit(`api:${identifier}`, 100, 60 * 60);
    return { success: result.success, reset: result.resetAt.getTime() };
  }
};

/**
 * Sales rate limiter: 50 sales per hour
 */
export const salesRateLimit = {
  limit: async (identifier: string) => {
    const result = await checkRateLimit(`sales:${identifier}`, 50, 60 * 60);
    return { success: result.success, reset: result.resetAt.getTime() };
  }
};

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request | NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return cfConnectingIp || realIp || 'unknown';
}

/**
 * Enhanced rate limiting with detailed response
 */
export async function enhancedRateLimit(
  request: NextRequest,
  type: 'general' | 'auth' | 'api' | 'sales' = 'general'
): Promise<{ 
  allowed: boolean; 
  remaining: number;
  retryAfter?: number; 
  message?: string 
}> {
  const ip = getClientIP(request);
  const identifier = `${type}:${ip}`;

  const configs = {
    general: { max: 10, window: 15 * 60 },
    auth: { max: 5, window: 15 * 60 },
    api: { max: 100, window: 60 * 60 },
    sales: { max: 50, window: 60 * 60 },
  };

  const config = configs[type];
  const result = await checkRateLimit(identifier, config.max, config.window);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      message: `Limite de requisições excedido. Tente novamente em ${Math.ceil(retryAfter / 60)} minutos.`
    };
  }

  return { 
    allowed: true, 
    remaining: result.remaining 
  };
}

/**
 * Login attempt tracking for account lockout (PRISMA)
 */
export async function trackLoginAttempt(
  email: string,
  success: boolean
): Promise<{ locked: boolean; attemptsRemaining: number; lockoutMinutes?: number }> {
  const key = email.toLowerCase();
  const now = new Date();
  const maxAttempts = 5;
  const lockoutDuration = 15 * 60 * 1000; // 15 minutes

  try {
    if (success) {
      // Sucesso - resetar tentativas
      await prisma.loginAttempt.deleteMany({
        where: { email: key }
      });
      
      return { locked: false, attemptsRemaining: maxAttempts };
    }

    // Falha - incrementar tentativas
    const attempt = await prisma.loginAttempt.upsert({
      where: { email: key },
      update: {
        attempts: { increment: 1 },
        updatedAt: now
      },
      create: {
        email: key,
        attempts: 1,
        lockUntil: null,
        updatedAt: now
      }
    });

    // Atingiu o máximo - bloquear conta
    if (attempt.attempts >= maxAttempts) {
      const lockUntil = new Date(now.getTime() + lockoutDuration);
      
      await prisma.loginAttempt.update({
        where: { email: key },
        data: { lockUntil }
      });
      
      logger.warn('Account locked due to failed login attempts', { email: key });
      
      return {
        locked: true,
        attemptsRemaining: 0,
        lockoutMinutes: 15
      };
    }

    return {
      locked: false,
      attemptsRemaining: maxAttempts - attempt.attempts
    };
  } catch (error) {
    logger.error('Failed to track login attempt', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: key
    });
    
    // Fail open
    return { locked: false, attemptsRemaining: maxAttempts };
  }
}

/**
 * Check if account is locked (PRISMA)
 */
export async function isAccountLocked(email: string): Promise<{ 
  locked: boolean; 
  remainingMinutes?: number 
}> {
  const key = email.toLowerCase();
  const now = new Date();

  try {
    const attempt = await prisma.loginAttempt.findUnique({
      where: { email: key }
    });

    if (attempt && attempt.lockUntil && attempt.lockUntil > now) {
      const remainingMs = attempt.lockUntil.getTime() - now.getTime();
      return {
        locked: true,
        remainingMinutes: Math.ceil(remainingMs / 60000)
      };
    }

    return { locked: false };
  } catch (error) {
    logger.error('Failed to check account lock', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email: key
    });
    
    // Fail open
    return { locked: false };
  }
}

/**
 * Add IP to blacklist (usando RateLimitEntry com prefix especial)
 */
export async function addToBlacklist(
  request: NextRequest,
  durationMs: number = 30 * 60 * 1000
): Promise<void> {
  const ip = getClientIP(request);
  const identifier = `blacklist:${ip}`;
  const resetAt = new Date(Date.now() + durationMs);

  try {
    await prisma.rateLimitEntry.upsert({
      where: { identifier },
      update: { resetAt, count: 999999, updatedAt: new Date() },
      create: { identifier, count: 999999, resetAt, updatedAt: new Date() }
    });

    logger.warn('IP added to blacklist', { 
      ip, 
      durationMinutes: Math.ceil(durationMs / 60000) 
    });
  } catch (error) {
    logger.error('Failed to add IP to blacklist', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip
    });
  }
}

/**
 * Check if IP is blacklisted
 */
export async function isBlacklisted(ip: string): Promise<boolean> {
  const identifier = `blacklist:${ip}`;
  const now = new Date();

  try {
    const entry = await prisma.rateLimitEntry.findUnique({
      where: { identifier }
    });

    if (entry && entry.resetAt > now && entry.count === 999999) {
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to check blacklist', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip
    });
    return false;
  }
}
