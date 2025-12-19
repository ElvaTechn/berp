// src/app/api/reservations/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { completeReservation } from '@/services/reservation-service';
import { logger } from '@/lib/logger';

// POST - Completar reserva (converter em venda)
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
        const paymentMethod = body.paymentMethod || 'DINHEIRO';

        const result = await completeReservation(
            reservationId,
            employee.id,
            paymentMethod
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            sale: result.sale,
            message: 'Reserva convertida em venda com sucesso!',
        });
    } catch (error) {
        logger.error('Error completing reservation', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao completar reserva' },
            { status: 500 }
        );
    }
}
