"use client";

import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  Shield, 
  Activity, 
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Terminal
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface HealthStatus {
  database: 'online' | 'offline' | 'degraded';
  api: 'online' | 'offline' | 'degraded';
  storage: 'online' | 'offline' | 'degraded';
  uptime: number;
  lastBackup: string;
  totalUsers: number;
  totalCompanies: number;
}

export default function AdminSystemPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // Simula health check
  useEffect(() => {
    const fetchHealth = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHealth({
        database: 'online',
        api: 'online',
        storage: 'online',
        uptime: 99.9,
        lastBackup: new Date().toISOString(),
        totalUsers: 156,
        totalCompanies: 23
      });
      setLoading(false);
    };

    fetchHealth();
  }, []);

  const handleBackup = async () => {
    setCreatingBackup(true);
    toast.info('Iniciando backup global...', {
      description: 'Isso pode levar alguns minutos'
    });

    // Simula backup
    await new Promise(resolve => setTimeout(resolve, 3000));

    setCreatingBackup(false);
    toast.success('Backup concluído!', {
      description: 'Arquivo: biz360_backup_20251221.zip (2.4 MB)'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'offline': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'degraded': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
          <Server className="w-10 h-10 text-orange-500" />
          Sistema <span className="text-orange-400">360</span>
        </h1>
        <p className="text-slate-400 font-medium mt-1">
          Monitoramento e manutenção do infrastructure BizControl
        </p>
      </motion.div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <Database className="w-5 h-5 text-orange-400" />
            {loading ? (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(health?.database ?? 'offline')}`}>
                {health?.database?.toUpperCase() ?? 'OFFLINE'}
              </div>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-300">PostgreSQL</h3>
          <p className="text-xs text-slate-500">Banco de Dados Principal</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-orange-400" />
            {loading ? (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(health?.api ?? 'offline')}`}>
                {health?.api?.toUpperCase() ?? 'OFFLINE'}
              </div>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-300">API REST</h3>
          <p className="text-xs text-slate-500">Pontos de Conexão</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-5 h-5 text-orange-400" />
            {loading ? (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(health?.storage ?? 'offline')}`}>
                {health?.storage?.toUpperCase() ?? 'OFFLINE'}
              </div>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-300">Storage</h3>
          <p className="text-xs text-slate-500">Arquivos e Backups</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold text-orange-400">
              {loading ? '...' : `${health?.uptime}%`}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-300">Uptime</h3>
          <p className="text-xs text-slate-500">Últimas 24h</p>
        </motion.div>
      </div>

      {/* System Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/5 to-orange-600/10 border border-orange-500/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Estatísticas Globais
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total de Empresas</span>
              <span className="text-xl font-black text-orange-400">
                {loading ? '...' : health?.totalCompanies}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total de Utilizadores</span>
              <span className="text-xl font-black text-orange-400">
                {loading ? '...' : health?.totalUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Espaço Utilizado</span>
              <span className="text-xl font-black text-orange-400">2.4 GB</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/5 to-orange-600/10 border border-orange-500/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-orange-400" />
            Último Backup
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Data/Hora</span>
              <span className="text-sm font-bold text-orange-400">
                {loading ? '...' : new Date(health?.lastBackup || Date.now()).toLocaleString('pt-MZ')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tamanho</span>
              <span className="text-sm font-bold text-orange-400">2.4 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
                COMPLETO
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-orange-400" />
          Ações de Manutenção
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleBackup}
            disabled={creatingBackup}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {creatingBackup ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Backup Global
              </>
            )}
          </button>

          <button
            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all hover:scale-[1.02]"
          >
            <RefreshCw className="w-5 h-5" />
            Reiniciar Serviços
          </button>

          <button
            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all hover:scale-[1.02]"
          >
            <Shield className="w-5 h-5" />
            Validar Integridade
          </button>

          <button
            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all hover:scale-[1.02]"
          >
            <AlertTriangle className="w-5 h-5" />
            Logs de Erro
          </button>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3"
      >
        <CheckCircle2 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-orange-300 mb-1">Sistema Saudável</h4>
          <p className="text-xs text-slate-400">
            Todos os serviços estão operando normalmente. O monitoramento é automático e 
            os backups são realizados diariamente às 02:00 AM.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
