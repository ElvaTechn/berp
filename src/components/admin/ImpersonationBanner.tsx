"use client";

import React, { useState, useEffect } from "react";
import { Shield, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [targetUser, setTargetUser] = useState<{ fullName: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar se está em sessão de impersonação
    const checkImpersonation = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.user && response.headers.has('x-impersonated-by')) {
          setIsImpersonating(true);
          setTargetUser({
            fullName: data.user.full_name,
            email: data.user.email
          });
        }
      } catch (error) {
        console.error('Erro ao verificar impersonação:', error);
      }
    };

    checkImpersonation();
  }, []);

  const handleEndImpersonation = async () => {
    if (!isImpersonating) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Redirecionar para área admin
        window.location.href = data.redirectTo;
      } else {
        toast.error(data.error || 'Erro ao terminar sessão de suporte');
      }
    } catch (error) {
      toast.error('Erro ao terminar sessão de suporte');
    } finally {
      setIsLoading(false);
    }
  };

  // Se não está em impersonação, não renderiza nada
  if (!isImpersonating || !targetUser) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">MODO SUPORTE</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">A visualizar como:</span>{' '}
            <span className="font-bold">{targetUser.fullName}</span>{' '}
            <span className="text-purple-200">({targetUser.email})</span>
          </div>
        </div>
        
        <button
          onClick={handleEndImpersonation}
          disabled={isLoading}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>A voltar...</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Admin</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
