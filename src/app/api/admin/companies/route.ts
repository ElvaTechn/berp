// src/app/api/admin/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { registerNewCompany, listCompanies } from '@/services/admin-service';
import { getClientIP } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

// GET - Listar empresas
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') || undefined;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const result = await listCompanies({ search, status, limit, offset });

        return NextResponse.json({
            success: true,
            companies: result.companies,
            total: result.total,
            limit,
            offset,
        });
    } catch (error) {
        logger.error('Error listing companies', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao listar empresas' },
            { status: 500 }
        );
    }
}

// POST - Criar nova empresa
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const body = await request.json();
        const ipAddress = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        // Validar campos obrigatórios
        const requiredFields = ['companyName', 'nuit', 'ownerName', 'ownerEmail', 'ownerPassword'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Campo obrigatório: ${field}` },
                    { status: 400 }
                );
            }
        }

        const result = await registerNewCompany(
            {
                companyName: body.companyName,
                nuit: body.nuit,
                address: body.address,
                phone: body.phone,
                companyEmail: body.companyEmail,
                businessSector: body.businessSector,
                ownerName: body.ownerName,
                ownerEmail: body.ownerEmail,
                ownerPassword: body.ownerPassword,
                subscriptionType: body.subscriptionType,
                trialDays: body.trialDays,
            },
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
            company: result.company,
            user: result.user,
            message: 'Empresa criada com sucesso!',
        });
    } catch (error) {
        logger.error('Error creating company', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao criar empresa' },
            { status: 500 }
        );
    }
}
