"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

interface CompanyData {
  name: string;
  nuit: string | null;
}

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: contextUser, loading: authLoading } = useAuth();
  
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration guard
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Buscar dados da empresa quando o utilizador existe
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!contextUser) {
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
  }, [contextUser?.id]);

  // Se não está hidratado ou está carregando auth
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  // Se não tem utilizador, redireciona para login
  if (!contextUser) {
    router.push('/login');
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">A redirecionar...</p>
        </div>
      </div>
    );
  }

  // Layout completo com sidebar
  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        user={{
          full_name: contextUser.full_name,
          email: contextUser.email,
          role: contextUser.role.toUpperCase(),
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
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
          <div className="w-full max-w-none p-4 lg:p-6 pt-20 lg:pt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
