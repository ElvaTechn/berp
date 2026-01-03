/**
 * ================================================================
 * PWA FEATURES PANEL - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Painel unificado para todas as features PWA:
 * - P2P Sync
 * - Offline Reports
 * - Sync Status
 * - Storage Monitor
 * - Conflict Monitor
 * 
 * USO:
 * <PWAFeaturesPanel defaultView="p2p" />
 * ================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  RefreshCw,
  CloudDownload,
  Cloud,
  ArrowRightLeft,
  BarChart3,
  Database,
  AlertTriangle,
  Settings,
  ChevronRight,
} from 'lucide-react';
import P2PSyncPanel from './P2PSyncPanel';
import OfflineReportsPanel from './OfflineReportsPanel';
import SyncButton from './SyncButton';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { pwaStorage } from '@/lib/pwa';
import {
  clearAllConflicts,
  clearOldConflicts,
  getConflictStats
} from '@/lib/pwa/conflictStorage';
import { ConflictHistory } from '@/components/offline/ConflictHistory';

type View = 'sync' | 'reports' | 'storage' | 'conflicts';

interface PWAFeaturesPanelProps {
  defaultView?: View;
}

export default function PWAFeaturesPanel({ defaultView = 'sync' }: PWAFeaturesPanelProps) {
  const [activeView, setActiveView] = useState<View>(defaultView);
  const { isOnline, pendingCount, lastSyncTime } = useOfflineSync();
  const [storageStats, setStorageStats] = useState<any>(null);
  const [conflictStats, setConflictStats] = useState<any>(null);

  // Load stats periodically
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [storage, conflicts] = await Promise.all([
          pwaStorage.getCacheStats(),
          getConflictStats(),
        ]);
        setStorageStats(storage);
        setConflictStats(conflicts);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Tabs configuration
   */
  const tabs = [
    { value: 'sync' as View, label: 'Sync & P2P', icon: ArrowRightLeft, description: 'Sincronização P2P e monitoramento' },
    { value: 'reports' as View, label: 'Relatórios Offline', icon: BarChart3, description: 'Gerar relatórios com dados cacheados' },
    { value: 'storage' as View, label: 'Armazenamento', icon: Database, description: 'Monitorar IndexedDB e cache' },
    { value: 'conflicts' as View, label: 'Conflitos', icon: AlertTriangle, description: 'Resolver conflitos de sincronização' },
  ];

  /**
   * Get active tab icon
   */
  const getActiveIcon = () => {
    const tab = tabs.find(t => t.value === activeView);
    return tab?.icon || Settings;
  };

  const ActiveIcon = getActiveIcon();

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl mb-6 border-b border-slate-800 bg-slate-950/80"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Connection Status */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOnline ? 'bg-green-500/20 border border-green-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'
                }`}>
                {isOnline ? <Cloud className="w-5 h-5 text-green-500" /> : <CloudDownload className="w-5 h-5 text-yellow-500" />}
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-slate-500">
                  Último sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('pt-MZ') : 'Nunca'}
                </p>
              </div>
            </div>

            {/* Pending Items */}
            {pendingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                <span className="text-sm font-medium text-orange-500">
                  {pendingCount} itens pendentes
                </span>
              </motion.div>
            )}

            {/* Sync Button */}
            <SyncButton />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile Horizontal Tabs - Only visible on mobile */}
        <div className="lg:hidden overflow-x-auto border-b border-slate-800 bg-slate-900/30">
          <div className="flex px-4 py-2 gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveView(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 whitespace-nowrap touch-manipulation ${isActive
                    ? 'border-orange-500 bg-orange-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : ''}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Sidebar Tabs - Hidden on mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0 p-4 border-r border-slate-800 bg-slate-900/30">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveView(tab.value)}
                  className={`w-full rounded-xl p-3 border-2 transition-all duration-200 ${isActive
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {tab.label}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {tab.description}
                      </p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-orange-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Actions - Only on desktop */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Ações Rápidas
            </p>
            <div className="space-y-2">
              <button
                onClick={() => pwaStorage.forceCleanup()}
                className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-800/50 transition-colors flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Limpar Cache</span>
              </button>

              <button
                onClick={() => clearAllConflicts()}
                className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-800/50 transition-colors flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300"
              >
                <Settings className="w-4 h-4" />
                <span>Limpar Conflitos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'sync' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Sincronização</h2>
                    <p className="text-sm text-slate-400">
                      Monitore e gerencie a sincronização offline e P2P
                    </p>
                  </div>

                  <P2PSyncPanel />
                </div>
              )}

              {activeView === 'reports' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Relatórios Offline</h2>
                    <p className="text-sm text-slate-400">
                      Gere relatórios usando dados cacheados no dispositivo
                    </p>
                  </div>

                  <OfflineReportsPanel />
                </div>
              )}

              {activeView === 'storage' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Armazenamento</h2>
                    <p className="text-sm text-slate-400">
                      Monitorar IndexedDB e cache do dispositivo
                    </p>
                  </div>

                  {storageStats && (
                    <div className="space-y-4">
                      {/* Storage Usage */}
                      <div className="rounded-2xl p-6 border border-slate-700 bg-slate-800/30">
                        <h3 className="text-lg font-semibold text-white mb-4">Uso de Armazenamento</h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-3xl font-bold text-white">
                              {(storageStats.totalSize / 1024 / 1024).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">MB Usados</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-white">
                              {storageStats.usagePercentage.toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-500">Utilização</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${storageStats.usagePercentage > 80
                                ? 'bg-red-500'
                                : storageStats.usagePercentage > 50
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                }`}
                              style={{ width: `${Math.min(storageStats.usagePercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {storageStats.isNearLimit && (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-sm text-yellow-500 font-medium">
                              ⚠️ Armazenamento quase cheio. Auto-cleanup iniciará em breve.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stores Breakdown */}
                      <div className="rounded-2xl p-6 border border-slate-700 bg-slate-800/30">
                        <h3 className="text-lg font-semibold text-white mb-4">Por Tipo de Dados</h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-orange-500" />
                              <div>
                                <p className="text-sm font-medium text-white">Vendas Pendentes</p>
                                <p className="text-xs text-slate-500">{(storageStats.pending_sales / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-white">
                              {storageStats.pending_sales}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-blue-500" />
                              <div>
                                <p className="text-sm font-medium text-white">Produtos Cacheados</p>
                                <p className="text-xs text-slate-500">{(storageStats.cached_products / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-white">
                              {storageStats.cached_products}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-green-500" />
                              <div>
                                <p className="text-sm font-medium text-white">Funcionários Cacheados</p>
                                <p className="text-xs text-slate-500">{(storageStats.cached_employees / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-white">
                              {storageStats.cached_employees}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 text-purple-500" />
                              <div>
                                <p className="text-sm font-medium text-white">Fila de Sync</p>
                                <p className="text-xs text-slate-500">{(storageStats.sync_queue / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-white">
                              {storageStats.sync_queue}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => pwaStorage.forceCleanup()}
                          className="flex-1 rounded-xl px-4 py-3 bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-400">Limpar Agora</span>
                        </button>

                        <button
                          onClick={() => pwaStorage.clearAll()}
                          className="flex-1 rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Database className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-400">Limpar Tudo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'conflicts' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Conflitos de Sincronização</h2>
                    <p className="text-sm text-slate-400">
                      Gerenciar conflitos detectados durante sincronização offline
                    </p>
                  </div>

                  {conflictStats && (
                    <div className="space-y-6">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="rounded-xl p-4 border border-slate-700 bg-slate-800/30 text-center">
                          <p className="text-2xl font-bold text-white">{conflictStats.total}</p>
                          <p className="text-xs text-slate-500">Total</p>
                        </div>

                        <div className="rounded-xl p-4 border border-slate-700 bg-slate-800/30 text-center">
                          <p className="text-2xl font-bold text-white">{conflictStats.resolved}</p>
                          <p className="text-xs text-slate-500">Resolvidos</p>
                        </div>

                        <div className="rounded-xl p-4 border border-slate-700 bg-slate-800/30 text-center">
                          <p className="text-2xl font-bold text-white">{conflictStats.pending}</p>
                          <p className="text-xs text-slate-500">Pendentes</p>
                        </div>

                        <div className="rounded-xl p-4 border border-slate-700 bg-slate-800/30 text-center">
                          <p className="text-2xl font-bold text-white">
                            {(Object.values(conflictStats.byType || {}) as number[]).reduce((a, b) => (a || 0) + (b || 0), 0)}
                          </p>
                          <p className="text-xs text-slate-500">Por Tipo</p>
                        </div>
                      </div>

                      {/* By Type */}
                      <div className="rounded-2xl p-6 border border-slate-700 bg-slate-800/30">
                        <h3 className="text-lg font-semibold text-white mb-4">Por Tipo de Dados</h3>

                        <div className="space-y-3">
                          {Object.entries(conflictStats.byType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${(count as number) > 0 ? 'bg-orange-500' : 'bg-slate-600'}`} />
                                <span className="text-sm text-slate-300 capitalize">{type}</span>
                              </div>
                              <span className="text-sm font-bold text-white">{count as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => clearOldConflicts()}
                          className="flex-1 rounded-xl px-4 py-3 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-400">Limpar Antigos</span>
                        </button>

                        <button
                          onClick={() => clearAllConflicts()}
                          className="flex-1 rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-400">Limpar Tudo</span>
                        </button>
                      </div>

                      {/* Conflict History */}
                      <div className="mt-8">
                        <div className="rounded-2xl p-6 border border-slate-700 bg-slate-800/30">
                          <ConflictHistory />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
