// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/_next', '/favicon.ico', '/offline'];

// Rotas que requerem role ADMIN
const ADMIN_PATHS = ['/admin'];

// Rotas específicas por role
const ROLE_REDIRECTS: Record<string, string> = {
    VENDEDOR: '/sales/pos',
    GESTOR: '/dashboard',
    ADMIN: '/admin', // Área administrativa do sistema
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Permitir rotas públicas rapidamente
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    // 2. Sem token em rota protegida
    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Validar Token (Usando jose que é Edge-ready)
    const decoded = await verifyToken(token);

    if (!decoded) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token'); // Limpa token inválido
        return response;
    }

    const userRole = decoded.role as string;

    // 4. PROTEÇÃO DE ROTAS ADMIN
    // Apenas ADMIN pode aceder a /admin/*
    if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
        if (userRole !== 'ADMIN') {
            // Redirecionar para o dashboard apropriado com mensagem de erro
            const redirectUrl = new URL(ROLE_REDIRECTS[userRole] || '/dashboard', request.url);
            redirectUrl.searchParams.set('error', 'access_denied');
            redirectUrl.searchParams.set('message', 'Acesso negado. Área restrita a administradores.');
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 5. Injetar dados do user nos headers para consumo interno nas APIs
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-user-email', decoded.email || '');

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
