// src/services/reservation-service.ts
// Sistema de Reservas - Gestão de Stock e Conversão para Vendas

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

// ================================================================
// INTERFACES
// ================================================================

export interface CreateReservationInput {
    companyId: string;
    employeeId: string;
    productId: string;
    quantity: number;
    customerName: string;
    customerBI?: string;
    customerPhone?: string;
    depositAmount?: number;
    notes?: string;
    expiresInHours?: number; // Default: 48h
}

export interface CreateReservationResult {
    success: boolean;
    reservation?: {
        id: string;
        customerName: string;
        productName: string;
        quantity: number;
        expiresAt: Date;
    };
    error?: string;
}

export interface CompleteReservationResult {
    success: boolean;
    sale?: {
        id: string;
        total: number;
    };
    error?: string;
}

// ================================================================
// CRIAR RESERVA (com subtração de stock)
// ================================================================

export async function createReservation(
    input: CreateReservationInput
): Promise<CreateReservationResult> {
    try {
        // Validações básicas
        if (!input.customerName || input.customerName.trim().length < 2) {
            return { success: false, error: 'Nome do cliente é obrigatório' };
        }

        if (input.quantity < 1) {
            return { success: false, error: 'Quantidade deve ser pelo menos 1' };
        }

        // Calcular data de expiração (default: 48h)
        const expiresInHours = input.expiresInHours || 48;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);

        // Transação atómica: verificar stock + criar reserva + subtrair stock
        const result = await prisma.$transaction(async (tx) => {
            // 1. Verificar se produto existe e tem stock suficiente
            const product = await tx.product.findUnique({
                where: { id: input.productId },
                select: {
                    id: true,
                    name: true,
                    quantity: true,
                    price: true,
                    is_active: true,
                    company_id: true,
                },
            });

            if (!product) {
                throw new Error('Produto não encontrado');
            }

            if (!product.is_active) {
                throw new Error('Produto não está disponível');
            }

            if (product.company_id !== input.companyId) {
                throw new Error('Produto não pertence a esta empresa');
            }

            if (product.quantity < input.quantity) {
                throw new Error(`Stock insuficiente. Disponível: ${product.quantity}`);
            }

            // 2. Subtrair stock do produto
            await tx.product.update({
                where: { id: input.productId },
                data: {
                    quantity: {
                        decrement: input.quantity,
                    },
                },
            });

            // 3. Criar a reserva
            const reservation = await tx.reservation.create({
                data: {
                    customer_name: input.customerName.trim(),
                    customer_bi: input.customerBI?.trim() || null,
                    customer_phone: input.customerPhone?.trim() || null,
                    quantity: input.quantity,
                    status: 'PENDING',
                    deposit_amount: input.depositAmount 
                        ? new Prisma.Decimal(input.depositAmount) 
                        : null,
                    deposit_paid: (input.depositAmount && input.depositAmount > 0) || false,
                    notes: input.notes?.trim() || null,
                    expires_at: expiresAt,
                    product_id: input.productId,
                    company_id: input.companyId,
                    employee_id: input.employeeId,
                },
            });

            return { reservation, product };
        });

        logger.info('Reservation created', {
            reservationId: result.reservation.id,
            productId: input.productId,
            quantity: input.quantity,
            expiresAt,
        });

        return {
            success: true,
            reservation: {
                id: result.reservation.id,
                customerName: result.reservation.customer_name,
                productName: result.product.name,
                quantity: result.reservation.quantity,
                expiresAt: result.reservation.expires_at,
            },
        };
    } catch (error) {
        logger.error('Failed to create reservation', {
            error: error instanceof Error ? error.message : 'Unknown error',
            input,
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao criar reserva',
        };
    }
}

// ================================================================
// COMPLETAR RESERVA (converter em venda)
// ================================================================

export async function completeReservation(
    reservationId: string,
    employeeId: string,
    paymentMethod: string = 'DINHEIRO'
): Promise<CompleteReservationResult> {
    try {
        // Transação atómica: verificar reserva + criar venda + atualizar status
        const result = await prisma.$transaction(async (tx) => {
            // 1. Buscar reserva com produto
            const reservation = await tx.reservation.findUnique({
                where: { id: reservationId },
                include: {
                    product: true,
                },
            });

            if (!reservation) {
                throw new Error('Reserva não encontrada');
            }

            if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') {
                throw new Error(`Reserva não pode ser concluída. Status atual: ${reservation.status}`);
            }

            if (!reservation.product) {
                throw new Error('Produto da reserva não encontrado');
            }

            // 2. Calcular valores
            const unitPrice = reservation.product.price;
            const costPrice = reservation.product.cost_price || new Prisma.Decimal(0);
            const quantity = reservation.quantity;
            const subtotal = unitPrice.mul(quantity);
            const profit = unitPrice.sub(costPrice).mul(quantity);

            // 3. Criar a venda
            const sale = await tx.sale.create({
                data: {
                    subtotal: subtotal,
                    discount_amount: reservation.deposit_amount || new Prisma.Decimal(0),
                    total: subtotal.sub(reservation.deposit_amount || 0),
                    total_profit: profit,
                    payment_method: paymentMethod as any,
                    payment_status: 'PAID',
                    company_id: reservation.company_id,
                    employee_id: employeeId,
                    sale_items: {
                        create: {
                            product_id: reservation.product_id!,
                            quantity: quantity,
                            unit_price: unitPrice,
                            cost_price: costPrice,
                            subtotal: subtotal,
                            profit: profit,
                        },
                    },
                },
            });

            // 4. Atualizar status da reserva
            await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    status: 'COMPLETED',
                },
            });

            return { sale, reservation };
        });

        logger.info('Reservation completed and converted to sale', {
            reservationId,
            saleId: result.sale.id,
            total: result.sale.total.toNumber(),
        });

        return {
            success: true,
            sale: {
                id: result.sale.id,
                total: result.sale.total.toNumber(),
            },
        };
    } catch (error) {
        logger.error('Failed to complete reservation', {
            error: error instanceof Error ? error.message : 'Unknown error',
            reservationId,
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao concluir reserva',
        };
    }
}

