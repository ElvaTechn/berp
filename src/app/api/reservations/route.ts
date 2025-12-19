
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');

    const where: Prisma.ReservationWhereInput = {};
    if (companyId) where.company_id = companyId;

    try {
        const reservations = await prisma.reservation.findMany({
            where,
            include: { product: true },
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json(reservations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { items, ...resData } = data;

        // For now, use the first item if items array is provided
        // TODO: Support multiple items per reservation
        const firstItem = items && items.length > 0 ? items[0] : resData;

        const reservation = await prisma.reservation.create({
            data: {
                company_id: resData.company_id,
                employee_id: resData.employee_id,
                product_id: firstItem.product_id || resData.product_id,
                customer_name: resData.customer_name,
                customer_bi: resData.customer_bi,
                customer_phone: resData.customer_phone,
                quantity: parseInt(firstItem.quantity || resData.quantity),
                expires_at: new Date(resData.expiry_date || resData.expires_at),
                status: resData.status || 'pendente',
                notes: resData.notes
            } as any
        });

        return NextResponse.json(reservation, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
    }
}
