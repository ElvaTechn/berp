// src/app/api/reservations/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { cancelReservation } from '@/services/reservation-service';
import { logger } from '@/lib/logger';

// POST - Cancelar reserva (devolver stock)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { id: reservationId } = await params;

        // Buscar employee
        const employee = await prisma.employee.findFirst({
            where: { user_id: session.userId },
            select: { id: true, company_id: true },
        });

        if (!employee) {
            return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
        }

        // Verificar se a reserva pertence à empresa
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            select: { company_id: true },
        });

        if (!reservation) {
            return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
        }

        if (reservation.company_id !== employee.company_id) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));

        const result = await cancelReservation(reservationId, body.reason);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Reserva cancelada. Stock devolvido ao inventário.',
        });
    } catch (error) {
        logger.error('Error cancelling reservation', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao cancelar reserva' },
            { status: 500 }
        );
    }
}
