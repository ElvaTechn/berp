
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const company = await prisma.company.findUnique({
            where: { id }
        });
        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }
        return NextResponse.json(company);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const data = await request.json();
const company = await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email,
                nuit: data.nuit,
                subscription_status: data.subscription_status,
                subscription_type: data.subscription_type,
                business_sector: data.business_sector
            }
        });
        return NextResponse.json(company);
    } catch (error) {
        logger.error('Failed to update company', { error });
        return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await prisma.company.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
    }
}
