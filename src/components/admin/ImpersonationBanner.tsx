"use client";

import React, { useState, useEffect } from "react";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { ArrowLeft, Eye, AlertTriangle } from "lucide-react";
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
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <NeuCard variant="concave" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[var(--neu-warning)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-[var(--neu-warning)]" />
                    <span className="neu-text-body font-bold text-[var(--neu-warning)]">
                      MODO SUPORTE
                    </span>
                  </div>
                  <div className="neu-text-caption text-[var(--neu-text-muted)]">
                    <span className="font-medium">A visualizar como:</span>{' '}
                    <span className="font-bold">{targetUser.fullName}</span>{' '}
                    <span className="hidden sm:inline">({targetUser.email})</span>
                  </div>
                </div>
              </div>
              
              <NeuButton
                onClick={handleEndImpersonation}
                disabled={isLoading}
                variant="accent"
                size="sm"
                className="flex-shrink-0"
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
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>
      </div>
    </div>
  );
}
