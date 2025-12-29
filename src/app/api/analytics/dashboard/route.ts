/**
 * ================================================================
 * ANALYTICS DASHBOARD API - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Endpoint para buscar métricas e dados do dashboard
 * 
 * GET /api/analytics/dashboard
 * 
 * MÉTRICAS RETORNADAS:
 * - KPIs (Hoje vs Ontem): Revenue, Profit, Count, Avg Ticket, Margin %
 * - Tendência (7 dias): Revenue e Profit por dia
 * - Top 5 Produtos: Mais vendidos por valor
 * - Alertas de Inventário: Produtos com stock baixo
 * - Distribuição de Pagamentos: Por método
 * 
 * SEGURANÇA:
 * - Requer autenticação
 * - Filtra por company_id do usuário
 * - Rate limiting aplicado
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { enhancedRateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { AnalyticsService } from '@/services/analytics-service';

// ================================================================
// GET /api/analytics/dashboard - Buscar Dashboard Completo
// ================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ============================================================
    // 1. RATE LIMITING (Proteção contra abuso)
    // ============================================================
    const rateLimitResult = await enhancedRateLimit(request, 'api');
    
    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for analytics', {
        retryAfter: rateLimitResult.retryAfter
      });

      return NextResponse.json(
        { 
          success: false, 
          error: rateLimitResult.message,
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          }
        }
      );
    }

    // ============================================================
    // 2. AUTENTICAÇÃO (Verificar sessão)
    // ============================================================
    const session = await getSession();
    
    if (!session) {
      logger.warn('Unauthenticated analytics request');
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // ============================================================
    // 3. AUTORIZAÇÃO (Buscar employee e company)
    // ============================================================
    
    // Primeiro tenta encontrar employees ativos
    let employee = await prisma.employee.findFirst({
      where: {
        user_id: session.userId,
        is_active: true
      },
      select: {
        id: true,
        company_id: true,
        role: true,
        full_name: true
      }
    });

    // Se não encontrou como employee, tenta se é dono de alguma empresa
    if (!employee) {
      const company = await prisma.company.findFirst({
        where: {
          owner_id: session.userId
        },
        select: {
          id: true
        }
      });

      if (company) {
        // Criar employee temporário para o dono com role GESTOR
        try {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { full_name: true, email: true }
          });

          if (user) {
            employee = {
              id: 'owner-' + session.userId,
              company_id: company.id,
              role: 'GESTOR',
              full_name: user.full_name
            };
          }
        } catch (err) {
          // Se falhar, continua sem employee
        }
      }
    }

    if (!employee) {
      logger.warn('Employee not found for analytics', {
        user_id: session.userId
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Configuração incompleta',
          requiresSetup: true,
          message: 'Sua conta ainda não está configurada como funcionário. Por favor, configure sua empresa primeiro.'
        },
        { status: 404 }
      );
    }

    // ============================================================
    // 4. BUSCAR DADOS DO DASHBOARD
    // ============================================================
    const dashboardData = await AnalyticsService.getDashboardData(
      employee.company_id
    );

    const duration = Date.now() - startTime;

    logger.info('Dashboard analytics served', {
      company_id: employee.company_id,
      employee_id: employee.id,
      duration_ms: duration
    });

    // ============================================================
    // 5. AUDITORIA (Opcional - comentado por performance)
    // ============================================================
    // Comentado porque analytics pode ser chamado frequentemente
    // Descomente se precisar auditar acessos ao dashboard
    /*
    await prisma.auditLog.create({
      data: {
        action: 'ANALYTICS_VIEW',
        resource: 'Dashboard',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        success: true,
        user_id: session.userId,
        employee_id: employee.id,
        company_id: employee.company_id
      }
    }).catch(err => {
      logger.error('Audit log failed', { error: err.message });
    });
    */

    // ============================================================
    // 6. RESPOSTA
    // ============================================================
    const response = NextResponse.json({
      success: true,
      data: dashboardData,
      meta: {
        generated_at: new Date().toISOString(),
        duration_ms: duration,
        company_id: employee.company_id
      }
    });

    // Cache headers (5 minutos)
    response.headers.set('Cache-Control', 'private, max-age=300');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const duration = Date.now() - startTime;
    
    logger.error('Analytics dashboard failed', {
      error: errorMessage,
      duration_ms: duration
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar dados do dashboard. Tente novamente.'
      },
      { status: 500 }
    );
  }
}
