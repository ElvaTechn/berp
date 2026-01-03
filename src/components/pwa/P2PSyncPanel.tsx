/**
 * ================================================================
 * P2P SYNC PANEL - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Painel UI para sincronização peer-to-peer
 * 
 * USO:
 * <P2PSyncPanel />
 * 1. Dispositivo A: [Initiar Conexão]
 * 2. Dispositivo B: [Conectar via QR Code]
 * 3. Sync automático
 * ================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Smartphone, 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Users,
  ArrowRightLeft,
  Download,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useP2PSync, P2PRole, P2PConnectionState } from '@/lib/pwa/p2pSync';

export default function P2PSyncPanel() {
  const {
    state,
    role,
    connectionString,
    isConnected,
    initHost,
    connectPeer,
    startFullSync,
    disconnect,
    syncResults,
  } = useP2PSync();

  const [showQR, setShowQR] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Init as host by default
  useEffect(() => {
    initHost();
    
    // Auto-sync every 30 seconds when connected
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        startFullSync().catch(console.error);
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [initHost, isConnected, startFullSync]);

  /**
   * Copy connection string
   */
  const handleCopyConnectionString = async () => {
    if (connectionString) {
      try {
        await navigator.clipboard.writeText(connectionString);
        toast.success('Código copiado!', {
          description: 'Cole no outro dispositivo para conectar',
        });
      } catch (error) {
        toast.error('Erro ao copiar');
      }
    }
  };

  /**
   * Handle full sync
   */
  const handleFullSync = async () => {
    setSyncProgress(0);
    
    try {
      const result = await startFullSync();
      
      setSyncProgress(100);
      
      if (result.success) {
        toast.success('Sincronização completa!', {
          description: `${result.syncedCount} itens sincronizados`,
          icon: '✅',
        });
        
        // Show conflicts if any
        if (result.conflictCount > 0) {
          toast.warning('Conflitos detectados', {
            description: `${result.conflictCount} conflitos resolvidos automaticamente`,
            icon: '⚠️',
          });
        }
      } else {
        toast.error('Erro na sincronização', {
          description: result.errors.join(', '),
          icon: '❌',
        });
      }
    } catch (error) {
      toast.error('Falha na sincronização');
    }
  };

  /**
   * Get status text
   */
  const getStatusText = () => {
    switch (state) {
      case P2PConnectionState.IDLE:
        return 'Aguardando conexão...';
      case P2PConnectionState.CONNECTING:
        return 'Conectando...';
      case P2PConnectionState.CONNECTED:
        return 'Conectado';
      case P2PConnectionState.DISCONNECTED:
        return 'Desconectado';
      case P2PConnectionState.ERROR:
        return 'Erro na conexão';
      default:
        return 'Desconhecido';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = () => {
    switch (state) {
      case P2PConnectionState.IDLE:
        return 'text-slate-400';
      case P2PConnectionState.CONNECTING:
        return 'text-blue-400';
      case P2PConnectionState.CONNECTED:
        return 'text-green-400';
      case P2PConnectionState.DISCONNECTED:
        return 'text-yellow-400';
      case P2PConnectionState.ERROR:
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  /**
   * Get status bg
   */
  const getStatusBg = () => {
    switch (state) {
      case P2PConnectionState.CONNECTED:
        return 'bg-green-500/20 border-green-500/30';
      case P2PConnectionState.CONNECTING:
        return 'bg-blue-500/20 border-blue-500/30';
      case P2PConnectionState.ERROR:
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-slate-500/20 border-slate-500/30';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusBg()} border`}>
            {state === P2PConnectionState.CONNECTED ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : state === P2PConnectionState.CONNECTING ? (
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            ) : state === P2PConnectionState.ERROR ? (
              <XCircle className="w-6 h-6 text-red-400" />
            ) : (
              <Wifi className={`w-6 h-6 ${getStatusColor()}`} />
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white">Sincronização P2P</h2>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-sm">
          {role === P2PRole.HOST 
            ? 'Você é o host. Dispositivos podem conectar a você.'
            : 'Você está conectando ao host.'
          }
        </p>
      </div>

      {/* Connection Panel */}
      {role === P2PRole.HOST && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{
            background: 'rgba(30, 30, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Connection String */}
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Código de Conexão
            </label>
            <div className="relative">
              <textarea
                value={connectionString || 'Aguarde...'}
                readOnly
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-300 resize-none"
                rows={3}
              />
              <button
                onClick={handleCopyConnectionString}
                className="absolute top-2 right-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-semibold text-white transition-colors"
                disabled={!connectionString}
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-300 font-medium mb-2">
                  Como conectar outro dispositivo:
                </p>
                <ol className="text-xs text-slate-400 space-y-1">
                  <li>1. Copie o código acima</li>
                  <li>2. No outro dispositivo, cole o código</li>
                  <li>3. Clique em "Conectar"</li>
                  <li>4. Sincronização automática iniciará</li>
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sync Actions */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Full Sync Button */}
          <button
            onClick={handleFullSync}
            disabled={syncProgress > 0 && syncProgress < 100}
            className="w-full rounded-2xl px-6 py-4 font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncProgress > 0 && syncProgress < 100 ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sincronizando... {syncProgress}%</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5" />
                <span>Sincronizar Tudo</span>
              </>
            )}
          </button>

          {/* Sync Results */}
          {syncResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl p-4 mb-4"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-500">
                    Última Sincronização
                  </p>
                  <p className="text-xs text-green-400/80">
                    {new Date().toLocaleString('pt-MZ')}
                  </p>
                </div>
              </div>

              {syncResults[syncResults.length - 1] && (() => {
                const result = syncResults[syncResults.length - 1];
                return (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{result.syncedCount}</p>
                      <p className="text-xs text-slate-400">Sincronizados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{result.conflictCount}</p>
                      <p className="text-xs text-slate-400">Conflitos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{result.errors.length}</p>
                      <p className="text-xs text-slate-400">Erros</p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-white">Dispositivos Conectados</p>
            <p className="text-xs text-blue-400">
              {isConnected ? '1 dispositivo' : 'Aguardando conexão...'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          <Upload className="w-4 h-4 text-blue-400" />
        </div>
      </motion.div>

      {/* Info Card */}
      <div className="mt-6 rounded-2xl p-4 border border-slate-800 bg-slate-900/30">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-300 mb-1">
              O que é sincronizado P2P?
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quando dois dispositivos BizControl 360 estão próximos, eles podem sincronizar automaticamente:
              vendas pendentes, produtos cacheados e dados de funcionários. Isso é útil quando múltiplos vendedores trabalham offline.
            </p>
          </div>
        </div>
      </div>

      {/* Auto-sync indicator */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-2 text-xs text-slate-500"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Auto-sync a cada 30 segundos</span>
        </motion.div>
      )}
    </div>
  );
}
