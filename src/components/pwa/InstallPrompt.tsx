"use client";

import { useState, useEffect, useCallback } from 'react';
import { getPendingSales } from '@/lib/pwa/indexedDB';
import { toast } from 'sonner';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  const getPendingSyncCount = useCallback(async () => {
    try {
      const pending = await getPendingSales();
      setPendingSync(pending.length);
    } catch (error) {
      console.error('Error getting sync count:', error);
    }
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        toast.success('Aplicação instalada! Pode acessar rapidamente');
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast.error('Erro ao instalar. Tente novamente');
    }
  }, [deferredPrompt]);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as PWAInstallPrompt);
    };

    // Listen for online/offline
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSync > 0) {
        getPendingSyncCount();
      }
    };
    
    const handleOffline = () => setIsOnline(false);

    checkInstalled();
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync count
    getPendingSyncCount();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync, getPendingSyncCount]);

  if (isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
            <span className="text-sm">Modo offline - Vendas serão sincronizadas</span>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {deferredPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="w-5 h-5 bg-blue-600 rounded"></div>
              <span className="font-medium">Instale o StockPro</span>
            </div>
            <p className="text-sm text-blue-700">
              Acesso rápido e modo offline para gestão de stock
            </p>
            <button 
              onClick={handleInstallClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Instalar Aplicação
            </button>
          </div>
        </div>
      )}

      {/* Sync Status */}
      {pendingSync > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="text-sm">{pendingSync} vendas pendentes</span>
            </div>
            <button 
              className="px-3 py-1 text-sm border border-green-600 text-green-600 rounded-md hover:bg-green-50 disabled:opacity-50"
              disabled={!isOnline}
              onClick={() => {
                // Trigger sync event
                window.dispatchEvent(new CustomEvent('trigger-sync'));
              }}
            >
              Sincronizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
