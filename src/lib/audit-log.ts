import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface AuditLogData {
  userId?: string;
  employeeId?: string;
  companyId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: any;
  success: boolean;
  error?: string;
}

// Create audit log
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: data.userId,
        employee_id: data.employeeId,
        company_id: data.companyId,
        action: data.action,
        resource: data.resource,
        resource_id: data.resourceId,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        success: data.success,
        error: data.error,
        details: data.details ? JSON.stringify(data.details) : null
      }
    });

    logger.info('Audit log created', {
      action: data.action,
      userId: data.userId,
      success: data.success,
      ip: data.ipAddress
    });

  } catch (error) {
    logger.error('Failed to create audit log', { error, data });
    // Don't throw error to avoid breaking the main flow
  }
}

// Middleware to create audit logs from requests
export function createAuditMiddleware(request: NextRequest) {
  return {
    userId: (request as any).userId,
    employeeId: (request as any).employeeId,
    companyId: (request as any).companyId,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'Unknown',
    timestamp: new Date()
  };
}

// Get client IP safely
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'Unknown';
}

// Audit actions constants
export const AUDIT_ACTIONS = {
  // Auth actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // Sales actions
  SALE_CREATE: 'SALE_CREATE',
  SALE_UPDATE: 'SALE_UPDATE',
  SALE_DELETE: 'SALE_DELETE',
  SALE_SYNC: 'SALE_SYNC',
  
  // Product actions
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  PRODUCT_PRICE_CHANGE: 'PRODUCT_PRICE_CHANGE',
  PRODUCT_STOCK_CHANGE: 'PRODUCT_STOCK_CHANGE',
  
  // Employee actions
  EMPLOYEE_CREATE: 'EMPLOYEE_CREATE',
  EMPLOYEE_UPDATE: 'EMPLOYEE_UPDATE',
  EMPLOYEE_DELETE: 'EMPLOYEE_DELETE',
  EMPLOYEE_ROLE_CHANGE: 'EMPLOYEE_ROLE_CHANGE',
  
  // Company actions
  COMPANY_CREATE: 'COMPANY_CREATE',
  COMPANY_UPDATE: 'COMPANY_UPDATE',
  COMPANY_DELETE: 'COMPANY_DELETE',
  
  // Category actions
  CATEGORY_CREATE: 'CATEGORY_CREATE',
  CATEGORY_UPDATE: 'CATEGORY_UPDATE',
  CATEGORY_DELETE: 'CATEGORY_DELETE',
  
  // Reservation actions
  RESERVATION_CREATE: 'RESERVATION_CREATE',
  RESERVATION_UPDATE: 'RESERVATION_UPDATE',
  RESERVATION_DELETE: 'RESERVATION_DELETE',
  
  // System actions
  BACKUP_CREATE: 'BACKUP_CREATE',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

// Helper functions for common audit operations
export async function auditAuthAction(
  action: string,
  request: NextRequest,
  userId: string,
  success: boolean,
  error?: string,
  details?: any
) {
  const auditData = createAuditMiddleware(request);
  await createAuditLog({
    ...auditData,
    userId,
    action,
    resource: 'AUTH',
    success,
    error,
    details
  });
}

export async function auditSaleAction(
  action: string,
  request: NextRequest,
  saleData: any,
  success: boolean,
  error?: string
) {
  const auditData = createAuditMiddleware(request);
  await createAuditLog({
    ...auditData,
    action,
    resource: 'SALE',
    resourceId: saleData.id,
    details: {
      total: saleData.total,
      itemsCount: saleData.items?.length || 0,
      paymentMethod: saleData.payment_method
    },
    success,
    error
  });
}

export async function auditProductAction(
  action: string,
  request: NextRequest,
  productData: any,
  success: boolean,
  error?: string
) {
  const auditData = createAuditMiddleware(request);
  await createAuditLog({
    ...auditData,
    action,
    resource: 'PRODUCT',
    resourceId: productData.id,
    details: {
      name: productData.name,
      price: productData.price,
      quantity: productData.quantity,
      categoryId: productData.category_id
    },
    success,
    error
  });
}

export async function auditSystemAction(
  action: string,
  request: NextRequest,
  details?: any,
  success: boolean = true,
  error?: string
) {
  const auditData = createAuditMiddleware(request);
  await createAuditLog({
    ...auditData,
    action,
    resource: 'SYSTEM',
    details,
    success,
    error
  });
}

// Query audit logs
export async function getAuditLogs(filters: {
  companyId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    const { limit = 50, offset = 0, ...otherFilters } = filters;
    
    const logs = await prisma.auditLog.findMany({
      where: {
        ...otherFilters,
        ...(otherFilters.startDate && {
          timestamp: { gte: otherFilters.startDate }
        }),
        ...(otherFilters.endDate && {
          timestamp: { lte: otherFilters.endDate }
        })
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { id: true, full_name: true, email: true }
        },
        employee: {
          select: { id: true, full_name: true, email: true }
        },
        company: {
          select: { id: true, name: true }
        }
      }
    });

    return { success: true, data: logs };
  } catch (error) {
    logger.error('Failed to get audit logs', { error, filters });
    return { success: false, error: 'Failed to retrieve audit logs' };
  }
}

// Get audit statistics
export async function getAuditStats(filters: {
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const stats = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        ...filters,
        success: true
      },
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    });

    // Get error stats
    const errorStats = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        ...filters,
        success: false
      },
      _count: {
        action: true
      }
    });

    return {
      success: true,
      data: {
        actions: stats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        })),
        errors: errorStats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        }))
      }
    };
  } catch (error) {
    logger.error('Failed to get audit stats', { error, filters });
    return { success: false, error: 'Failed to retrieve audit statistics' };
  }
}

// Clean old audit logs (should be run periodically)
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    logger.info('Old audit logs cleaned up', {
      cutoffDate,
      deletedCount: result.count
    });
  } catch (error) {
    logger.error('Failed to cleanup old audit logs', { error, daysToKeep });
  }
}