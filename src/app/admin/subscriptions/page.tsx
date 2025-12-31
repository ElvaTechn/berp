"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuSelect, NeuSelectContent, NeuSelectItem, NeuSelectTrigger, NeuSelectValue } from '@/components/ui/neu-select';
import { useViewport } from '@/hooks/useViewport';
import {
  Building2,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Loader2,
  Clock,
} from 'lucide-react';
import { format, differenceInDays, addMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscription_status: string;
  subscription_type: string;
  subscription_end: string | null;
  created_at: string;
}

export default function SubscriptionsPage() {
  const { isMobile } = useViewport();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      toast.error('Não foi possível carregar as subscrições');
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.subscription_status === statusFilter);
    }

    setFilteredCompanies(filtered);
  };

  const getStatusBadge = (status: string, endDate: string | null) => {
    const daysUntilExpiry = endDate ? differenceInDays(new Date(endDate), new Date()) : null;

    if (status === 'activo') {
      if (daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        return (
          <span className="px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold text-[var(--neu-warning)]">
            Expira em {daysUntilExpiry}d
          </span>
        );
      }
      if (daysUntilExpiry !== null && daysUntilExpiry <= 0) {
        return (
          <span className="px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold text-[var(--neu-error)]">
            Expirado
          </span>
        );
      }
      return (
        <span className="px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold text-[var(--neu-success)]">
          Activo
        </span>
      );
    }
    if (status === 'inactivo') {
      return (
        <span className="px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold text-[var(--neu-error)]">
          Inactivo
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold text-[var(--neu-text-muted)]">
        Pendente
      </span>
    );
  };

  const handleRenew = async (company: Company, months: number) => {
    setUpdating(true);
    try {
      const newEndDate = company.subscription_end
        ? addMonths(new Date(company.subscription_end), months)
        : addMonths(new Date(), months);

      const res = await fetch(`/api/admin/subscriptions/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_status: 'activo',
          subscription_end: newEndDate.toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to renew');

      toast.success(`Subscrição renovada: +${months} meses adicionados`);
      loadData();
    } catch {
      toast.error('Não foi possível renovar a subscrição');
    } finally {
      setUpdating(false);
    }
  };

  const handleSuspend = async (company: Company) => {
    if (!confirm(`Deseja suspender a subscrição de "${company.name}"?`)) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_status: 'inactivo' }),
      });

      if (!res.ok) throw new Error('Failed to suspend');

      toast.success('Subscrição suspensa - A empresa não terá mais acesso');
      loadData();
    } catch {
      toast.error('Não foi possível suspender a subscrição');
    } finally {
      setUpdating(false);
    }
  };

  const handleActivate = async (company: Company) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_status: 'activo',
          subscription_end: addMonths(new Date(), 1).toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to activate');

      toast.success('Subscrição activada - 1 mês de acesso concedido');
      loadData();
    } catch {
      toast.error('Não foi possível activar a subscrição');
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.subscription_status === 'activo').length,
    inactive: companies.filter((c) => c.subscription_status === 'inactivo').length,
    expiring: companies.filter((c) => {
      if (!c.subscription_end) return false;
      const days = differenceInDays(new Date(c.subscription_end), new Date());
      return days <= 7 && days > 0;
    }).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin" />
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
          <h1 className="neu-text-h1">Gestão de Subscrições</h1>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Controle as subscrições das empresas
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--neu-accent)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">Total</p>
            </div>
            <p className="neu-text-h2">{stats.total}</p>
          </NeuCardContent>
        </NeuCard>

        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[var(--neu-success)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">Activas</p>
            </div>
            <p className="neu-text-h2 text-[var(--neu-success)]">{stats.active}</p>
          </NeuCardContent>
        </NeuCard>

        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--neu-warning)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">A expirar</p>
            </div>
            <p className="neu-text-h2 text-[var(--neu-warning)]">{stats.expiring}</p>
          </NeuCardContent>
        </NeuCard>

        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <XCircle className="w-5 h-5 text-[var(--neu-error)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">Inactivas</p>
            </div>
            <p className="neu-text-h2 text-[var(--neu-error)]">{stats.inactive}</p>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <NeuCard variant="convex" size="md">
          <NeuCardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <NeuInput
                  type="text"
                  placeholder="Pesquisar empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <NeuSelect value={statusFilter} onValueChange={setStatusFilter}>
                <NeuSelectTrigger variant="concave" size="md" className="w-full sm:w-[200px]">
                  <NeuSelectValue placeholder="Filtrar por status" />
                </NeuSelectTrigger>
                <NeuSelectContent>
                  <NeuSelectItem value="all">Todos</NeuSelectItem>
                  <NeuSelectItem value="activo">Activo</NeuSelectItem>
                  <NeuSelectItem value="inactivo">Inactivo</NeuSelectItem>
                  <NeuSelectItem value="pendente">Pendente</NeuSelectItem>
                </NeuSelectContent>
              </NeuSelect>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Companies List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NeuCard variant="concave" size="md">
          <NeuCardContent className="p-0">
            <div className="p-6 border-b border-[var(--neu-border)]">
              <h3 className="neu-text-h3">Empresas ({filteredCompanies.length})</h3>
            </div>

            {filteredCompanies.length > 0 ? (
              <div className="p-6 space-y-4">
                {filteredCompanies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <NeuCard variant="convex" size="sm">
                      <NeuCardContent className="p-4">
                        <div className="flex flex-col gap-4">
                          {/* Company Info */}
                          <div className="flex items-start sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-xl neu-surface neu-convex-md flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-6 h-6 text-[var(--neu-accent)]" />
                            </div>
                            <div>
                              <h4 className="neu-text-body font-bold">{company.name}</h4>
                              <p className="neu-text-caption text-[var(--neu-text-muted)]">{company.email}</p>
                              {company.subscription_end && (
                                <p className="neu-text-caption text-[var(--neu-text-muted)] flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  Expira: {format(new Date(company.subscription_end), "dd 'de' MMMM, yyyy", { locale: pt })}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            {getStatusBadge(company.subscription_status, company.subscription_end)}

                            <div className="flex gap-2 flex-wrap">
                              {company.subscription_status !== 'activo' && (
                                <NeuButton
                                  variant="accent"
                                  size={isMobile ? "sm" : "md"}
                                  onClick={() => handleActivate(company)}
                                  disabled={updating}
                                  className={isMobile ? "flex-1" : ""}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Activar</span>
                                </NeuButton>
                              )}

                              {company.subscription_status === 'activo' && (
                                <>
                                  <NeuButton
                                    variant="convex"
                                    size={isMobile ? "sm" : "md"}
                                    onClick={() => handleRenew(company, 1)}
                                    disabled={updating}
                                    className={isMobile ? "flex-1" : ""}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>+1 mês</span>
                                  </NeuButton>
                                  <NeuButton
                                    variant="ghost"
                                    size={isMobile ? "sm" : "md"}
                                    onClick={() => handleSuspend(company)}
                                    disabled={updating}
                                    className={isMobile ? "flex-1" : ""}
                                  >
                                    <XCircle className="w-4 h-4 text-[var(--neu-error)]" />
                                    <span>Suspender</span>
                                  </NeuButton>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </NeuCardContent>
                    </NeuCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-10 h-10 text-[var(--neu-accent)]" />
                </div>
                <h3 className="neu-text-h2 mb-2">Nenhuma empresa encontrada</h3>
                <p className="neu-text-body text-[var(--neu-text-muted)]">
                  Ajuste os filtros para ver mais resultados
                </p>
              </div>
            )}
          </NeuCardContent>
        </NeuCard>
      </motion.div>
    </div>
  );
}
