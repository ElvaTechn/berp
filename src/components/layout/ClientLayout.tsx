"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

interface ClientLayoutProps {
  children: React.ReactNode;
  user: { 
    id: string; 
    full_name: string; 
    email: string; 
    role: string;
  } | null;
}

interface CompanyData {
  name: string;
  nuit: string | null;
}

// Rotas públicas onde a Sidebar NÃO deve aparecer
const PUBLIC_ROUTES = ['/', '/login', '/register', '/setup', '/forgot-password', '/reset-password'];

export default function ClientLayout({ children, user: serverUser }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Usa o AuthContext para estado reativo do utilizador
  const { user: contextUser, loading: authLoading } = useAuth();
  
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // O utilizador efetivo: 
  // 1. Prioridade para contextUser (atualizado dinamicamente após login)
  // 2. Fallback para serverUser (dados do servidor na primeira carga)
  const currentUser = useMemo(() => {
    // Se temos user no contexto, usa-o (foi atualizado client-side)
    if (contextUser) return contextUser;
    // Senão, usa o que veio do servidor
    return serverUser;
  }, [contextUser, serverUser]);

  // Verificar se é uma rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    // Para a rota raiz "/", usar match exato
    if (route === '/') return pathname === '/';
    // Para outras rotas, usar startsWith
    return pathname?.startsWith(route);
  });

  // Hydration guard - marca quando o cliente está pronto
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Buscar dados da empresa quando o utilizador existe
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!currentUser) {
        setCompany(null);
        return;
      }

      setIsLoadingCompany(true);
      try {
        const response = await fetch('/api/user/company');
        if (response.ok) {
          const data = await response.json();
          setCompany(data.company);
        } else {
          setCompany({
            name: 'Minha Empresa',
            nuit: null,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        setCompany({
          name: 'Minha Empresa',
          nuit: null,
        });
      } finally {
        setIsLoadingCompany(false);
      }
    };

    fetchCompanyData();
  }, [currentUser?.id]); // Recarrega quando o ID do user muda

  // Listener global para eventos de autenticação e sincronização
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleForceLogout = (event: CustomEvent) => {
      console.log('🔥 Evento force-logout recebido:', event.detail);
      // Limpa dados do contexto
      // O AuthProvider já tem o logout, mas vamos garantir limpeza
      const cleanup = async () => {
        const { clearAllCache } = await import('@/lib/pwa/indexedDB');
        const { clearLease } = await import('@/lib/pwa/subscription-check');
        await clearAllCache();
        await clearLease();
        localStorage.removeItem('bizcontrol_offline_queue');
      };
      
      cleanup().then(() => {
        // Redireciona para login
        window.location.href = '/login';
      });
    };

    const handleAuthError = (event: CustomEvent) => {
      console.log('❌ Evento auth-error recebido:', event.detail);
      // Pode ser usado para mostrar toast global de erro de autenticação
    };

    const handleSyncSuccess = (event: CustomEvent) => {
      console.log('✅ Evento sync-success recebido:', event.detail);
    };

    const handleSyncError = (event: CustomEvent) => {
      console.log('❌ Evento sync-error recebido:', event.detail);
    };

    // Registra listeners
    window.addEventListener('force-logout', handleForceLogout as EventListener);
    window.addEventListener('offline-queue-auth-error', handleAuthError as EventListener);
    window.addEventListener('offline-queue-sync-success', handleSyncSuccess as EventListener);
    window.addEventListener('offline-queue-sync-error', handleSyncError as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('force-logout', handleForceLogout as EventListener);
      window.removeEventListener('offline-queue-auth-error', handleAuthError as EventListener);
      window.removeEventListener('offline-queue-sync-success', handleSyncSuccess as EventListener);
      window.removeEventListener('offline-queue-sync-error', handleSyncError as EventListener);
    };
  }, []);

  // ========== RENDERIZAÇÃO ==========

  // ROTA PÚBLICA: Renderiza APENAS o conteúdo (sem Sidebar)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)]">
        {children}
      </div>
    );
  }

  // SEM UTILIZADOR: Mostra conteúdo sem sidebar (provavelmente vai redirecionar)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)]">
        {children}
      </div>
    );
  }

  // LOADING: Ainda não hidratou ou está a carregar autenticação
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center">
        <div className="text-center">
          <div className="neu-surface neu-convex-md rounded-2xl p-8 inline-block">
            <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin mx-auto mb-4" />
            <p className="neu-text-body font-medium">A carregar...</p>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT COMPLETO: Utilizador autenticado com Sidebar
  return (
    <div className="flex h-screen bg-[var(--neu-base)] overflow-hidden">
      {/* Banner de Impersonation */}
      <ImpersonationBanner />
      
      {/* Sidebar */}
      <Sidebar
        user={{
          full_name: currentUser.full_name,
          email: currentUser.email,
          role: currentUser.role.toUpperCase(),
        }}
        company={{
          name: company?.name || 'Minha Empresa',
        }}
      />

      {/* Main Content Area */}
      <main 
        id="main-content" 
        role="main"
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '288px' : '0'
        }}
      >
        {/* Content with independent scroll */}
        <div className="flex-1 overflow-y-auto bg-[var(--neu-base-light)]">
          {/* Container com padding adequado para aproveitar espaço */}
          <div 
            className="h-full px-6 lg:px-8 py-6 lg:py-8 pt-20 lg:pt-8"
            style={{ 
              width: '100%',
              maxWidth: '100%'
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
