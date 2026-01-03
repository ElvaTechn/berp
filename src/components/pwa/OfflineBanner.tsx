"use client";

import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { getPendingSales, deletePendingSale } from '@/lib/pwa/indexedDB';
import { toast } from 'sonner';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updatePendingCount = useCallback(async () => {
    try {
      const pending = await getPendingSales();
      setPendingCount(pending.length);
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      const pendingSales = await getPendingSales();

      if (pendingSales.length === 0) {
        toast.info('Nenhuma venda pendente. Tudo sincronizado!');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const sale of pendingSales) {
        try {
          const response = await fetch('/api/sales', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: sale.items,
              payment_method: sale.payment_method,
              discount_code: sale.discount_code,
            }),
          });

          if (response.ok) {
            await deletePendingSale(sale.id);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error syncing item:', error);
          errorCount++;
        }
      }

      await updatePendingCount();

      if (successCount > 0) {
        toast.success(`${successCount} vendas sincronizadas!`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} vendas falharam ao sincronizar`);
      }

    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erro ao sincronizar. Tente novamente mais tarde');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (pendingCount > 0) {
        triggerSync();
      }
    };

    const handleOffline = () => setIsOnline(false);

    const handleSyncEvent = () => {
      triggerSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('trigger-sync', handleSyncEvent);

    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('trigger-sync', handleSyncEvent);
    };
  }, [pendingCount, triggerSync, updatePendingCount]);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm ${isOnline
        ? 'bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
        : 'bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300'
      }`}>
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>
              {isSyncing ? 'Sincronizando...' : `Conectado`}
              {pendingCount > 0 && !isSyncing && (
                <span className="ml-2">- {pendingCount} vendas pendentes</span>
              )}
            </span>
            {isSyncing && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Modo Offline - Vendas serão salvas localmente</span>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>{pendingCount} pendentes</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
