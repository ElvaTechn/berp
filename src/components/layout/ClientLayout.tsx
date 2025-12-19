"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

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
const PUBLIC_ROUTES = ['/login', '/register', '/setup', '/forgot-password', '/reset-password'];

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
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

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

  // ========== RENDERIZAÇÃO ==========

  // ROTA PÚBLICA: Renderiza APENAS o conteúdo (sem Sidebar)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505]">
        {children}
      </div>
    );
  }

  // SEM UTILIZADOR: Mostra conteúdo sem sidebar (provavelmente vai redirecionar)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505]">
        {children}
      </div>
    );
  }

  // LOADING: Ainda não hidratou ou está a carregar autenticação
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  // LAYOUT COMPLETO: Utilizador autenticado com Sidebar
  return (
    <div className="flex h-screen bg-white dark:bg-[#050505] overflow-hidden">
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
        className="flex-1 flex flex-col lg:ml-72 overflow-hidden"
      >
        {/* Content with independent scroll */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0a]">
          <div className="p-4 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
