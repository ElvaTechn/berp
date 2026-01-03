/**
 * ================================================================
 * AUTH OFFLINE - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Autenticação com suporte offline-first
 * 
 * ESTRATÉGIA:
 * - Primeiro login: PRECISA de internet (validar com servidor)
 * - Logins seguintes: Usa token JWT local (valida offline)
 * - Graceful degradation: Avisa usuário quando offline
 * ================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback-secret-offline-mode'
);

// ================================================================
// TYPES
// ================================================================

export interface OfflineSession {
  userId: string;
  email: string;
  full_name?: string;
  role: string;
  token: string;
  lastLogin: number;
  expiresAt: number;
  companyId?: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    role: string;
    companyId?: string;
  };
}

export interface OfflineAuthResult {
  success: boolean;
  user?: OfflineSession['user'];
  session?: OfflineSession;
  offlineMode?: boolean;
  error?: string;
  requiresOnline?: boolean;
}

// ================================================================
// OFFLINE SESSION MANAGEMENT
// ================================================================

class OfflineAuthManager {
  private SESSION_KEY = 'bizcontrol_offline_session';
  private TOKEN_VERSION = 1;

  /**
   * Verifica se há sessão offline válida
   */
  async getOfflineSession(): Promise<OfflineSession | null> {
    if (typeof window === 'undefined') return null;

    try {
      const sessionJSON = localStorage.getItem(this.SESSION_KEY);
      if (!sessionJSON) return null;

      const session: OfflineSession = JSON.parse(sessionJSON);
      
      // Verificar se expirou
      if (this.isSessionExpired(session)) {
        this.clearOfflineSession();
        return null;
      }

      // Verificar token JWT (local validation)
      const isValid = await this.validateTokenLocally(session.token);
      
      if (!isValid) {
        this.clearOfflineSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('[OfflineAuth] Failed to get session:', error);
      this.clearOfflineSession();
      return null;
    }
  }

  /**
   * Salva sessão offline após login
   */
  async saveOfflineSession(token: string, user: any): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Decodificar token para obter expire time
      const payload = await this.parseToken(token);
      
      const session: OfflineSession = {
        userId: payload.userId || user.id,
        email: payload.email || user.email,
        full_name: user.full_name || payload.full_name,
        role: payload.role || user.role,
        token,
        lastLogin: Date.now(),
        expiresAt: (payload.exp || Date.now() / 1000 + 7 * 24 * 60 * 60) * 1000,
        companyId: payload.companyId || user.companyId,
      };

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      console.log('[OfflineAuth] Session saved for offline use');
    } catch (error) {
      console.error('[OfflineAuth] Failed to save session:', error);
    }
  }

  /**
   * Valida token JWT localmente (sem requisição ao servidor)
   */
  private async validateTokenLocally(token: string): Promise<boolean> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return !!payload && !!payload.userId;
    } catch (error) {
      console.error('[OfflineAuth] Token validation failed:', error);
      return false;
    }
  }

  /**
   * Parse token (sem validar signature)
   */
  private parseToken(token: string): any {
    try {
      const parts = token.split('.');
      return JSON.parse(atob(parts[1]));
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se sessão expirou
   */
  private isSessionExpired(session: OfflineSession): boolean {
    return Date.now() > session.expiresAt;
  }

  /**
   * Limpa sessão offline
   */
  clearOfflineSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Tenta autenticar offline (primeiro) ou online
   */
  async attemptAuth(): Promise<OfflineAuthResult> {
    // 1. Primeiro, tentar usar sessão offline
    const offlineSession = await this.getOfflineSession();
    
    if (offlineSession) {
      // ✅ Sessão offline válida
      return {
        success: true,
        user: {
          id: offlineSession.userId,
          email: offlineSession.email,
          full_name: offlineSession.full_name,
          role: offlineSession.role,
          companyId: offlineSession.companyId,
        },
        session: offlineSession,
        offlineMode: true,
      };
    }

    // 2. Se não há sessão offline, verificar se está online
    const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
    
    if (!isOnline) {
      // ❌ Offline e sem sessão
      return {
        success: false,
        error: 'No internet connection and no offline session',
        requiresOnline: true,
        offlineMode: true,
      };
    }

    // 3. Online sem sessão offline - precisa fazer login
    return {
      success: false,
      requiresOnline: true,
      offlineMode: false,
    };
  }

  /**
   * Login com fallback offline
   */
  async login(
    credentials: { email: string; password: string },
    options?: { forceOnline?: boolean }
  ): Promise<OfflineAuthResult> {
    const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

    // Se está offline e forçou online, falha
    if (!isOnline && (!options?.forceOnline)) {
      // Tentar usar sessão offline existente
      const session = await this.getOfflineSession();
      if (session) {
        return {
          success: true,
          user: {
            id: session.userId,
            email: session.email,
            full_name: session.full_name,
            role: session.role,
            companyId: session.companyId,
          },
          session,
          offlineMode: true,
        };
      }

      return {
        success: false,
        error: 'No internet connection. Please connect to log in.',
        requiresOnline: true,
        offlineMode: true,
      };
    }

    // Fazer login online
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed',
          offlineMode: false,
        };
      }

      // Salvar sessão offline para uso futuro
      if (data.token && data.user) {
        await this.saveOfflineSession(data.token, data.user);
      }

      return {
        success: true,
        user: data.user,
        session: data,
        offlineMode: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        offlineMode: false,
      };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    // Limpar sessão offline
    this.clearOfflineSession();

    // Tentar logout no servidor se online
    const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
    
    if (isOnline) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('[OfflineAuth] Logout request failed:', error);
      }
    }
  }

  /**
   * Atualiza sessão offline com novos dados
   */
  async updateSession(userData: Partial<OfflineSession>): Promise<void> {
    const session = await this.getOfflineSession();
    
    if (session) {
      const updated: OfflineSession = {
        ...session,
        ...userData,
      };
      
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(updated));
    }
  }

  /**
   * Obtém session info para headers
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await this.getOfflineSession();
    
    return session ? {
      'Authorization': `Bearer ${session.token}`,
      'x-offline-mode': 'true',
    } : {};
  }

  /**
   * Verifica se pode fazer operação offline
   */
  getOfflineCapabilities(): {
    canViewProducts: boolean;
    canViewEmployees: boolean;
    canCreateSales: boolean;
    requiresAuth: boolean;
  } {
    return {
      canViewProducts: true,
      canViewEmployees: true,
      canCreateSales: true,
      requiresAuth: true,
    };
  }
}

