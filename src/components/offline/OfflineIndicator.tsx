'use client';

import { useOffline } from '@/hooks/useOffline';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';

/**
 * Indicador de status offline/online com sincronização
 */
export function OfflineIndicator() {
  const { isOnline, isOffline, effectiveType, downlink } = useOffline();
  const { stats, syncAll, clearSuccessful, hasPending, isSyncing, hasFailed } = useOfflineQueue();
  
  const [showDetails, setShowDetails] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Mostra notificação quando volta online
  useEffect(() => {
    if (isOnline && hasPending) {
      setNotification({
        type: 'info',
        message: `${stats.pending} operações serão sincronizadas...`
      });
      
      setTimeout(() => setNotification(null), 5000);
    }
  }, [isOnline, hasPending, stats.pending]);

  // Mostra notificação quando fica offline
  useEffect(() => {
    if (isOffline) {
      setNotification({
        type: 'info',
        message: 'Modo offline ativo. Suas ações serão sincronizadas quando voltar online.'
      });
      
      setTimeout(() => setNotification(null), 5000);
    }
  }, [isOffline]);

  // Listener de eventos de sincronização
  useEffect(() => {
    const handleSyncSuccess = (event: any) => {
      setNotification({
        type: 'success',
        message: `${event.detail.count} operação(ões) sincronizada(s) com sucesso!`
      });
      
      setTimeout(() => {
        setNotification(null);
        clearSuccessful();
      }, 5000);
    };

    const handleSyncError = (event: any) => {
      setNotification({
        type: 'error',
        message: `Falha ao sincronizar ${event.detail.count} operação(ões)`
      });
      
      setTimeout(() => setNotification(null), 5000);
    };

    window.addEventListener('offline-queue-sync-success', handleSyncSuccess);
    window.addEventListener('offline-queue-sync-error', handleSyncError);

    return () => {
      window.removeEventListener('offline-queue-sync-success', handleSyncSuccess);
      window.removeEventListener('offline-queue-sync-error', handleSyncError);
    };
  }, [clearSuccessful]);

  const handleSync = async () => {
    setNotification({
      type: 'info',
      message: 'Sincronizando...'
    });
    await syncAll();
  };

  return (
    <>
      {/* Notificação Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in-from-top">
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm
            ${notification.type === 'success' ? 'bg-green-500/90 text-white' : ''}
            ${notification.type === 'error' ? 'bg-red-500/90 text-white' : ''}
            ${notification.type === 'info' ? 'bg-blue-500/90 text-white' : ''}
          `}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Cloud className="w-5 h-5" />}
            
            <span className="text-sm font-medium">{notification.message}</span>
            
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Indicador principal */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex flex-col items-end gap-2">
          {/* Badge de status */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm
              transition-all duration-300 hover:scale-105
              ${isOnline ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}
            `}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4 animate-pulse" />
            )}
            <span className="text-xs font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            
            {hasPending && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-white/20 rounded-full">
                {stats.pending}
              </span>
            )}
          </button>

          {/* Painel de detalhes */}
          {showDetails && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 min-w-[280px] animate-slide-in-from-bottom">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Status de Conexão</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status da conexão */}
              <div className="space-y-2 mb-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                {effectiveType && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <span className="font-medium">{effectiveType.toUpperCase()}</span>
                  </div>
                )}
                
                {downlink && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Velocidade:</span>
                    <span className="font-medium">{downlink} Mbps</span>
                  </div>
                )}
              </div>

              {/* Estatísticas da fila */}
              {stats.total > 0 && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                    <h4 className="text-xs font-semibold mb-2">Fila de Sincronização</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Pendente:</span>
                        <span className="font-medium">{stats.pending}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Sincronizando:</span>
                        <span className="font-medium">{stats.syncing}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Sucesso:</span>
                        <span className="font-medium">{stats.success}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Falha:</span>
                        <span className="font-medium">{stats.failed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de sincronização */}
                  {isOnline && hasPending && (
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                    </button>
                  )}

                  {hasFailed && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Algumas operações falhararama sincronizar
                    </div>
                  )}
                </>
              )}

              {stats.total === 0 && (
                <div className="text-center py-3 text-xs text-gray-500 dark:text-gray-400">
                  <CloudOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Nenhuma operação pendente
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OfflineIndicator;
