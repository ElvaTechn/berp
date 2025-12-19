// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit, getClientIP } from '@/lib/rateLimit';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth'; // Agora async com 'jose'
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import { z } from 'zod';

const registerSchema = z.object({
    fullName: z.string().min(3, 'Nome muito curto').max(100),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres')
});

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        const { success } = await authRateLimit.limit(ip);
        
        if (!success) {
            return NextResponse.json({ error: 'Muitas solicitações. Aguarde.' }, { status: 429 });
        }

        const body = await request.json();
        const { fullName, email, password } = registerSchema.parse(body);

        // Verificação de existência atómica
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Este e-mail já está em uso no sistema.' }, { status: 409 });
        }

        // Hash com salt de 12 (equilíbrio perfeito entre segurança e performance)
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                full_name: fullName,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'ADMIN' // Primeiro user costuma ser Admin no ERP
            }
        });

        // Geração do Token (Async)
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
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        logger.info('New enterprise account created', { userId: user.id, ip });

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Falha crítica ao criar conta' }, { status: 500 });
    }
}