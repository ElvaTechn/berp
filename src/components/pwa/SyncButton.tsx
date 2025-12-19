"use client";

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { pwaStorage } from '@/lib/pwa/indexedDB';
import { toast } from '@/components/ui/toast';

export default function SyncButton() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const updatePendingCount = useCallback(async () => {
    try {
      const pending = await pwaStorage.getSyncQueue();
      setPendingCount(pending.length);
    } catch (error) {
      console.error('Error getting pending count:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      const pendingItems = await pwaStorage.getSyncQueue();
      
      if (pendingItems.length === 0) {
        toast.info('Nenhuma venda pendente', 'Tudo sincronizado');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const item of pendingItems) {
        try {
          if (item.type === 'sale') {
            const response = await fetch('/api/sales', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify({
                items: [item.data],
                total: item.data.price,
                employee_id: item.data.employeeId,
                company_id: item.data.companyId,
                payment_method: 'dinheiro'
              }),
            });

            if (response.ok) {
              await pwaStorage.removeFromSyncQueue(item.id);
              successCount++;
            } else {
              errorCount++;
            }
          }
        } catch (error) {
          console.error('Error syncing item:', error);
          errorCount++;
        }
      }

      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());

      // Update pending count
      await updatePendingCount();

      // Show results
      if (successCount > 0) {
        toast.success('Sincronização concluída', `${successCount} vendas sincronizadas`);
      }
      
      if (errorCount > 0) {
        toast.error('Erro de sincronização', `${errorCount} vendas falharam`);
      }

    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erro ao sincronizar', 'Tente novamente mais tarde');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      if (pendingCount > 0) {
        triggerSync();
      }
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get initial data
    updatePendingCount();
    
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingCount, triggerSync, updatePendingCount]);

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays}d`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Connection Status */}
      <div className="flex items-center gap-1 text-sm">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Sync Button */}
      <button
        onClick={triggerSync}
        disabled={!isOnline || isSyncing || pendingCount === 0}
        className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        {pendingCount > 0 && (
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Last Sync Time */}
      {lastSyncTime && (
        <span className="text-xs text-gray-500">
          Última: {formatLastSync(lastSyncTime)}
        </span>
      )}
    </div>
  );
}
