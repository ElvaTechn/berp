import { useState, useEffect, useCallback } from 'react';
import { offlineQueue, OfflineOperation } from '@/lib/offline-queue';

/**
 * Hook para integrar a fila offline com componentes React
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineOperation[]>([]);
  const [stats, setStats] = useState(() => offlineQueue.getStats());

  // Atualiza estado quando a fila muda
  useEffect(() => {
    const updateQueue = () => {
      setQueue(offlineQueue.getAll());
      setStats(offlineQueue.getStats());
    };

    // Atualização inicial
    updateQueue();

    // Registra listener
    const unsubscribe = offlineQueue.onChange(updateQueue);

    // Listeners de eventos da fila
    const handleSyncSuccess = (event: any) => {
      console.log('✅ Sincronização bem-sucedida:', event.detail);
    };

    const handleSyncError = (event: any) => {
      console.error('❌ Erro na sincronização:', event.detail);
    };

    window.addEventListener('offline-queue-sync-success', handleSyncSuccess);
    window.addEventListener('offline-queue-sync-error', handleSyncError);

    return () => {
      unsubscribe();
      window.removeEventListener('offline-queue-sync-success', handleSyncSuccess);
      window.removeEventListener('offline-queue-sync-error', handleSyncError);
    };
  }, []);

  // Adiciona operação à fila
  const addToQueue = useCallback((
    type: OfflineOperation['type'],
    action: OfflineOperation['action'],
    data: any
  ) => {
    return offlineQueue.add({ type, action, data });
  }, []);

  // Remove operação da fila
  const removeFromQueue = useCallback((id: string) => {
    offlineQueue.remove(id);
  }, []);

  // Sincroniza todas as operações
  const syncAll = useCallback(async () => {
    await offlineQueue.syncAll();
  }, []);

  // Limpa operações bem-sucedidas
  const clearSuccessful = useCallback(() => {
    offlineQueue.clearSuccessful();
  }, []);

  // Obtém operações pendentes
  const getPending = useCallback(() => {
    return offlineQueue.getPending();
  }, []);

  return {
    queue,
    stats,
    addToQueue,
    removeFromQueue,
    syncAll,
    clearSuccessful,
    getPending,
    hasPending: stats.pending > 0,
    isSyncing: stats.syncing > 0,
    hasFailed: stats.failed > 0,
  };
}
