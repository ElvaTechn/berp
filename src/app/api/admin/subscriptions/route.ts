import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscription_status: true,
        subscription_type: true,
        subscription_end: true,
        created_at: true,
        _count: {
          select: {
            employees: true,
            products: true,
            sales: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Calculate stats
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: companies.length,
      active: companies.filter(c => c.subscription_status === 'ACTIVE').length,
      inactive: companies.filter(c => c.subscription_status === 'SUSPENDED' || c.subscription_status === 'CANCELLED').length,
      pending: companies.filter(c => c.subscription_status === 'TRIAL').length,
      expiring: companies.filter(c => {
        if (!c.subscription_end) return false;
        const endDate = new Date(c.subscription_end);
        return endDate > now && endDate <= sevenDaysFromNow;
      }).length,
      expired: companies.filter(c => {
        if (!c.subscription_end) return false;
        return new Date(c.subscription_end) < now;
      }).length,
    };

    return NextResponse.json({
      companies,
      stats
    });

  } catch (error) {
    logger.error('Error fetching subscriptions:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
