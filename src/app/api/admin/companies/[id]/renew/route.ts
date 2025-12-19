// src/app/api/admin/companies/[id]/renew/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { renewSubscription } from '@/services/admin-service';
import { getClientIP } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { id: companyId } = await params;
        const body = await request.json();
        const ipAddress = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        const days = body.days || 30; // Default: 30 dias

        if (days < 1 || days > 365) {
            return NextResponse.json(
                { error: 'Dias deve estar entre 1 e 365' },
                { status: 400 }
            );
        }

        const result = await renewSubscription(
            companyId,
            days,
            session.userId,
            ipAddress,
            userAgent
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Subscrição renovada por ${days} dias`,
            newEndDate: result.newEndDate,
        });
    } catch (error) {
        logger.error('Error renewing subscription', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao renovar subscrição' },
            { status: 500 }
        );
    }
}
