// src/lib/auth-server.ts
import { cookies } from 'next/headers';
import { verifyToken, type TokenPayload } from './auth';

/**
 * Obtém a sessão atual validando o JWT no Cookie
 * Usado em Server Components e Server Actions
 */
export async function getSession(): Promise<TokenPayload | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return null;

        // Valida o token usando a nossa lib principal (que agora usa 'jose')
        const decoded = await verifyToken(token);
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value ?? null;
}