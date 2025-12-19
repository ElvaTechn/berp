
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

// Helper to get user info from headers (set by middleware)
function getUserFromRequest(request: NextRequest) {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userEmail = request.headers.get('x-user-email');
    return { userId, userRole, userEmail };
}

export async function GET(request: NextRequest) {
    try {
        const { userId } = getUserFromRequest(request);

        if (!userId) {
            return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        }

        // Determine company from logged in user's employee record
        const requester = await prisma.employee.findFirst({
            where: { user_id: userId },
            select: { company_id: true }
        });

        if (!requester) {
            return NextResponse.json({ error: 'Employee profile not found' }, { status: 403 });
        }

        // Force company_id filter
        const where: Prisma.EmployeeWhereInput = {
            company_id: requester.company_id
        };

        // Optional search params
        const searchParams = request.nextUrl.searchParams;
        const userEmail = searchParams.get('user_email');
        if (userEmail) where.email = userEmail;

        const employees = await prisma.employee.findMany({
            where,
            include: {
                company: true
            }
        });
        return NextResponse.json(employees);
    } catch (error) {
        logger.error('Failed to fetch employees', { error });
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, userRole } = getUserFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        }

        // Only gestor/admin can create employees
        if (userRole !== 'gestor' && userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get requester's company
        const requester = await prisma.employee.findFirst({
            where: { user_id: userId },
            select: { company_id: true }
        });

        if (!requester?.company_id) {
            return NextResponse.json({ error: 'Company not found' }, { status: 400 });
        }

        const data = await request.json();

        // Check duplicate
        const existing = await prisma.employee.findFirst({
            where: {
                email: data.email,
                company_id: requester.company_id
            }
        });
        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Removed 'phone' as it is not in the schema
        const employee = await prisma.employee.create({
            data: {
                full_name: data.full_name,
                email: data.user_email || data.email,
                role: data.role,
                company_id: requester.company_id
                // user_id: optional, can be linked later if they have a User account
            }
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        logger.error('Failed to create employee', { error });
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}
