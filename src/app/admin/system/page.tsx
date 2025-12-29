"use client";

import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
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
  Terminal,
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setHealth({
        database: 'online',
        api: 'online',
        storage: 'online',
        uptime: 99.9,
        lastBackup: new Date().toISOString(),
        totalUsers: 156,
        totalCompanies: 23,
      });
      setLoading(false);
    };

    fetchHealth();
  }, []);

  const handleBackup = async () => {
    setCreatingBackup(true);
    toast.info('Iniciando backup global...', {
      description: 'Isso pode levar alguns minutos',
    });

    // Simula backup
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setCreatingBackup(false);
    toast.success('Backup concluído!', {
      description: 'Arquivo: biz360_backup_20251221.zip (2.4 MB)',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-[var(--neu-success)]';
      case 'offline':
        return 'text-[var(--neu-error)]';
      case 'degraded':
        return 'text-[var(--neu-warning)]';
      default:
        return 'text-[var(--neu-text-muted)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="neu-text-h1 flex items-center gap-3">
          <Server className="w-10 h-10 text-[var(--neu-accent)]" />
          Sistema 360
        </h1>
        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
          Monitoramento e manutenção da infraestrutura BizControl
        </p>
      </motion.div>

      {/* Health Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Database */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-[var(--neu-accent)]" />
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--neu-accent)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className={`px-2 py-1 rounded-lg neu-convex-xs text-xs font-bold ${getStatusColor(health?.database ?? 'offline')}`}>
                  {health?.database?.toUpperCase() ?? 'OFFLINE'}
                </span>
              )}
            </div>
            <h3 className="neu-text-body font-bold">PostgreSQL</h3>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">Banco de Dados Principal</p>
          </NeuCardContent>
        </NeuCard>

        {/* API */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-[var(--neu-accent)]" />
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--neu-accent)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className={`px-2 py-1 rounded-lg neu-convex-xs text-xs font-bold ${getStatusColor(health?.api ?? 'offline')}`}>
                  {health?.api?.toUpperCase() ?? 'OFFLINE'}
                </span>
              )}
            </div>
            <h3 className="neu-text-body font-bold">API REST</h3>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">Pontos de Conexão</p>
          </NeuCardContent>
        </NeuCard>

        {/* Storage */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="w-5 h-5 text-[var(--neu-accent)]" />
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--neu-accent)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className={`px-2 py-1 rounded-lg neu-convex-xs text-xs font-bold ${getStatusColor(health?.storage ?? 'offline')}`}>
                  {health?.storage?.toUpperCase() ?? 'OFFLINE'}
                </span>
              )}
            </div>
            <h3 className="neu-text-body font-bold">Storage</h3>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">Arquivos e Backups</p>
          </NeuCardContent>
        </NeuCard>

        {/* Uptime */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-[var(--neu-accent)]" />
              <span className="neu-text-caption font-bold text-[var(--neu-accent)]">
                {loading ? '...' : `${health?.uptime}%`}
              </span>
            </div>
            <h3 className="neu-text-body font-bold">Uptime</h3>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">Últimas 24h</p>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* System Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Global Stats */}
        <NeuCard variant="convex" size="md">
          <NeuCardContent className="p-6">
            <h3 className="neu-text-h3 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--neu-accent)]" />
              Estatísticas Globais
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="neu-text-body text-[var(--neu-text-muted)]">Total de Empresas</span>
                <span className="neu-text-h3 text-[var(--neu-accent)]">
                  {loading ? '...' : health?.totalCompanies}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="neu-text-body text-[var(--neu-text-muted)]">Total de Utilizadores</span>
                <span className="neu-text-h3 text-[var(--neu-accent)]">
                  {loading ? '...' : health?.totalUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="neu-text-body text-[var(--neu-text-muted)]">Espaço Utilizado</span>
                <span className="neu-text-h3 text-[var(--neu-accent)]">2.4 GB</span>
              </div>
            </div>
          </NeuCardContent>
        </NeuCard>

        {/* Last Backup */}
        <NeuCard variant="convex" size="md">
          <NeuCardContent className="p-6">
            <h3 className="neu-text-h3 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-[var(--neu-accent)]" />
              Último Backup
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="neu-text-body text-[var(--neu-text-muted)]">Data/Hora</span>
                <span className="neu-text-caption font-bold text-[var(--neu-accent)]">
                  {loading ? '...' : new Date(health?.lastBackup || Date.now()).toLocaleString('pt-MZ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="neu-text-body text-[var(--neu-text-muted)]">Tamanho</span>
                <span className="neu-text-caption font-bold text-[var(--neu-accent)]">2.4 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="neu-text-body text-[var(--neu-text-muted)]">Status</span>
                <span className="px-2 py-1 rounded-lg neu-convex-xs text-xs font-bold text-[var(--neu-success)]">
                  COMPLETO
                </span>
              </div>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NeuCard variant="convex" size="md">
          <NeuCardContent className="p-6">
            <h3 className="neu-text-h3 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[var(--neu-accent)]" />
              Ações de Manutenção
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NeuButton
                onClick={handleBackup}
                disabled={creatingBackup}
                variant="accent"
                size="lg"
              >
                {creatingBackup ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Backup Global</span>
                  </>
                )}
              </NeuButton>

              <NeuButton
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                variant="convex"
                size="lg"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reiniciar Serviços</span>
              </NeuButton>

              <NeuButton
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                variant="convex"
                size="lg"
              >
                <Shield className="w-5 h-5" />
                <span>Validar Integridade</span>
              </NeuButton>

              <NeuButton
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                variant="convex"
                size="lg"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Logs de Erro</span>
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <NeuCard variant="concave" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--neu-success)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="neu-text-body font-bold text-[var(--neu-success)] mb-1">
                  Sistema Saudável
                </h4>
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Todos os serviços estão operando normalmente. O monitoramento é automático e os
                  backups são realizados diariamente às 02:00 AM.
                </p>
              </div>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>
    </div>
  );
}
