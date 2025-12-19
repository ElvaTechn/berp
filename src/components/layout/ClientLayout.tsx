"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ClientLayout({ children, user }: ClientLayoutProps) {
  const router = useRouter();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Buscar dados da empresa do usuário
        const response = await fetch('/api/user/company');
        if (response.ok) {
          const data = await response.json();
          setCompany(data.company);
        } else {
          // Fallback: usar dados padrão
          setCompany({
            name: 'Minha Empresa',
            nuit: null,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        // Fallback: usar dados padrão
        setCompany({
          name: 'Minha Empresa',
          nuit: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  // Se não há usuário, renderiza apenas o children (login page, etc)
  if (!user) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        user={{
          full_name: user.full_name,
          email: user.email,
          role: user.role.toUpperCase(),
        }}
        company={{
          name: company?.name || 'Minha Empresa',
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:ml-72 overflow-hidden">
        {/* Content with independent scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
