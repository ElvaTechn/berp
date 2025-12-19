// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getAdminStats } from '@/services/admin-service';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticação e role ADMIN
        const session = await getSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        if (session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const stats = await getAdminStats();

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        logger.error('Error fetching admin stats', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao carregar estatísticas' },
            { status: 500 }
        );
    }
}
