// src/lib/audit-log.ts
// Sistema de Auditoria para rastrear todas as ações administrativas

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Tipos de ações que podem ser auditadas
export const AUDIT_ACTIONS = {
    // Autenticação
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    LOGIN_FAILED: 'LOGIN_FAILED',
    
    // Empresas
    COMPANY_CREATE: 'COMPANY_CREATE',
    COMPANY_UPDATE: 'COMPANY_UPDATE',
    COMPANY_DELETE: 'COMPANY_DELETE',
    
    // Subscrições
    SUBSCRIPTION_CREATE: 'SUBSCRIPTION_CREATE',
    SUBSCRIPTION_UPDATE: 'SUBSCRIPTION_UPDATE',
    SUBSCRIPTION_SUSPEND: 'SUBSCRIPTION_SUSPEND',
    SUBSCRIPTION_RENEW: 'SUBSCRIPTION_RENEW',
    SUBSCRIPTION_CANCEL: 'SUBSCRIPTION_CANCEL',
    
    // Utilizadores
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    USER_DELETE: 'USER_DELETE',
    USER_SUSPEND: 'USER_SUSPEND',
    USER_ACTIVATE: 'USER_ACTIVATE',
    
    // Funcionários
    EMPLOYEE_CREATE: 'EMPLOYEE_CREATE',
    EMPLOYEE_UPDATE: 'EMPLOYEE_UPDATE',
    EMPLOYEE_DELETE: 'EMPLOYEE_DELETE',
    
    // Produtos
    PRODUCT_CREATE: 'PRODUCT_CREATE',
    PRODUCT_UPDATE: 'PRODUCT_UPDATE',
    PRODUCT_DELETE: 'PRODUCT_DELETE',
    
    // Vendas
    SALE_CREATE: 'SALE_CREATE',
    SALE_VOID: 'SALE_VOID',
    
    // Admin Actions
    ADMIN_IMPERSONATE: 'ADMIN_IMPERSONATE', // Admin entrou como cliente
    ADMIN_VIEW_DASHBOARD: 'ADMIN_VIEW_DASHBOARD',
    
    // Sistema
    SYSTEM_BACKUP: 'SYSTEM_BACKUP',
    SYSTEM_RESTORE: 'SYSTEM_RESTORE',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// Recursos que podem ser auditados
export const AUDIT_RESOURCES = {
    USER: 'USER',
    COMPANY: 'COMPANY',
    EMPLOYEE: 'EMPLOYEE',
    PRODUCT: 'PRODUCT',
    CATEGORY: 'CATEGORY',
    SALE: 'SALE',
    RESERVATION: 'RESERVATION',
    SUBSCRIPTION: 'SUBSCRIPTION',
    SYSTEM: 'SYSTEM',
} as const;

export type AuditResource = typeof AUDIT_RESOURCES[keyof typeof AUDIT_RESOURCES];

interface CreateAuditLogParams {
    userId?: string;
    employeeId?: string;
    companyId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress: string;
    userAgent: string;
    success?: boolean;
    error?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    details?: Record<string, unknown>;
    timestamp?: Date;
}

/**
 * Cria um registo de auditoria
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                user_id: params.userId,
                employee_id: params.employeeId,
                company_id: params.companyId,
                action: params.action,
                resource: params.resource,
                resource_id: params.resourceId,
                ip_address: params.ipAddress,
                user_agent: params.userAgent,
                success: params.success ?? true,
                error: params.error,
                old_values: params.oldValues ? JSON.stringify(params.oldValues) : null,
                new_values: params.newValues ? JSON.stringify(params.newValues) : null,
                details: params.details ? JSON.stringify(params.details) : null,
                timestamp: params.timestamp ?? new Date(),
            },
        });

        // Log também para o sistema de logs
        logger.info(`Audit: ${params.action} on ${params.resource}`, {
            userId: params.userId,
            resourceId: params.resourceId,
            success: params.success ?? true,
        });
    } catch (error) {
        // Nunca falhar silenciosamente - log de auditoria é crítico
        logger.error('Failed to create audit log', {
            error: error instanceof Error ? error.message : 'Unknown error',
            params,
        });
    }
}

/**
 * Buscar logs de auditoria com filtros
 */
export async function getAuditLogs(params: {
    userId?: string;
    companyId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}) {
    const where: Record<string, unknown> = {};

    if (params.userId) where.user_id = params.userId;
    if (params.companyId) where.company_id = params.companyId;
    if (params.action) where.action = params.action;
    if (params.resource) where.resource = params.resource;

    if (params.startDate || params.endDate) {
        where.timestamp = {};
        if (params.startDate) (where.timestamp as Record<string, Date>).gte = params.startDate;
        if (params.endDate) (where.timestamp as Record<string, Date>).lte = params.endDate;
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: params.limit || 50,
            skip: params.offset || 0,
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        role: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
}

/**
 * Formatar log de auditoria para exibição
 */
export function formatAuditLog(log: {
    action: string;
    resource: string;
    resource_id?: string | null;
    old_values?: string | null;
    new_values?: string | null;
    details?: string | null;
    timestamp: Date;
    user?: { full_name: string; email: string } | null;
}) {
    const actionLabels: Record<string, string> = {
        [AUDIT_ACTIONS.COMPANY_CREATE]: 'criou empresa',
        [AUDIT_ACTIONS.COMPANY_UPDATE]: 'atualizou empresa',
        [AUDIT_ACTIONS.SUBSCRIPTION_SUSPEND]: 'suspendeu subscrição',
        [AUDIT_ACTIONS.SUBSCRIPTION_RENEW]: 'renovou subscrição',
        [AUDIT_ACTIONS.ADMIN_IMPERSONATE]: 'acedeu como cliente',
        [AUDIT_ACTIONS.USER_CREATE]: 'criou utilizador',
    };

    const label = actionLabels[log.action] || log.action.toLowerCase().replace(/_/g, ' ');

    return {
        ...log,
        actionLabel: label,
        oldValues: log.old_values ? JSON.parse(log.old_values) : null,
        newValues: log.new_values ? JSON.parse(log.new_values) : null,
        details: log.details ? JSON.parse(log.details) : null,
        formattedDate: log.timestamp.toLocaleString('pt-MZ', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
    };
}