// ================================================================
// CANCELAR RESERVA (devolver stock)
// ================================================================

export async function cancelReservation(
    reservationId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Buscar reserva
            const reservation = await tx.reservation.findUnique({
                where: { id: reservationId },
            });

            if (!reservation) {
                throw new Error('Reserva não encontrada');
            }

            if (reservation.status === 'COMPLETED') {
                throw new Error('Reserva já foi concluída e não pode ser cancelada');
            }

            if (reservation.status === 'CANCELLED') {
                throw new Error('Reserva já está cancelada');
            }

            // 2. Devolver stock ao produto
            if (reservation.product_id) {
                await tx.product.update({
                    where: { id: reservation.product_id },
                    data: {
                        quantity: {
                            increment: reservation.quantity,
                        },
                    },
                });
            }

            // 3. Atualizar status
            await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    status: 'CANCELLED',
                    notes: reason 
                        ? `${reservation.notes || ''}\n[CANCELADO]: ${reason}`.trim()
                        : reservation.notes,
                },
            });
        });

        logger.info('Reservation cancelled', { reservationId, reason });

        return { success: true };
    } catch (error) {
        logger.error('Failed to cancel reservation', {
            error: error instanceof Error ? error.message : 'Unknown error',
            reservationId,
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao cancelar reserva',
        };
    }
}

// ================================================================
// EXPIRAR RESERVAS ANTIGAS (para cron job ou trigger)
// ================================================================

export async function expireOldReservations(): Promise<{
    success: boolean;
    expiredCount: number;
    error?: string;
}> {
    try {
        const now = new Date();

        // Buscar reservas expiradas
        const expiredReservations = await prisma.reservation.findMany({
            where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
                expires_at: { lt: now },
            },
        });

        let expiredCount = 0;

        for (const reservation of expiredReservations) {
            try {
                await prisma.$transaction(async (tx) => {
                    // Devolver stock
                    if (reservation.product_id) {
                        await tx.product.update({
                            where: { id: reservation.product_id },
                            data: {
                                quantity: {
                                    increment: reservation.quantity,
                                },
                            },
                        });
                    }

                    // Marcar como expirada
                    await tx.reservation.update({
                        where: { id: reservation.id },
                        data: {
                            status: 'EXPIRED',
                            notes: `${reservation.notes || ''}\n[EXPIRADO AUTOMATICAMENTE]: ${now.toISOString()}`.trim(),
                        },
                    });
                });

                expiredCount++;
            } catch (err) {
                logger.error('Failed to expire reservation', {
                    reservationId: reservation.id,
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }

        logger.info('Expired old reservations', { expiredCount });

        return { success: true, expiredCount };
    } catch (error) {
        logger.error('Failed to expire reservations', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return {
            success: false,
            expiredCount: 0,
            error: error instanceof Error ? error.message : 'Erro ao expirar reservas',
        };
    }
}

// ================================================================
// LISTAR RESERVAS
// ================================================================

export async function listReservations(params: {
    companyId: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    const where: Prisma.ReservationWhereInput = {
        company_id: params.companyId,
    };

    if (params.status && params.status !== 'all') {
        where.status = params.status as any;
    }

    if (params.search) {
        where.OR = [
            { customer_name: { contains: params.search, mode: 'insensitive' } },
            { customer_bi: { contains: params.search, mode: 'insensitive' } },
            { customer_phone: { contains: params.search, mode: 'insensitive' } },
        ];
    }

    const [reservations, total] = await Promise.all([
        prisma.reservation.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: params.limit || 50,
            skip: params.offset || 0,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
                employee: {
                    select: {
                        id: true,
                        full_name: true,
                    },
                },
            },
        }),
        prisma.reservation.count({ where }),
    ]);

    return { reservations, total };
}

// ================================================================
// ESTATÍSTICAS DE RESERVAS
// ================================================================

export async function getReservationStats(companyId: string) {
    const now = new Date();
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

    const [pending, expiringSoon, completedToday, totalValue] = await Promise.all([
        // Reservas pendentes
        prisma.reservation.count({
            where: {
                company_id: companyId,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
        }),

        // A expirar em 24h
        prisma.reservation.count({
            where: {
                company_id: companyId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                expires_at: {
                    gte: now,
                    lte: twentyFourHoursFromNow,
                },
            },
        }),

        // Concluídas hoje
        prisma.reservation.count({
            where: {
                company_id: companyId,
                status: 'COMPLETED',
                updated_at: {
                    gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                },
            },
        }),

        // Valor total reservado
        prisma.reservation.findMany({
            where: {
                company_id: companyId,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            include: {
                product: {
                    select: { price: true },
                },
            },
        }),
    ]);

    const totalReservedValue = totalValue.reduce((sum, res) => {
        const price = res.product?.price?.toNumber() || 0;
        return sum + (price * res.quantity);
    }, 0);

    return {
        pending,
        expiringSoon,
        completedToday,
        totalReservedValue,
    };
}
