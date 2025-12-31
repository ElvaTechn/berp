/**
 * ================================================================
 * SYNC STATUS COMPONENT - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Componente que mostra status de sincronização offline
 * Aparece como badge flutuante no canto da tela
 * ================================================================
 */

"use client";

import { useOfflineSales } from '@/hooks/useOfflineSales';
import { AnimatePresence, motion } from 'framer-motion';

export function SyncStatus() {
  const { isOffline, isSyncing, syncStatus } = useOfflineSales();
  
  // Não mostrar se tudo OK e online
  const shouldShow = isOffline || isSyncing || syncStatus.pendingCount > 0;
  
  if (!shouldShow) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 right-4 z-50 md:bottom-4"
        style={{
          // iOS safe area
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
          paddingRight: 'max(0px, env(safe-area-inset-right))',
        }}
      >
        <div className="flex flex-col gap-2">
          {/* Status Offline */}
          {isOffline && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-lg border border-slate-200 dark:border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Modo Offline
              </span>
            </div>
          )}
          
          {/* Status Sincronizando */}
          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-lg border border-slate-200 dark:border-white/10">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-spin" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Sincronizando...
              </span>
            </div>
          )}
          
          {/* Vendas Pendentes */}
          {!isSyncing && syncStatus.pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-[#0A0A0A] shadow-lg border border-slate-200 dark:border-white/10">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {syncStatus.pendingCount} {syncStatus.pendingCount === 1 ? 'venda pendente' : 'vendas pendentes'}
              </span>
            </div>
          )}
          
          {/* Erros */}
          {syncStatus.failedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-50 dark:bg-red-900/20 shadow-lg border border-red-200 dark:border-red-500/20">
              <svg 
                className="w-4 h-4 text-red-600 dark:text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {syncStatus.failedCount} {syncStatus.failedCount === 1 ? 'erro' : 'erros'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Versão detalhada do status (para usar em modais/páginas)
 */
export function SyncStatusDetailed() {
  const { isOffline, isSyncing, syncStatus, pendingSales, refreshStatus } = useOfflineSales();
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Status de Sincronização
        </h3>
        <button
          onClick={refreshStatus}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title="Atualizar"
        >
          <svg 
            className="w-5 h-5 text-slate-600 dark:text-slate-400" 
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
        </button>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Online/Offline */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Conexão
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {isOffline ? 'Offline' : 'Online'}
          </p>
        </div>
        
        {/* Pendentes */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pendentes
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {syncStatus.pendingCount}
          </p>
        </div>
        
        {/* Sincronizando */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-blue-500 animate-spin' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Status
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {isSyncing ? 'Sync...' : 'Idle'}
          </p>
        </div>
        
        {/* Erros */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Erros
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {syncStatus.failedCount}
          </p>
        </div>
      </div>
      
      {/* Última Sync */}
      {syncStatus.lastSync > 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Última sincronização: {new Date(syncStatus.lastSync).toLocaleString('pt-MZ')}
        </p>
      )}
      
      {/* Lista de Vendas Pendentes */}
      {pendingSales.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            Vendas Pendentes:
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pendingSales.map((sale) => (
              <div 
                key={sale.id} 
                className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(sale.timestamp).toLocaleTimeString('pt-MZ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sale.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                    sale.status === 'syncing' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                    sale.status === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                    'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  }`}>
                    {sale.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {sale.data.items.length} {sale.data.items.length === 1 ? 'item' : 'itens'} • 
                  Total: {sale.data.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                </p>
                {sale.lastError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Erro: {sale.lastError}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
