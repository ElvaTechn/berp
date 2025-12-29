"use client";

import { useEffect, useState } from 'react';
import { register, skipWaiting } from '@/utils/serviceWorkerRegistration';
import { toast } from 'sonner';

/**
 * ================================================================
 * SERVICE WORKER PROVIDER - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Componente que:
 * - Registra o Service Worker
 * - Detecta updates disponíveis
 * - Mostra notificação para usuário atualizar
 * - Gerencia lifecycle do SW
 * ================================================================
 */

export function ServiceWorkerProvider() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Registrar Service Worker
    register({
      onSuccess: (reg) => {
        console.log('✅ PWA instalado e pronto para uso offline');
        setRegistration(reg);
      },
      onUpdate: (reg) => {
        console.log('🆕 Nova versão disponível');
        setRegistration(reg);
        setUpdateAvailable(true);
        
        // Mostrar notificação
        toast.info('Nova versão disponível', {
          description: 'Clique para atualizar o aplicativo',
          action: {
            label: 'Atualizar',
            onClick: handleUpdate,
          },
          duration: Infinity, // Não fechar automaticamente
        });
      },
      onInstalled: () => {
        console.log('📦 App instalado e pronto para uso offline');
        
        // Notificação de primeira instalação
        toast.success('App instalado', {
          description: 'Agora você pode usar o app offline!',
        });
      },
    });

    // Listener para eventos customizados
    const handleSwUpdateAvailable = (event: Event) => {
      const customEvent = event as CustomEvent;
      const reg = customEvent.detail?.registration;
      
      if (reg) {
        setRegistration(reg);
        setUpdateAvailable(true);
      }
    };

    window.addEventListener('swUpdateAvailable', handleSwUpdateAvailable);

    return () => {
      window.removeEventListener('swUpdateAvailable', handleSwUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    if (registration) {
      // Força o novo service worker a ativar
      skipWaiting();
      
      // Fecha a notificação
      setUpdateAvailable(false);
      
      // Mostra loading
      toast.loading('Atualizando...', {
        id: 'updating-app',
      });

      // A página recarregará automaticamente quando o novo SW assumir
    }
  };

  // Este componente não renderiza nada visível
  return null;
}

/**
 * ================================================================
 * UPDATE BANNER (OPCIONAL)
 * ================================================================
 * Banner fixo no topo quando há update disponível
 */

interface UpdateBannerProps {
  onUpdate: () => void;
}

export function UpdateBanner({ onUpdate }: UpdateBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-blue-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg 
            className="w-5 h-5 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <div>
            <p className="font-semibold text-sm">Nova versão disponível</p>
            <p className="text-xs opacity-90">Atualize para obter as últimas melhorias</p>
          </div>
        </div>
        <button
          onClick={onUpdate}
          className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex-shrink-0"
        >
          Atualizar Agora
        </button>
      </div>
    </div>
  );
}
