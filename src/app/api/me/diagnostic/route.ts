import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                email: true,
                full_name: true,
                created_at: true
            }
        });

        // Check for company ownership
        const ownedCompany = await prisma.company.findFirst({
            where: { owner_id: session.userId },
            select: {
                id: true,
                name: true,
                created_at: true
            }
        });

        // Check for employee records
        const employees = await prisma.employee.findMany({
            where: { user_id: session.userId },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                is_active: true,
                company_id: true,
                created_at: true
            }
        });

        // Get company details for each employee
        const employeeDetails = await Promise.all(
            employees.map(async (emp) => {
                const company = await prisma.company.findUnique({
                    where: { id: emp.company_id },
                    select: { id: true, name: true }
                });
                return {
                    ...emp,
                    company
                };
            })
        );

        return NextResponse.json({
            user,
            ownedCompany,
            employees: employeeDetails,
            diagnostic: {
                hasCompany: !!ownedCompany,
                hasActiveEmployee: employees.some(e => e.is_active),
                employeeCount: employees.length,
                activeEmployeeCount: employees.filter(e => e.is_active).length
            },
            recommendation: !ownedCompany
                ? 'You need to set up your company first. Go to /setup'
                : !employees.some(e => e.is_active)
                ? 'You have a company but no active employee record. Contact support or re-run setup.'
                : 'Your account is properly configured.'
        });

    } catch (error) {
        console.error('Diagnostic error:', error);
        return NextResponse.json({ error: 'Failed to run diagnostic' }, { status: 500 });
    }
}
