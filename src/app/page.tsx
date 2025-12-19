"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api';
import { Loader2, Store } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await apiClient.auth.me();
        if (user) {
          // Verificar se tem empresa configurada
          const employees = await apiClient.employees.list({ user_email: user.email });
          if (employees.length > 0) {
            // Redirecionar baseado na role
            if (user.role === 'VENDEDOR') {
              router.replace('/sales/pos'); // Vendedor vai direto pro PDV
            } else {
              router.replace('/dashboard'); // Gestor/Admin vai pro Dashboard
            }
          } else {
            router.replace('/setup');
          }
        } else {
          router.replace('/login');
        }
      } catch {
        // Não autenticado
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg shadow-blue-500/30">
          <Store className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">BizControl 360</h1>
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>A carregar...</span>
        </div>
      </div>
    </div>
  );
}
