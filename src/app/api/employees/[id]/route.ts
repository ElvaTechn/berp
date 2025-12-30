
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const id = (await params).id;
        const data = await request.json();

        // Get employee to check if has linked User
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
        }

        // Update employee basic info
        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: {
                full_name: data.full_name,
                email: data.email?.toLowerCase() || employee.email,
                role: data.role?.toUpperCase() || employee.role,
                is_active: data.is_active !== undefined ? data.is_active : employee.is_active
            }
        });

        // If has linked User, update User too
        if (employee.user) {
            const updateData: any = {
                full_name: data.full_name,
                role: data.role?.toUpperCase() || employee.user.role,
                is_active: data.is_active !== undefined ? data.is_active : employee.user.is_active
            };

            // Update email if changed
            if (data.email && data.email.toLowerCase() !== employee.user.email) {
                updateData.email = data.email.toLowerCase();
            }

            // Update password if provided
            if (data.password && data.password.length >= 6) {
                updateData.password = await bcrypt.hash(data.password, 12);
            }

            await prisma.user.update({
                where: { id: employee.user.id },
                data: updateData
            });
        }

        return NextResponse.json(updatedEmployee);
    } catch (error: any) {
        logger.error('Failed to update employee', { error: error.message });
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }
}

// New endpoint: Create login for existing employee
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const id = (await params).id;
        const data = await request.json();

        // Check if password was provided
        if (!data.password || data.password.length < 6) {
            return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 });
        }

        // Get employee
        const employee = await prisma.employee.findUnique({
            where: { id }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
        }

        // Check if already has login
        if (employee.user_id) {
            return NextResponse.json({ error: 'Este funcionário já possui conta de login' }, { status: 400 });
        }

        // Check if User already exists with this email
        const existingUser = await prisma.user.findFirst({
            where: { email: employee.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Já existe uma conta com este email' }, { status: 409 });
        }

        // Create User account using transaction
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    full_name: employee.full_name,
                    email: employee.email,
                    password: hashedPassword,
                    role: employee.role,
                    is_active: employee.is_active
                }
            });

            const updatedEmployee = await tx.employee.update({
                where: { id },
                data: { user_id: user.id }
            });

            return { user, employee: updatedEmployee };
        });

        logger.info('Login account created for existing employee', {
            employeeId: employee.id,
            userId: result.user.id,
            requesterId: session.userId
        });

        return NextResponse.json({
            success: true,
            employee: result.employee,
            user: {
                id: result.user.id,
                email: result.user.email
            }
        });
    } catch (error: any) {
        logger.error('Failed to create login for employee', { error: error.message });
        return NextResponse.json({ error: 'Failed to create login for employee' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;

        // Get employee first
        const employee = await prisma.employee.findUnique({
            where: { id }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
        }

        // Delete user if exists
        if (employee.user_id) {
            await prisma.user.delete({
                where: { id: employee.user_id }
            });
        }

        // Delete employee
        await prisma.employee.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}
