
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const companies = await prisma.company.findMany();
        return NextResponse.json(companies);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.name || !data.owner_id) {
            // If owner_id is missing, we might need to create a User first or expect one.
            // For simplicity API access, we might need a robust way.
            // But mostly this endpoint might be for admin init.
            return NextResponse.json({ error: 'Name and owner_id are required' }, { status: 400 });
        }

const company = await prisma.company.create({
            data: {
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email,
                nuit: data.nuit,
                owner_id: data.owner_id,
                subscription_status: data.subscription_status || 'pendente',
                subscription_type: data.subscription_type || 'mensal',
                business_sector: data.business_sector
            }
        });

        return NextResponse.json(company, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }
}
