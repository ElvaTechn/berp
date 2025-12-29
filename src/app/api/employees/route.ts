
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';
import { getSession } from '@/lib/auth-server';

// Helper to get user info from headers (set by middleware)
function getUserFromRequest(request: NextRequest) {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userEmail = request.headers.get('x-user-email');
    return { userId, userRole, userEmail };
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        // Determine company from logged in user's employee record
        let requesterEmployee = await prisma.employee.findFirst({
            where: {
                user_id: session.userId,
                is_active: true
            },
            select: { company_id: true }
        });

        // Se não encontrou employee, verifica se é dono de alguma empresa
        let companyId: string | null = null;
        let hasCompany = false;

        if (!requesterEmployee) {
            // Buscar como owner
            const company = await prisma.company.findFirst({
                where: { owner_id: session.userId },
                select: { id: true, name: true }
            });

            if (company) {
                companyId = company.id;
                hasCompany = true;
                
                // Se é owner mas não tem employee record, criar automaticamente
                const ownerEmployee = await prisma.employee.findFirst({
                    where: {
                        company_id: company.id,
                        user_id: session.userId
                    }
                });

                if (!ownerEmployee) {
                    // Buscar user data para criar employee
                    const user = await prisma.user.findUnique({
                        where: { id: session.userId },
                        select: { full_name: true, email: true }
                    });

                    if (user) {
                        await prisma.employee.create({
                            data: {
                                company_id: company.id,
                                user_id: session.userId,
                                full_name: user.full_name,
                                email: user.email,
                                role: 'GESTOR',
                                is_active: true
                            }
                        });
                        logger.info('Auto-created employee record for company owner', {
                            userId: session.userId,
                            companyId: company.id
                        });
                    }
                }
            }
        } else {
            companyId = requesterEmployee.company_id;
            hasCompany = true;
        }

        if (!companyId) {
            return NextResponse.json(
                {
                    error: 'Nenhuma empresa configurada',
                    requiresSetup: true,
                    message: 'Você ainda não configurou sua empresa. Complete o cadastro da empresa primeiro.',
                    diagnostic: {
                        hasCompany,
                        hasEmployee: !!requesterEmployee,
                        userId: session.userId
                    }
                },
                { status: 404 }
            );
        }

        // Force company_id filter
        const where: Prisma.EmployeeWhereInput = {
            company_id: companyId
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
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        // Get requester's company with fallback to owner
        let requesterEmployee = await prisma.employee.findFirst({
            where: {
                user_id: session.userId,
                is_active: true
            },
            select: { company_id: true, role: true }
        });

        let companyId: string | null = null;
        let userRole: string = 'VENDEDOR';

        if (requesterEmployee) {
            companyId = requesterEmployee.company_id;
            userRole = requesterEmployee.role.toString();
        } else {
            // Buscar como owner
            const company = await prisma.company.findFirst({
                where: { owner_id: session.userId },
                select: { id: true }
            });

            if (company) {
                companyId = company.id;
                userRole = 'GESTOR'; // Dono tem permissão de GESTOR
                
                // Auto-criar employee record se não existe
                const ownerEmployee = await prisma.employee.findFirst({
                    where: {
                        company_id: company.id,
                        user_id: session.userId
                    }
                });

                if (!ownerEmployee) {
                    const user = await prisma.user.findUnique({
                        where: { id: session.userId },
                        select: { full_name: true, email: true }
                    });

                    if (user) {
                        await prisma.employee.create({
                            data: {
                                company_id: company.id,
                                user_id: session.userId,
                                full_name: user.full_name,
                                email: user.email,
                                role: 'GESTOR',
                                is_active: true
                            }
                        });
                    }
                }
            }
        }

        if (!companyId) {
            return NextResponse.json({ error: 'Nenhuma empresa configurada', requiresSetup: true }, { status: 404 });
        }

        // Only GESTOR and ADMIN can create employees
        if (userRole !== 'GESTOR' && userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Sem permissão para criar funcionários' }, { status: 403 });
        }

        const data = await request.json();

        // Check duplicate
        const existing = await prisma.employee.findFirst({
            where: {
                email: data.email,
                company_id: companyId
            }
        });
        if (existing) {
            return NextResponse.json({ error: 'Email já existe' }, { status: 400 });
        }

        // Create employee
        const newEmployee = await prisma.employee.create({
            data: {
                full_name: data.full_name,
                email: data.user_email || data.email,
                role: data.role.toUpperCase(),
                company_id: companyId
            }
        });

        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error) {
        logger.error('Failed to create employee', { error });
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}
