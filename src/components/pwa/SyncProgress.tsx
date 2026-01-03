/**
 * ================================================================
 * SYNC PROGRESS - BIZCONTROL 360 ERP
 * ================================================================
 * Componente para mostrar progresso de sincronização com retry
 *
 * USO:
 * <SyncProgress />
 *
 * FUNCIONALIDADES:
 * - Barra de progresso para sync
 * - Botão de retry manual
 * - Status de sync (running, completed, failed)
 * ================================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useP2PFeatures } from '@/hooks/useP2PFeatures';
import { Button } from '@/components/ui/button';

export function SyncProgress() {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
  } = useOfflineSync();

  const { p2pSync } = useP2PFeatures();

  const [expanded, setExpanded] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Track sync progress
  useEffect(() => {
    if (isSyncing) {
      setSyncStatus('syncing');
      setSyncProgress(50); // Progresso fixo enquanto sincroniza

      // Simular progresso
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setSyncStatus('success');
            setTimeout(() => {
              setSyncProgress(0);
              setSyncStatus('idle');
            }, 3000);
            return 0;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isSyncing, pendingCount]);

  // Handle manual retry
  const handleRetry = async () => {
    try {
      await p2pSync();
      toast.success('Sincronização iniciada');
    } catch (error) {
      toast.error('Erro ao iniciar sincronização');
    }
  };

  if (pendingCount === 0 && !isSyncing && syncStatus === 'idle') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-40">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {syncStatus === 'syncing' && (
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            )}
            {syncStatus === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            {syncStatus === 'error' && (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {syncStatus === 'syncing' && 'Sincronizando...'}
                {syncStatus === 'success' && 'Sincronizado!'}
                {syncStatus === 'error' && 'Erro de Sincronização'}
                {syncStatus === 'idle' && 'Vendas Pendentes'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {pendingCount} {pendingCount === 1 ? 'venda' : 'vendas'} pendente
                {pendingCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Retry Button */}
            {(syncStatus === 'error' || syncStatus === 'idle') && isOnline && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar
              </Button>
            )}

            {/* Expand Toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {syncStatus === 'syncing' && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${syncProgress}%` }}
            className="h-1 bg-blue-600"
          />
        )}

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-200 dark:border-slate-700"
            >
              <div className="p-4 space-y-3">
                {/* Status Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      {isOnline ? 'Conectado' : 'Offline'}
                    </span>
                  </div>

                  {lastSyncTime && (
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      Último sync: {lastSyncTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {/* Sync Details */}
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pendentes:</span>
                    <span className="font-medium">{pendingCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-medium text-blue-600">
                      {isSyncing ? 'Em progresso' : 'Aguardando'}
                    </span>
                  </div>
                </div>

                {/* Help Text */}
                {!isOnline && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ Você está offline. As vendas serão sincronizadas
                      automaticamente quando a conexão for restaurada.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
