/**
 * ================================================================
 * PWA SUBSCRIPTION CHECK - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * "Kill Switch" - Controlo total de subscrições offline
 * 
 * SEGURANÇA:
 * - Anti-fraude: Detecta mudança de data no dispositivo
 * - Lease temporário: Máximo 5 dias offline
 * - Criptografia: Dados sensíveis encriptados
 * - Validação em camadas
 * 
 * ESTRATÉGIA:
 * 1. Online: Valida no servidor e atualiza cache local
 * 2. Offline: Valida cache local com anti-fraude
 * 3. Expirado: Bloqueia app e força conexão
 * 
 * AUTOR: Security Team
 * DATA: 18 Dezembro 2025
 * ================================================================
 */

"use client";

import { secureGet, secureSet, secureRemove } from "./crypto";

// ================================================================
// TYPES
// ================================================================

export interface SubscriptionLease {
  subscription_end: string;      // ISO date string
  last_known_server_date: string;     // ISO date string (anti-fraude)
  max_offline_days: number;           // Máximo de dias offline permitidos
  last_online_sync: string;           // ISO date string
  company_id: string;
  subscription_status: string;        // TRIAL, ACTIVE, EXPIRED, etc
}

export interface SubscriptionCheckResult {
  valid: boolean;
  reason?: "expired" | "fraud_detected" | "offline_limit" | "connection_required";
  message?: string;
  days_remaining?: number;
  offline_days?: number;
}

// ================================================================
// CONSTANTS
// ================================================================

const LEASE_KEY = "subscription_lease";
const MAX_OFFLINE_DAYS = 5; // Máximo de dias offline antes de forçar conexão
const GRACE_PERIOD_HOURS = 24; // Período de graça após expiração (para sincronizar)

// ================================================================
// SUBSCRIPTION VALIDATION
// ================================================================

/**
 * Valida subscrição (principal entry point)
 */
export async function checkSubscription(): Promise<SubscriptionCheckResult> {
  try {
    const lease = await getLease();

    // Sem lease: primeira vez ou cache limpo
    if (!lease) {
      return {
        valid: false,
        reason: "connection_required",
        message: "Conecte-se à internet para validar sua subscrição"
      };
    }

    // 1. Anti-Fraude: Verificar se usuário mudou data do dispositivo
    const fraudCheck = detectDateFraud(lease);
    if (!fraudCheck.valid) {
      return fraudCheck;
    }

    // 2. Verificar limite de dias offline
    const offlineCheck = checkOfflineLimit(lease);
    if (!offlineCheck.valid) {
      return offlineCheck;
    }

    // 3. Verificar se subscrição expirou
    const expirationCheck = checkExpiration(lease);
    if (!expirationCheck.valid) {
      return expirationCheck;
    }

    // Tudo OK
    return {
      valid: true,
      days_remaining: expirationCheck.days_remaining,
      offline_days: offlineCheck.offline_days
    };

  } catch (error) {
    console.error("Subscription check failed:", error);
    
    // Em caso de erro, permitir acesso mas registrar
    return {
      valid: true,
      message: "Erro ao verificar subscrição (modo degradado)"
    };
  }
}

/**
 * Atualiza lease após conexão online (sincronização com servidor)
 */
export async function updateLease(data: {
  subscription_end: string;
  subscription_status: string;
  company_id: string;
}): Promise<void> {
  const now = new Date().toISOString();

  const lease: SubscriptionLease = {
    subscription_end: data.subscription_end,
    last_known_server_date: now,
    max_offline_days: MAX_OFFLINE_DAYS,
    last_online_sync: now,
    company_id: data.company_id,
    subscription_status: data.subscription_status,
  };

  await secureSet(LEASE_KEY, lease);
}

/**
 * Remove lease (útil no logout)
 */
export async function clearLease(): Promise<void> {
  secureRemove(LEASE_KEY);
}

/**
 * Busca lease do storage
 */
export async function getLease(): Promise<SubscriptionLease | null> {
  return await secureGet<SubscriptionLease>(LEASE_KEY);
}

// ================================================================
// VALIDATION CHECKS
// ================================================================

/**
 * 1. Anti-Fraude: Detecta mudança de data no dispositivo
 */
