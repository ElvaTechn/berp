import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';
import { logger } from '@/lib/logger';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log';
import { getClientIP } from '@/lib/rateLimit';

// In-memory backup history (in production, store in database or cloud)
const backupHistory: Array<{
  id: string;
  createdAt: string;
  size: string;
  records: number;
  status: 'completed' | 'failed';
  downloadUrl?: string;
}> = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      backups: backupHistory.slice(0, 10),
      lastBackup: backupHistory[0] || null
    });

  } catch (error) {
    logger.error('Error fetching backups:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Backup initiated by admin', { adminId: session.userId });

    // Fetch all data
    const [companies, users, employees, categories, products, sales, reservations] = await Promise.all([
      prisma.company.findMany({
        include: {
          owner: { select: { id: true, full_name: true, email: true } }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          created_at: true
        }
      }),
      prisma.employee.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.sale.findMany({
        include: {
          sale_items: true
        }
      }),
      prisma.reservation.findMany()
    ]);

    // Build backup object
    const backupData = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        createdBy: session.userId,
        environment: process.env.NODE_ENV || 'development',
        counts: {
          companies: companies.length,
          users: users.length,
          employees: employees.length,
          categories: categories.length,
          products: products.length,
          sales: sales.length,
          reservations: reservations.length,
        }
      },
      data: {
        companies,
        users,
        employees,
        categories,
        products,
        sales,
        reservations
      }
    };

    // Calculate size
    const jsonString = JSON.stringify(backupData);
    const sizeBytes = new Blob([jsonString]).size;
    const sizeFormatted = sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(sizeBytes / 1024).toFixed(2)} KB`;

    const totalRecords = Object.values(backupData.metadata.counts).reduce((a, b) => a + b, 0);

    // Add to history
    const backupId = `backup_${Date.now()}`;
    backupHistory.unshift({
      id: backupId,
      createdAt: new Date().toISOString(),
      size: sizeFormatted,
      records: totalRecords,
      status: 'completed'
    });

    // Keep only last 20 backups in history
    if (backupHistory.length > 20) {
      backupHistory.pop();
    }

    // Audit log
    await createAuditLog({
      userId: session.userId,
      action: AUDIT_ACTIONS.SYSTEM_BACKUP,
      resource: 'SYSTEM',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      timestamp: new Date(),
      success: true,
      details: {
        backupId,
        size: sizeFormatted,
        records: totalRecords
      }
    });

    logger.info('Backup completed', {
      backupId,
      size: sizeFormatted,
      records: totalRecords,
      adminId: session.userId
    });

    // Return backup data for download
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="berp-backup-${new Date().toISOString().split('T')[0]}.json"`,
        'X-Backup-Id': backupId,
        'X-Backup-Size': sizeFormatted,
        'X-Backup-Records': totalRecords.toString()
      }
    });

  } catch (error) {
    logger.error('Backup failed:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    backupHistory.unshift({
      id: `backup_${Date.now()}`,
      createdAt: new Date().toISOString(),
      size: '0 KB',
      records: 0,
      status: 'failed'
    });

    return NextResponse.json(
      { error: 'Backup failed' },
      { status: 500 }
    );
  }
}
