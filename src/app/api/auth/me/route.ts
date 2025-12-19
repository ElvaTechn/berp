// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { apiRateLimit, getClientIP } from '@/lib/rateLimit';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
    try {
        const ip = getClientIP(request);
        const { success } = await apiRateLimit.limit(ip);
        
        if (!success) return NextResponse.json({ error: 'Muitas solicitações' }, { status: 429 });

        const session = await getSession();
        if (!session) return NextResponse.json({ user: null }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                email: true,
                role: true,
                full_name: true,
            }
        });

        if (!user) return NextResponse.json({ user: null }, { status: 404 });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                role: user.role
            }
        });

    } catch (error: any) {
        logger.error('Failed to fetch user profile:', { error: error.message });
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}