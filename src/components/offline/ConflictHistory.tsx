/**
 * ================================================================
 * CONFLICT HISTORY COMPONENT - BIZCONTROL 360 ERP
 * ================================================================
 * Display and manage offline sync conflict history
 * Now using IndexedDB for persistent storage
 * ================================================================
 */

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuButton } from '@/components/ui/neu-button';
import {
  getAllConflicts,
  type Conflict,
  deleteConflict,
  clearOldConflicts,
} from '@/lib/pwa/conflictStorage';

export function ConflictHistory() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Load conflicts from IndexedDB/localStorage
  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    try {
      const loadedConflicts = await getAllConflicts();
      setConflicts(loadedConflicts);
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const handleDeleteConflict = async (id: string) => {
    try {
      await deleteConflict(id);
      await loadConflicts();
    } catch (error) {
      console.error('Failed to delete conflict:', error);
    }
  };

  const handleClearOldConflicts = async () => {
    try {
      const cleared = await clearOldConflicts(7);
      await loadConflicts();
      console.log(`Cleared ${cleared} old conflicts`);
    } catch (error) {
      console.error('Failed to clear old conflicts:', error);
    }
  };

  const filteredConflicts = conflicts.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusIcon = (status: Conflict['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-[var(--neu-warning)]" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-[var(--neu-success)]" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-[var(--neu-error)]" />;
    }
  };

  const getTypeLabel = (type: Conflict['type']): string => {
    const labels: Record<Conflict['type'], string> = {
      sale: 'Venda',
      product: 'Produto',
      employee: 'Funcionário',
      company: 'Empresa',
    };
    return labels[type] || type;
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (conflicts.length === 0) {
    return (
      <NeuCard variant="flat">
        <NeuCardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-[var(--neu-success)] mx-auto mb-4" />
          <h3 className="neu-text-h3 mb-2">Sem Conflitos</h3>
          <p className="neu-text-caption text-[var(--neu-text-muted)]">
            Todas as sincronizações foram concluídas com sucesso
          </p>
        </NeuCardContent>
      </NeuCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="neu-text-h2">Histórico de Conflitos</h2>
        <div className="flex flex-wrap gap-2">
          <NeuButton
            size="sm"
            variant={filter === 'all' ? 'accent' : 'convex'}
            onClick={() => setFilter('all')}
          >
            Todos ({conflicts.length})
          </NeuButton>
          <NeuButton
            size="sm"
            variant={filter === 'pending' ? 'accent' : 'convex'}
            onClick={() => setFilter('pending')}
          >
            Pendentes ({conflicts.filter(c => c.status === 'pending').length})
          </NeuButton>
          <NeuButton
            size="sm"
            variant={filter === 'resolved' ? 'accent' : 'convex'}
            onClick={() => setFilter('resolved')}
          >
            Resolvidos ({conflicts.filter(c => c.status === 'resolved').length})
          </NeuButton>
          <NeuButton
            size="sm"
            variant="convex"
            onClick={handleClearOldConflicts}
            className="text-[var(--neu-text-muted)]"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar {'>'}7 dias
          </NeuButton>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredConflicts.map((conflict) => (
            <motion.div
              key={conflict.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <NeuCard variant="convex">
                <NeuCardContent className="p-4">
                  {/* Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpanded(expanded === conflict.id ? null : conflict.id)}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(conflict.status)}
                      <div>
                        <h3 className="neu-text-body font-semibold">
                          {getTypeLabel(conflict.type)}
                        </h3>
                        <p className="neu-text-caption text-[var(--neu-text-muted)]">
                          {formatTimestamp(conflict.timestamp)}
                        </p>
                      </div>
                    </div>
                    {expanded === conflict.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expanded === conflict.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-[var(--neu-border)]"
                      >
                        <div className="space-y-3">
                          {/* Local Data */}
                          <div className="p-3 rounded-lg bg-[var(--neu-surface-hover)]">
                            <p className="neu-text-label font-semibold mb-2">Dados Locais:</p>
                            <pre className="neu-text-caption font-mono text-xs overflow-x-auto">
                              {JSON.stringify(conflict.localData, null, 2)}
                            </pre>
                          </div>

                          {/* Server Data */}
                          <div className="p-3 rounded-lg bg-[var(--neu-surface-hover)]">
                            <p className="neu-text-label font-semibold mb-2">Dados do Servidor:</p>
                            <pre className="neu-text-caption font-mono text-xs overflow-x-auto">
                              {JSON.stringify(conflict.serverData, null, 2)}
                            </pre>
                          </div>

                          {/* Resolution */}
                          {conflict.resolution && (
                            <div className="p-3 rounded-lg bg-[var(--neu-success-light)]">
                              <p className="neu-text-label font-semibold">
                                Resolução: {conflict.resolution === 'local' ? 'Dados Locais' : conflict.resolution === 'server' ? 'Dados do Servidor' : 'Mesclado'}
                              </p>
                            </div>
                          )}

                          {/* Error */}
                          {conflict.error && (
                            <div className="p-3 rounded-lg bg-[var(--neu-error-light)]">
                              <p className="neu-text-label font-semibold text-[var(--neu-error)]">
                                Erro: {conflict.error}
                              </p>
                            </div>
                          )}

                          {/* Delete Action */}
                          <div className="flex justify-end">
                            <NeuButton
                              size="sm"
                              variant="convex"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConflict(conflict.id);
                              }}
                              className="text-[var(--neu-error)]"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Excluir
                            </NeuButton>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NeuCardContent>
              </NeuCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