function detectDateFraud(lease: SubscriptionLease): SubscriptionCheckResult {
  const currentDate = new Date();
  const lastKnownDate = new Date(lease.last_known_server_date);

  // Se data atual é ANTERIOR à última data conhecida do servidor,
  // significa que o usuário mudou o relógio para o passado
  if (currentDate < lastKnownDate) {
    const daysDiff = Math.floor((lastKnownDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      valid: false,
      reason: "fraud_detected",
      message: `Fraude detectada: Data do dispositivo está ${daysDiff} dia(s) no passado. Conecte-se à internet para validar.`
    };
  }

  return { valid: true };
}

/**
 * 2. Verifica limite de dias offline
 */
function checkOfflineLimit(lease: SubscriptionLease): SubscriptionCheckResult {
  const currentDate = new Date();
  const lastSyncDate = new Date(lease.last_online_sync);

  const offlineDays = Math.floor((currentDate.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24));

  // Se passou do limite de dias offline
  if (offlineDays > lease.max_offline_days) {
    return {
      valid: false,
      reason: "offline_limit",
      message: `Você está offline há ${offlineDays} dias. Conecte-se à internet para continuar usando o sistema.`,
      offline_days: offlineDays
    };
  }

  return {
    valid: true,
    offline_days: offlineDays
  };
}

/**
 * 3. Verifica se subscrição expirou
 */
function checkExpiration(lease: SubscriptionLease): SubscriptionCheckResult {
  const currentDate = new Date();
  const expirationDate = new Date(lease.subscription_end);

  // Calcular dias restantes
  const daysRemaining = Math.floor((expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

  // Se já expirou
  if (currentDate > expirationDate) {
    // Período de graça (24h após expiração para sincronizar pagamento)
    const hoursExpired = Math.floor((currentDate.getTime() - expirationDate.getTime()) / (1000 * 60 * 60));

    if (hoursExpired > GRACE_PERIOD_HOURS) {
      return {
        valid: false,
        reason: "expired",
        message: "Sua subscrição expirou. Renove para continuar usando o sistema.",
        days_remaining: daysRemaining
      };
    }

    // Dentro do período de graça
    return {
      valid: true,
      days_remaining: 0,
      message: "Subscrição em período de graça. Renove o quanto antes."
    };
  }

  // Avisos de expiração próxima
  if (daysRemaining <= 7) {
    return {
      valid: true,
      days_remaining: daysRemaining,
      message: `Sua subscrição expira em ${daysRemaining} dia(s). Renove para evitar interrupções.`
    };
  }

  return {
    valid: true,
    days_remaining: daysRemaining
  };
}

// ================================================================
// HELPERS
// ================================================================

/**
 * Verifica se subscrição está próxima de expirar (avisos)
 */
export function shouldShowExpirationWarning(daysRemaining?: number): boolean {
  if (!daysRemaining) return false;
  return daysRemaining <= 7 && daysRemaining > 0;
}

/**
 * Verifica se está em período de graça
 */
export function isInGracePeriod(daysRemaining?: number): boolean {
  if (!daysRemaining) return false;
  return daysRemaining === 0;
}

/**
 * Formata mensagem de expiração
 */
export function formatExpirationMessage(result: SubscriptionCheckResult): string {
  if (!result.valid) {
    return result.message || "Subscrição inválida";
  }

  if (result.days_remaining === undefined) {
    return "Subscrição ativa";
  }

  if (result.days_remaining === 0) {
    return "⚠️ Subscrição em período de graça";
  }

  if (result.days_remaining <= 7) {
    return `⚠️ Expira em ${result.days_remaining} dia(s)`;
  }

  return `✓ Ativa (${result.days_remaining} dias)`;
}

/**
 * Cor do badge baseado no status
 */
export function getSubscriptionBadgeColor(result: SubscriptionCheckResult): string {
  if (!result.valid) return "red";
  
  if (result.days_remaining === undefined) return "green";
  
  if (result.days_remaining === 0) return "orange";
  
  if (result.days_remaining <= 3) return "red";
  
  if (result.days_remaining <= 7) return "yellow";
  
  return "green";
}

// ================================================================
// SYNC STATUS
// ================================================================

/**
 * Atualiza timestamp de última sincronização online
 */
export async function updateLastSync(): Promise<void> {
  const lease = await getLease();
  if (!lease) return;

  lease.last_online_sync = new Date().toISOString();
  lease.last_known_server_date = new Date().toISOString();

  await secureSet(LEASE_KEY, lease);
}

/**
 * Retorna informações de status offline
 */
export async function getOfflineStatus(): Promise<{
  offline_days: number;
  max_offline_days: number;
  can_work_offline: boolean;
}> {
  const lease = await getLease();
  
  if (!lease) {
    return {
      offline_days: 0,
      max_offline_days: MAX_OFFLINE_DAYS,
      can_work_offline: false
    };
  }

  const currentDate = new Date();
  const lastSyncDate = new Date(lease.last_online_sync);
  const offlineDays = Math.floor((currentDate.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    offline_days: offlineDays,
    max_offline_days: lease.max_offline_days,
    can_work_offline: offlineDays <= lease.max_offline_days
  };
}
