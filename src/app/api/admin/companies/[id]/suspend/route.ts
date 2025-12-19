// src/app/api/admin/companies/[id]/suspend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { suspendCompany } from '@/services/admin-service';
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
        const body = await request.json().catch(() => ({}));
        const ipAddress = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        const result = await suspendCompany(
            companyId,
            session.userId,
            ipAddress,
            userAgent,
            body.reason
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Empresa suspensa com sucesso',
        });
    } catch (error) {
        logger.error('Error suspending company', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao suspender empresa' },
            { status: 500 }
        );
    }
}
