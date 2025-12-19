// src/hooks/useAuth.ts
"use client";
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api'; // Ajustado para o teu apiClient

interface AuthState {
  user: any | null;
  loading: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      // Idealmente, criar uma rota /api/auth/me para retornar o user atual via cookie
      const response = await fetch('/api/auth/me'); 
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  useEffect(() => { checkAuth(); }, [checkAuth]);

  return { user, loading, logout, refresh: checkAuth };
};