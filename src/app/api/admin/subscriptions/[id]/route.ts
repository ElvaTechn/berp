import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth-server';
import { logger } from '@/lib/logger';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log';
import { getClientIP } from '@/lib/rateLimit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, full_name: true, email: true }
        },
        _count: {
          select: {
            employees: true,
            products: true,
            sales: true,
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company });

  } catch (error) {
    logger.error('Error fetching company subscription:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { subscription_status, subscription_type, subscription_end } = body;

    // Validate company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, string | Date> = {};
    
    if (subscription_status) {
      updateData.subscription_status = subscription_status;
    }
    
    if (subscription_type) {
      updateData.subscription_type = subscription_type;
    }
    
    if (subscription_end) {
      updateData.subscription_end = new Date(subscription_end);
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: updateData
    });

    // Audit log
    await createAuditLog({
      userId: session.userId,
      action: 'SUBSCRIPTION_UPDATE',
      resource: 'COMPANY',
      resourceId: id,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      timestamp: new Date(),
      success: true,
      details: {
        previous: {
          status: existingCompany.subscription_status,
          type: existingCompany.subscription_type,
          end_date: existingCompany.subscription_end,
        },
        new: updateData
      }
    });

    logger.info('Subscription updated', {
      companyId: id,
      adminId: session.userId,
      changes: updateData
    });

    return NextResponse.json({
      success: true,
      company: updatedCompany
    });

  } catch (error) {
    logger.error('Error updating subscription:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
