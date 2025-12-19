// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit, getClientIP, trackLoginAttempt, isAccountLocked } from '@/lib/rateLimit';
import { loginSchema } from '@/lib/validations';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const ip = getClientIP(request);

    try {
        // 1. Rate Limiting (Prevenção de Brute Force)
        const { success: rateLimitOk } = await authRateLimit.limit(ip);
        if (!rateLimitOk) {
            return NextResponse.json(
                { error: 'Bloqueio temporário: Muitas tentativas.' }, 
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, password } = loginSchema.parse(body);

        // 2. Verificação de conta bloqueada (Redis)
        const lockStatus = await isAccountLocked(email);
        if (lockStatus.locked) {
            return NextResponse.json({ 
                error: `Acesso suspenso por segurança.`,
                remainingMinutes: lockStatus.remainingMinutes
            }, { status: 423 });
        }

        // 3. Busca de usuário com tratamento de "Timing Attack"
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            await trackLoginAttempt(email, false);
            // Mesmo se o user não existe, esperamos um tempo para enganar hackers
            await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // 4. Validação de Senha
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            const attempt = await trackLoginAttempt(email, false);
            return NextResponse.json({ 
                error: 'Credenciais inválidas',
                attemptsRemaining: attempt.attemptsRemaining
            }, { status: 401 });
        }

        // 5. Sucesso - Geração de Token e Cookie
        await trackLoginAttempt(email, true);
        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            version: 1
        });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Lax é melhor para UX de redirects
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }
        });

    } catch (error: any) {
        logger.error('Login Failure', { error: error.message, ip });
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}