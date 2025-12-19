// src/app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { createReservation, listReservations, getReservationStats } from '@/services/reservation-service';
import { logger } from '@/lib/logger';

// GET - Listar reservas
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

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') || undefined;
        const includeStats = searchParams.get('stats') === 'true';

        const result = await listReservations({
            companyId: employee.company_id,
            search,
            status,
        });

        // Opcionalmente incluir estatísticas
        let stats = null;
        if (includeStats) {
            stats = await getReservationStats(employee.company_id);
        }

        return NextResponse.json({
            success: true,
            reservations: result.reservations,
            total: result.total,
            stats,
        });
    } catch (error) {
        logger.error('Error fetching reservations', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao carregar reservas' },
            { status: 500 }
        );
    }
}

// POST - Criar nova reserva
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar employee
        const employee = await prisma.employee.findFirst({
            where: { user_id: session.userId },
            select: { id: true, company_id: true },
        });

        if (!employee) {
            return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
        }

        const body = await request.json();

        // Validar campos obrigatórios
        if (!body.productId) {
            return NextResponse.json({ error: 'Produto é obrigatório' }, { status: 400 });
        }

        if (!body.customerName) {
            return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 });
        }

        if (!body.quantity || body.quantity < 1) {
            return NextResponse.json({ error: 'Quantidade deve ser pelo menos 1' }, { status: 400 });
        }

        const result = await createReservation({
            companyId: employee.company_id,
            employeeId: employee.id,
            productId: body.productId,
            quantity: parseInt(body.quantity),
            customerName: body.customerName,
            customerBI: body.customerBI,
            customerPhone: body.customerPhone,
            depositAmount: body.depositAmount ? parseFloat(body.depositAmount) : undefined,
            notes: body.notes,
            expiresInHours: body.expiresInHours ? parseInt(body.expiresInHours) : 48,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            reservation: result.reservation,
            message: 'Reserva criada com sucesso! Stock atualizado.',
        });
    } catch (error) {
        logger.error('Error creating reservation', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao criar reserva' },
            { status: 500 }
        );
    }
}