// ================================================================
// EXPORT SINGLETON
// ================================================================

export const offlineAuth = new OfflineAuthManager();

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Hook-friendly wrapper para auth offline
 */
export function useOfflineAuth() {
  const [session, setSession] = useState<OfflineSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineAuthOnly, setOfflineAuthOnly] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      setLoading(true);
      const result = await offlineAuth.attemptAuth();
      
      if (mounted) {
        setSession(result.session || null);
        setOfflineAuthOnly(!!result.offlineMode);
        setLoading(false);
      }
    };

    checkAuth();

    // Listener para mudanças de conexão
    const handleOnline = () => setOfflineAuthOnly(false);
    const handleOffline = () => setOfflineAuthOnly(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    const result = await offlineAuth.login(credentials);
    
    if (result.success && result.session) {
      setSession(result.session);
    }
    
    setLoading(false);
    return result;
  };

  const logout = async () => {
    setLoading(true);
    await offlineAuth.logout();
    setSession(null);
    setLoading(false);
  };

  return {
    session,
    loading,
    offlineAuthOnly,
    isAuthenticated: !!session,
    user: session ? {
      id: session.userId,
      email: session.email,
      full_name: session.full_name,
      role: session.role,
      company_id: session.companyId,
    } : null,
    login,
    logout,
    capabilities: offlineAuth.getOfflineCapabilities(),
  };
}
