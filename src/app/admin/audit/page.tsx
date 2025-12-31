'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuSelect, NeuSelectContent, NeuSelectItem, NeuSelectTrigger, NeuSelectValue } from '@/components/ui/neu-select';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Building2,
  Clock,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { useViewport } from '@/hooks/useViewport';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  ip_address: string;
  user_agent: string;
  success: boolean;
  error: string | null;
  details: string | null;
  timestamp: string;
  user: { id: string; full_name: string; email: string } | null;
  employee: { id: string; full_name: string; email: string } | null;
  company: { id: string; name: string } | null;
}

interface AuditStats {
  totalActions: number;
  totalErrors: number;
  successRate: string;
  actionBreakdown: { action: string; count: number }[];
  errorBreakdown: { action: string; count: number }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Filters {
  availableActions: string[];
  availableResources: string[];
}

export default function AuditLogsPage() {
  const { isMobile } = useViewport();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedSuccess, setSelectedSuccess] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      if (selectedAction) params.set('action', selectedAction);
      if (selectedResource) params.set('resource', selectedResource);
      if (selectedSuccess) params.set('success', selectedSuccess);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar logs');
      }

      setLogs(data.data.logs);
      setStats(data.data.stats);
      setPagination(data.data.pagination);
      setFilters(data.data.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedAction, selectedResource, selectedSuccess, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearFilters = () => {
    setSelectedAction('');
    setSelectedResource('');
    setSelectedSuccess('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadgeColor = (action: string): string => {
    if (action.includes('DELETE') || action.includes('ERROR') || action.includes('VIOLATION')) {
      return 'text-[var(--neu-error)]';
    }
    if (action.includes('CREATE')) {
      return 'text-[var(--neu-success)]';
    }
    if (action.includes('UPDATE') || action.includes('CHANGE')) {
      return 'text-[var(--neu-accent)]';
    }
    return 'text-[var(--neu-text-muted)]';
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'AUTH':
        return <User className="h-4 w-4" />;
      case 'COMPANY':
        return <Building2 className="h-4 w-4" />;
      case 'SYSTEM':
        return <Activity className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const parseDetails = (details: string | null) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <NeuCard variant="concave" size="md">
          <NeuCardContent className="p-6">
            <div className="flex items-center gap-3 text-[var(--neu-error)] mb-4">
              <AlertTriangle className="h-6 w-6" />
              <span className="neu-text-body font-semibold">{error}</span>
            </div>
            <NeuButton onClick={fetchLogs} variant="convex" size="md">
              <RefreshCw className="h-4 w-4" />
              <span>Tentar novamente</span>
            </NeuButton>
          </NeuCardContent>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="neu-text-h1">Logs de Auditoria</h1>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Monitore todas as ações do sistema
          </p>
        </div>
        
        <NeuButton
          onClick={fetchLogs}
          disabled={loading}
          variant="accent"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </NeuButton>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Ações */}
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[var(--neu-accent)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Total de Ações
                </p>
              </div>
              <p className="neu-text-h2">{stats.totalActions.toLocaleString('pt-BR')}</p>
              <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                Ações registradas
              </p>
            </NeuCardContent>
          </NeuCard>

          {/* Erros */}
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-[var(--neu-error)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Erros
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-error)]">
                {stats.totalErrors.toLocaleString('pt-BR')}
              </p>
              <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                Falhas detectadas
              </p>
            </NeuCardContent>
          </NeuCard>

          {/* Taxa de Sucesso */}
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[var(--neu-success)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Taxa de Sucesso
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-success)]">{stats.successRate}%</p>
              <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                Operações bem-sucedidas
              </p>
            </NeuCardContent>
          </NeuCard>

          {/* Registros */}
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[var(--neu-accent)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Registros
                </p>
              </div>
              <p className="neu-text-h2">
                {pagination?.total.toLocaleString('pt-BR') || 0}
              </p>
              <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                Logs encontrados
              </p>
            </NeuCardContent>
          </NeuCard>
        </motion.div>
      )}

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <NeuCard variant="convex" size="md">
          <NeuCardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-[var(--neu-accent)]" />
              <h3 className="neu-text-h3">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Ação */}
              <div className="space-y-2">
                <label className="neu-text-label">Ação</label>
                <NeuSelect 
                  value={selectedAction || 'all'} 
                  onValueChange={(v) => { 
                    setSelectedAction(v === 'all' ? '' : v); 
                    setCurrentPage(1); 
                  }}
                >
                  <NeuSelectTrigger variant="concave" size="sm">
                    <NeuSelectValue placeholder="Todas" />
                  </NeuSelectTrigger>
                  <NeuSelectContent>
                    <NeuSelectItem value="all">Todas</NeuSelectItem>
                    {filters?.availableActions.map((action) => (
                      <NeuSelectItem key={action} value={action}>
                        {action}
                      </NeuSelectItem>
                    ))}
                  </NeuSelectContent>
                </NeuSelect>
              </div>

              {/* Recurso */}
              <div className="space-y-2">
                <label className="neu-text-label">Recurso</label>
                <NeuSelect 
                  value={selectedResource || 'all'} 
                  onValueChange={(v) => { 
                    setSelectedResource(v === 'all' ? '' : v); 
                    setCurrentPage(1); 
                  }}
                >
                  <NeuSelectTrigger variant="concave" size="sm">
                    <NeuSelectValue placeholder="Todos" />
                  </NeuSelectTrigger>
                  <NeuSelectContent>
                    <NeuSelectItem value="all">Todos</NeuSelectItem>
                    {filters?.availableResources.map((resource) => (
                      <NeuSelectItem key={resource} value={resource}>
                        {resource}
                      </NeuSelectItem>
                    ))}
                  </NeuSelectContent>
                </NeuSelect>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="neu-text-label">Status</label>
                <NeuSelect 
                  value={selectedSuccess || 'all'} 
                  onValueChange={(v) => { 
                    setSelectedSuccess(v === 'all' ? '' : v); 
                    setCurrentPage(1); 
                  }}
                >
                  <NeuSelectTrigger variant="concave" size="sm">
                    <NeuSelectValue placeholder="Todos" />
                  </NeuSelectTrigger>
                  <NeuSelectContent>
                    <NeuSelectItem value="all">Todos</NeuSelectItem>
                    <NeuSelectItem value="true">Sucesso</NeuSelectItem>
                    <NeuSelectItem value="false">Falha</NeuSelectItem>
                  </NeuSelectContent>
                </NeuSelect>
              </div>

              {/* Data Inicial */}
              <div className="space-y-2">
                <label className="neu-text-label">Data Inicial</label>
                <NeuInput
                  type="date"
                  value={startDate}
                  onChange={(e) => { 
                    setStartDate(e.target.value); 
                    setCurrentPage(1); 
                  }}
                />
              </div>

              {/* Data Final */}
              <div className="space-y-2">
                <label className="neu-text-label">Data Final</label>
                <NeuInput
                  type="date"
                  value={endDate}
                  onChange={(e) => { 
                    setEndDate(e.target.value); 
                    setCurrentPage(1); 
                  }}
                />
              </div>

              {/* Limpar Filtros */}
              <div className="flex items-end">
                <NeuButton 
                  variant="convex" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Limpar Filtros
                </NeuButton>
              </div>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Tabela de Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NeuCard variant="concave" size="md">
          <NeuCardContent className="p-0">
            <div className="p-6 border-b border-[var(--neu-border)]">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--neu-accent)]" />
                <h3 className="neu-text-h3">Histórico de Logs</h3>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-[var(--neu-accent)]" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-[var(--neu-accent)]" />
                </div>
                <h3 className="neu-text-h2 mb-2">Nenhum log encontrado</h3>
                <p className="neu-text-body text-[var(--neu-text-muted)]">
                  Ajuste os filtros para ver mais resultados
                </p>
              </div>
            ) : isMobile ? (
              /* Mobile Card View */
              <div className="space-y-4 p-4">
                {logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NeuCard variant="convex" size="sm">
                      <NeuCardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(log.resource)}
                            <span className={`px-2 py-1 rounded-lg neu-convex-xs text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                          </div>
                          {log.success ? (
                            <CheckCircle className="h-5 w-5 text-[var(--neu-success)] flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-[var(--neu-error)] flex-shrink-0" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="space-y-2">
                          <div>
                            <p className="neu-text-caption text-[var(--neu-text-muted)]">Recurso</p>
                            <p className="neu-text-body">
                              {log.resource}
                              {log.resource_id && (
                                <span className="neu-text-caption text-[var(--neu-text-muted)]">
                                  {' '}({log.resource_id.slice(0, 8)}...)
                                </span>
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="neu-text-caption text-[var(--neu-text-muted)]">Usuário</p>
                            <p className="neu-text-body font-medium">
                              {log.user?.full_name || log.employee?.full_name || 'Sistema'}
                            </p>
                            {(log.user?.email || log.employee?.email) && (
                              <p className="neu-text-caption text-[var(--neu-text-muted)] truncate">
                                {log.user?.email || log.employee?.email}
                              </p>
                            )}
                            {log.company && (
                              <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                {log.company.name}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="neu-text-caption text-[var(--neu-text-muted)]">IP</p>
                              <p className="neu-text-caption font-mono">{log.ip_address}</p>
                            </div>
                            <div className="text-right">
                              <p className="neu-text-caption text-[var(--neu-text-muted)]">Data/Hora</p>
                              <p className="neu-text-caption font-mono">{formatDate(log.timestamp)}</p>
                            </div>
                          </div>

                          {(log.error || log.details) && (
                            <div>
                              <p className="neu-text-caption text-[var(--neu-text-muted)]">Detalhes</p>
                              {log.error ? (
                                <p className="neu-text-caption text-[var(--neu-error)]">{log.error}</p>
                              ) : log.details ? (
                                <p className="neu-text-caption text-[var(--neu-text-muted)] break-all">
                                  {JSON.stringify(parseDetails(log.details)).slice(0, 100)}...
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </NeuCardContent>
                    </NeuCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--neu-base)] border-b border-[var(--neu-border)]">
                      <tr>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Data/Hora
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Ação
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Recurso
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Usuário
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          IP
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Detalhes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)] transition-colors"
                        >
                          <td className="px-6 py-4 neu-text-caption font-mono whitespace-nowrap">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getResourceIcon(log.resource)}
                              <span className="neu-text-body">{log.resource}</span>
                              {log.resource_id && (
                                <span className="neu-text-caption text-[var(--neu-text-muted)]">
                                  ({log.resource_id.slice(0, 8)}...)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="neu-text-body font-medium">
                                {log.user?.full_name || log.employee?.full_name || 'Sistema'}
                              </p>
                              <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                {log.user?.email || log.employee?.email || '-'}
                              </p>
                              {log.company && (
                                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                  {log.company.name}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 neu-text-caption font-mono">
                            {log.ip_address}
                          </td>
                          <td className="px-6 py-4">
                            {log.success ? (
                              <div className="flex items-center gap-2 text-[var(--neu-success)]">
                                <CheckCircle className="h-4 w-4" />
                                <span className="neu-text-caption font-semibold">Sucesso</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[var(--neu-error)]">
                                <XCircle className="h-4 w-4" />
                                <span className="neu-text-caption font-semibold">Falha</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            {log.error ? (
                              <span className="neu-text-caption text-[var(--neu-error)] truncate block">
                                {log.error}
                              </span>
                            ) : log.details ? (
                              <span 
                                className="neu-text-caption text-[var(--neu-text-muted)] truncate block" 
                                title={log.details}
                              >
                                {JSON.stringify(parseDetails(log.details)).slice(0, 50)}...
                              </span>
                            ) : (
                              <span className="neu-text-caption text-[var(--neu-text-muted)]">-</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-[var(--neu-border)]">
                    <div className="neu-text-caption text-[var(--neu-text-muted)] text-center sm:text-left">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} registros
                    </div>
                    <div className="flex items-center gap-2">
                      <NeuButton
                        variant="convex"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Anterior</span>
                      </NeuButton>
                      <span className="neu-text-caption px-3">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <NeuButton
                        variant="convex"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={!pagination.hasNext}
                      >
                        <span>Próxima</span>
                        <ChevronRight className="h-4 w-4" />
                      </NeuButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </NeuCardContent>
        </NeuCard>
      </motion.div>
    </div>
  );
}
