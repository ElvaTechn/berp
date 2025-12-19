import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getAuditLogs, getAuditStats, AUDIT_ACTIONS } from '@/lib/audit-log';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || undefined;
    const resource = searchParams.get('resource') || undefined;
    const success = searchParams.get('success');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const filters: {
      action?: string;
      resource?: string;
      success?: boolean;
      startDate?: Date;
      endDate?: Date;
      limit: number;
      offset: number;
    } = {
      limit,
      offset,
    };

    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (success !== null && success !== '') {
      filters.success = success === 'true';
    }
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.endDate = end;
    }

    const [logsResult, statsResult, totalCount] = await Promise.all([
      getAuditLogs(filters),
      getAuditStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
      prisma.auditLog.count({
        where: {
          ...(filters.action && { action: filters.action }),
          ...(filters.resource && { resource: filters.resource }),
          ...(filters.success !== undefined && { success: filters.success }),
          ...(filters.startDate && { timestamp: { gte: filters.startDate } }),
          ...(filters.endDate && { timestamp: { lte: filters.endDate } }),
        },
      }),
    ]);

    if (!logsResult.success) {
      return NextResponse.json(
        { success: false, error: logsResult.error },
        { status: 500 }
      );
    }

    const totalActions = statsResult.success
      ? statsResult.data?.actions.reduce((acc, curr) => acc + curr.count, 0) || 0
      : 0;

    const totalErrors = statsResult.success
      ? statsResult.data?.errors.reduce((acc, curr) => acc + curr.count, 0) || 0
      : 0;

    const availableActions = Object.values(AUDIT_ACTIONS);
    const availableResources = ['AUTH', 'SALE', 'PRODUCT', 'EMPLOYEE', 'COMPANY', 'CATEGORY', 'RESERVATION', 'SYSTEM'];

    return NextResponse.json({
      success: true,
      data: {
        logs: logsResult.data,
        stats: {
          totalActions,
          totalErrors,
          successRate: totalActions > 0 ? ((totalActions - totalErrors) / totalActions * 100).toFixed(1) : '100',
          actionBreakdown: statsResult.data?.actions || [],
          errorBreakdown: statsResult.data?.errors || [],
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1,
        },
        filters: {
          availableActions,
          availableResources,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch audit logs:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar logs de auditoria' },
      { status: 500 }
    );
  }
}
