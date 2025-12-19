// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/_next', '/favicon.ico'];

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

    // 4. Injetar dados do user nos headers para consumo interno nas APIs
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};