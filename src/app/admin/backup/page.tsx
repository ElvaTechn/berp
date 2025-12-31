"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuSwitch } from '@/components/ui/neu-switch';
import {
  Download,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { MobileScrollWrapper } from '@/components/ui/MobileScrollWrapper';
import { useViewport } from '@/hooks/useViewport';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

interface BackupRecord {
  id: string;
  createdAt: string;
  size: string;
  records: number;
  status: 'completed' | 'failed';
}

export default function BackupPage() {
  const { isMobile } = useViewport();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [lastBackup, setLastBackup] = useState<BackupRecord | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setBackups(data.backups || []);
      setLastBackup(data.lastBackup);
      setAutoBackupEnabled(data.autoBackupEnabled || false);
    } catch {
      toast.error('Erro ao carregar histórico de backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' });

      if (!res.ok) throw new Error('Backup failed');

      // Get backup data for download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `berp-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Backup criado com sucesso!', {
        description: 'O download começou automaticamente',
      });
      loadBackups();
    } catch {
      toast.error('Não foi possível criar o backup');
    } finally {
      setCreating(false);
    }
  };

  const handleAutoBackupToggle = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/backup/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoBackupEnabled: enabled }),
      });

      if (res.ok) {
        setAutoBackupEnabled(enabled);
        toast.success(`Backup automático ${enabled ? 'ativado' : 'desativado'}`);
      }
    } catch {
      toast.error('Erro ao atualizar configuração');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="neu-text-h1 text-2xl sm:text-3xl">Backup e Recuperação</h1>
        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1 text-sm">
          Faça backup dos dados do sistema
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Manual Backup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <NeuCard variant="convex" size="lg">
            <NeuCardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full neu-surface neu-convex-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="w-10 h-10 text-[var(--neu-accent)]" />
                </div>
                <h2 className="neu-text-h2 mb-2">Criar Novo Backup</h2>
                <p className="neu-text-body text-[var(--neu-text-muted)]">
                  Exporte todos os dados do sistema em formato JSON
                </p>
              </div>

              {/* Info Card */}
              <NeuCard variant="concave" size="sm">
                <NeuCardContent className="p-4">
                  <h4 className="neu-text-body font-semibold text-[var(--neu-accent)] mb-3">
                    O backup inclui:
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Empresas e proprietários',
                      'Funcionários',
                      'Produtos e categorias',
                      'Vendas e itens',
                      'Reservas',
                      'Metadados do sistema',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[var(--neu-success)]" />
                        <span className="neu-text-caption">{item}</span>
                      </div>
                    ))}
                  </div>
                </NeuCardContent>
              </NeuCard>

              {/* Warning */}
              <NeuCard variant="concave" size="sm">
                <NeuCardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--neu-warning)] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="neu-text-body font-semibold text-[var(--neu-warning)]">Atenção</h4>
                      <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                        O backup pode conter dados sensíveis. Guarde o ficheiro em local seguro.
                      </p>
                    </div>
                  </div>
                </NeuCardContent>
              </NeuCard>

              {/* Create Button */}
              <NeuButton
                onClick={createBackup}
                disabled={creating}
                variant="accent"
                size="lg"
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>A criar backup...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Criar e Descarregar Backup</span>
                  </>
                )}
              </NeuButton>
            </NeuCardContent>
          </NeuCard>
        </motion.div>

        {/* Last Backup Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NeuCard variant="convex" size="md">
            <NeuCardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[var(--neu-accent)]" />
                <h3 className="neu-text-h3">Último Backup</h3>
              </div>

              {lastBackup ? (
                <NeuCard variant="concave" size="sm">
                  <NeuCardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold ${
                          lastBackup.status === 'completed'
                            ? 'text-[var(--neu-success)]'
                            : 'text-[var(--neu-error)]'
                        }`}
                      >
                        {lastBackup.status === 'completed' ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Completo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Falhou</span>
                          </div>
                        )}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="neu-text-caption text-[var(--neu-text-muted)]">Data:</span>
                        <span className="neu-text-caption font-medium">
                          {format(new Date(lastBackup.createdAt), "dd MMM yyyy, HH:mm", { locale: pt })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="neu-text-caption text-[var(--neu-text-muted)]">Tamanho:</span>
                        <span className="neu-text-caption font-medium">{lastBackup.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="neu-text-caption text-[var(--neu-text-muted)]">Registros:</span>
                        <span className="neu-text-caption font-medium">{lastBackup.records.toLocaleString()}</span>
                      </div>
                    </div>
                  </NeuCardContent>
                </NeuCard>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-3">
                    <HardDrive className="w-8 h-8 text-[var(--neu-text-muted)]" />
                  </div>
                  <p className="neu-text-body text-[var(--neu-text-muted)]">Nenhum backup realizado</p>
                  <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">Crie o primeiro backup agora</p>
                </div>
              )}
            </NeuCardContent>
          </NeuCard>

          {/* Auto-backup Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <NeuCard variant="convex" size="sm">
              <NeuCardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="neu-text-body font-medium">Backup Automático</p>
                    <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">Backup diário às 02:00</p>
                  </div>
                  <NeuSwitch
                    checked={autoBackupEnabled}
                    onCheckedChange={handleAutoBackupToggle}
                    variant="success"
                    size="md"
                  />
                </div>
              </NeuCardContent>
            </NeuCard>
          </motion.div>
        </motion.div>
      </div>

      {/* Backup History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <NeuCard variant="concave" size="md">
          <NeuCardContent className="p-0">
            <div className="p-6 border-b border-[var(--neu-border)] flex items-center justify-between">
              <h3 className="neu-text-h3">Histórico de Backups</h3>
              <NeuButton variant="convex" size="sm" onClick={loadBackups}>
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </NeuButton>
            </div>

            {backups.length > 0 ? (
              <div className="overflow-x-auto">
                <MobileScrollWrapper isMobile={isMobile} itemCount={backups.length}>
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-[var(--neu-base)] border-b border-[var(--neu-border)]">
                    <tr>
                      <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Data/Hora</th>
                      <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Tamanho</th>
                      <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Registros</th>
                      <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Status</th>
                      <th className="px-6 py-4 text-right neu-text-label text-[var(--neu-text-muted)]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup, index) => (
                      <motion.tr
                        key={backup.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {backup.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-[var(--neu-success)]" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[var(--neu-error)]" />
                            )}
                            <span className="neu-text-body">
                              {format(new Date(backup.createdAt), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: pt })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="neu-text-body">{backup.size}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="neu-text-body">{backup.records.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold ${
                              backup.status === 'completed'
                                ? 'text-[var(--neu-success)]'
                                : 'text-[var(--neu-error)]'
                            }`}
                          >
                            {backup.status === 'completed' ? 'Completo' : 'Falhou'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {backup.status === 'completed' && (
                              <NeuButton variant="convex" size="icon" title="Download">
                                <Download className="w-4 h-4" />
                              </NeuButton>
                            )}
                            <NeuButton variant="ghost" size="icon" title="Eliminar">
                              <Trash2 className="w-4 h-4 text-[var(--neu-error)]" />
                            </NeuButton>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                </MobileScrollWrapper>
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
                  <Database className="w-10 h-10 text-[var(--neu-accent)]" />
                </div>
                <h3 className="neu-text-h2 mb-2">Nenhum backup no histórico</h3>
                <p className="neu-text-body text-[var(--neu-text-muted)]">
                  Crie o primeiro backup usando o botão acima
                </p>
              </div>
            )}
          </NeuCardContent>
        </NeuCard>
      </motion.div>
    </div>
  );
}
