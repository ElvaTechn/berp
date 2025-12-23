// src/contexts/auth-context.tsx
"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User { id: string; email: string; full_name: string; role: string; }

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Login: define o utilizador e dispara re-render global
  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  // Refresh: busca o utilizador atual da sessão
  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      
      // Limpa dados offline após logout
      if (typeof window !== 'undefined') {
        const { clearAllCache } = await import('@/lib/pwa/indexedDB');
        const { clearLease } = await import('@/lib/pwa/subscription-check');
        await clearAllCache();
        await clearLease();
        
        // Limpa fila de sincronização
        localStorage.removeItem('bizcontrol_offline_queue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
