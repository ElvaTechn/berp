// src/app/api/reservations/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { getReservationStats } from '@/services/reservation-service';
import { logger } from '@/lib/logger';

// GET - Estatísticas de reservas
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar employee para obter company_id
        const employee = await prisma.employee.findFirst({
            where: { user_id: session.userId },
            select: { company_id: true },
        });

        if (!employee) {
            return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
        }

        const stats = await getReservationStats(employee.company_id);

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        logger.error('Error fetching reservation stats', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao carregar estatísticas' },
            { status: 500 }
        );
    }
}
