// src/app/api/admin/impersonate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { signToken } from '@/lib/auth';
import { createImpersonationToken } from '@/services/admin-service';
import { getClientIP } from '@/lib/rateLimit';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, companyId } = body;

        if (!userId && !companyId) {
            return NextResponse.json(
                { error: 'userId ou companyId é obrigatório' },
                { status: 400 }
            );
        }

        const ipAddress = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'Unknown';

        // Se companyId foi fornecido, buscar o owner da empresa
        let targetUserId = userId;
        if (companyId && !userId) {
            const company = await prisma.company.findUnique({
                where: { id: companyId },
                select: { owner_id: true },
            });

            if (!company) {
                return NextResponse.json(
                    { error: 'Empresa não encontrada' },
                    { status: 404 }
                );
            }

            targetUserId = company.owner_id;
        }

        // Buscar dados do utilizador alvo
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
            },
        });

        if (!targetUser) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        // Registar a impersonação no audit log
        const auditResult = await createImpersonationToken(
            targetUserId,
            session.userId,
            ipAddress,
            userAgent
        );

        if (!auditResult.success) {
            return NextResponse.json(
                { error: auditResult.error },
                { status: 400 }
            );
        }

        // Criar token de impersonação (com flag especial)
        const impersonationToken = await signToken({
            userId: targetUser.id,
            email: targetUser.email,
            role: targetUser.role,
            version: 1,
            impersonatedBy: session.userId, // Flag que indica impersonação
        });

        // Guardar o token original do admin para poder voltar
        const cookieStore = await cookies();
        
        // Guardar token do admin
        cookieStore.set('admin_original_token', cookieStore.get('auth_token')?.value || '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hora
            path: '/',
        });

        // Definir token de impersonação
        cookieStore.set('auth_token', impersonationToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hora (sessão curta por segurança)
            path: '/',
        });

        logger.info('Admin impersonation started', {
            adminId: session.userId,
            targetUserId: targetUser.id,
            targetEmail: targetUser.email,
        });

        return NextResponse.json({
            success: true,
            message: `A aceder como ${targetUser.full_name}`,
            user: {
                id: targetUser.id,
                email: targetUser.email,
                fullName: targetUser.full_name,
                role: targetUser.role,
            },
            redirectTo: '/dashboard',
        });
    } catch (error) {
        logger.error('Error creating impersonation session', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao criar sessão de suporte' },
            { status: 500 }
        );
    }
}

// DELETE - Terminar sessão de impersonação e voltar para admin
export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const originalToken = cookieStore.get('admin_original_token')?.value;

        if (!originalToken) {
            return NextResponse.json(
                { error: 'Sessão de administrador não encontrada' },
                { status: 400 }
            );
        }

        // Restaurar token original do admin
        cookieStore.set('auth_token', originalToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        // Limpar token de backup
        cookieStore.delete('admin_original_token');

        return NextResponse.json({
            success: true,
            message: 'Sessão de suporte terminada. Bem-vindo de volta, Admin!',
            redirectTo: '/admin/companies',
        });
    } catch (error) {
        logger.error('Error ending impersonation session', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            { error: 'Erro ao terminar sessão de suporte' },
            { status: 500 }
        );
    }
}
