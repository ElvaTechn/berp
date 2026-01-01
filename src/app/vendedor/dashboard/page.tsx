/**
 * ================================================================
 * DASHBOARD VENDEDOR - SIMPLIFICADO (APENAS VENDAS) + RESPONSIVE
 * ================================================================
 * Mostra apenas as vendas realizadas pelo vendedor
 * Otimizado para mobile, tablet e desktop
 * ================================================================
 */

"use client";

import { useEffect, useState } from 'react';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuButton } from '@/components/ui/neu-button';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Package,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

interface VendaItem {
  produto: string;
  barcode: string | null;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  lucro: number;
}

interface Venda {
  id: string;
  data: string;
  total: number;
  subtotal: number;
  desconto: number;
  lucro: number;
  metodo_pagamento: string;
  status_pagamento: string;
  items: VendaItem[];
}

interface DashboardData {
  vendedor: {
    id: string;
    nome: string;
  };
  resumo: {
    total_vendas: number;
    valor_total: number;
    lucro_total: number;
    vendas_por_metodo: Record<string, number>;
  };
  vendas: Venda[];
}

export default function VendedorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/vendedor/dashboard');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar dados');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center p-4">
        <NeuCard variant="flat" className="w-full max-w-sm text-center">
          <NeuCardContent>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full neu-surface neu-concave-lg flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-[var(--neu-accent)] animate-spin" />
            </div>
            <p className="neu-text-body text-[var(--neu-text-muted)]">Carregando vendas...</p>
          </NeuCardContent>
        </NeuCard>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center p-4">
        <NeuCard variant="flat" className="w-full max-w-md text-center">
          <NeuCardContent>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full neu-surface neu-concave-lg flex items-center justify-center">
              <XCircle className="w-10 h-10 text-[var(--neu-error)]" />
            </div>
            <h2 className="neu-text-h2 mb-2">Erro ao Carregar</h2>
            <p className="neu-text-body text-[var(--neu-text-muted)] mb-6">
              {error || 'Não foi possível carregar as vendas'}
            </p>
            <NeuButton variant="accent" onClick={fetchData}>
              Tentar Novamente
            </NeuButton>
          </NeuCardContent>
        </NeuCard>
      </div>
    );
  }

  const { vendedor, resumo, vendas } = data;

  // Ícone do método de pagamento
  const getPaymentIcon = (metodo: string) => {
    switch (metodo) {
      case 'DINHEIRO': return '💵';
      case 'MPESA': return '📱';
      case 'EMOLA': return '📱';
      case 'CARTAO': return '💳';
      case 'MULTICAIXA': return '🏧';
      case 'TRANSFERENCIA': return '🏦';
      default: return '💰';
    }
  };

  // Status do pagamento
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="text-[var(--neu-success)] flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Pago</span>;
      case 'PENDING':
        return <span className="text-[var(--neu-warning)] flex items-center gap-1"><Clock className="w-4 h-4" /> Pendente</span>;
      case 'PARTIAL':
        return <span className="text-[var(--neu-warning)] flex items-center gap-1"><Clock className="w-4 h-4" /> Parcial</span>;
      case 'REFUNDED':
        return <span className="text-[var(--neu-error)] flex items-center gap-1"><XCircle className="w-4 h-4" /> Reembolsado</span>;
      default:
        return status;
    }
  };

  return (
    <MaxWidthContainer size="xl">
      <div className="min-h-screen bg-[var(--neu-base)] p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="neu-text-h1 mb-1">
              👋 Olá, {vendedor.nome}
            </h1>
            <p className="neu-text-body text-[var(--neu-text-muted)]">
              Suas vendas realizadas
            </p>
          </div>
          
          {/* Refresh Button */}
          <NeuButton
            variant="convex"
            size="md"
            onClick={fetchData}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Atualizar</span>
          </NeuButton>
        </div>
      </motion.div>

      {/* Resumo Cards - GRID PROGRESSIVO: 1 → 2 → 3 → 4 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 md:mb-6">
        {/* Total Vendas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[var(--neu-accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="neu-text-caption text-[var(--neu-text-muted)] truncate">Total Vendas</p>
                  <p className="neu-text-h2 text-[var(--neu-accent)]">{resumo.total_vendas}</p>
                </div>
              </div>
            </NeuCardContent>
          </NeuCard>
        </motion.div>

        {/* Valor Total */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-[var(--neu-success)]" />
                </div>
                <div className="min-w-0">
                  <p className="neu-text-caption text-[var(--neu-text-muted)] truncate">Valor Total</p>
                  <p className="neu-text-h3 text-[var(--neu-success)] truncate">
                    {resumo.valor_total.toLocaleString('pt-MZ', {
                      style: 'currency',
                      currency: 'MZN',
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </NeuCardContent>
          </NeuCard>
        </motion.div>

        {/* Lucro Total */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[var(--neu-warning)]" />
                </div>
                <div className="min-w-0">
                  <p className="neu-text-caption text-[var(--neu-text-muted)] truncate">Lucro Total</p>
                  <p className="neu-text-h3 text-[var(--neu-warning)] truncate">
                    {resumo.lucro_total.toLocaleString('pt-MZ', {
                      style: 'currency',
                      currency: 'MZN',
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </NeuCardContent>
          </NeuCard>
        </motion.div>

        {/* Ticket Médio */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-[var(--neu-accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="neu-text-caption text-[var(--neu-text-muted)] truncate">Ticket Médio</p>
                  <p className="neu-text-h3 truncate">
                    {resumo.total_vendas > 0
                      ? (resumo.valor_total / resumo.total_vendas).toLocaleString('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN',
                          minimumFractionDigits: 0,
                        })
                      : '0 MT'}
                  </p>
                </div>
              </div>
            </NeuCardContent>
          </NeuCard>
        </motion.div>
      </div>

      {/* Lista de Vendas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <NeuCard variant="convex" size="md">
          <NeuCardContent>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[var(--neu-accent)]" />
              </div>
              <h2 className="neu-text-h2 truncate">Minhas Vendas</h2>
            </div>

            {/* Vendas List */}
            {vendas.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full neu-surface neu-concave-lg flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-[var(--neu-text-muted)]" />
                </div>
                <p className="neu-text-h3 text-[var(--neu-text-muted)] mb-2">Nenhuma venda ainda</p>
                <p className="neu-text-body text-[var(--neu-text-muted)]">
                  Suas vendas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vendas.map((venda, index) => (
                  <motion.div
                    key={venda.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <div className="p-3 md:p-4 rounded-xl neu-surface neu-convex-sm hover:neu-convex-md transition-all">
                      {/* Venda Header */}
                      <div 
                        className="flex items-start justify-between gap-3 cursor-pointer"
                        onClick={() => setExpandedSale(expandedSale === venda.id ? null : venda.id)}
                      >
                        <div className="flex-1 min-w-0">
                          {/* Data e Hora */}
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-[var(--neu-text-muted)] flex-shrink-0" />
                            <span className="neu-text-body truncate">
                              {new Date(venda.data).toLocaleString('pt-MZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Método de Pagamento */}
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-[var(--neu-text-muted)] flex-shrink-0" />
                            <span className="neu-text-body truncate">
                              {getPaymentIcon(venda.metodo_pagamento)} {venda.metodo_pagamento}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="neu-text-caption">
                            {getStatusBadge(venda.status_pagamento)}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="neu-text-h3 text-[var(--neu-success)] mb-1">
                            {venda.total.toLocaleString('pt-MZ', {
                              style: 'currency',
                              currency: 'MZN',
                              minimumFractionDigits: 0,
                            })}
                          </p>
                          <p className="neu-text-caption text-[var(--neu-text-muted)]">
                            {venda.items.length} {venda.items.length === 1 ? 'item' : 'itens'}
                          </p>
                          {venda.desconto > 0 && (
                            <p className="neu-text-caption text-[var(--neu-warning)]">
                              Desc: {venda.desconto.toLocaleString('pt-MZ', {
                                style: 'currency',
                                currency: 'MZN',
                                minimumFractionDigits: 0,
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Detalhes Expandidos */}
                      {expandedSale === venda.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-[var(--neu-border)]"
                        >
                          <h4 className="neu-text-body font-bold mb-3">Itens da Venda:</h4>
                          <div className="space-y-2">
                            {venda.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg neu-surface neu-concave-sm flex justify-between items-start gap-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="neu-text-body font-semibold truncate">{item.produto}</p>
                                  {item.barcode && (
                                    <p className="neu-text-caption text-[var(--neu-text-muted)] truncate">
                                      Código: {item.barcode}
                                    </p>
                                  )}
                                  <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                    {item.quantidade}x {item.preco_unitario.toLocaleString('pt-MZ', {
                                      style: 'currency',
                                      currency: 'MZN',
                                      minimumFractionDigits: 0,
                                    })}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="neu-text-body font-bold">
                                    {item.subtotal.toLocaleString('pt-MZ', {
                                      style: 'currency',
                                      currency: 'MZN',
                                      minimumFractionDigits: 0,
                                    })}
                                  </p>
                                  <p className="neu-text-caption text-[var(--neu-success)]">
                                    Lucro: {item.lucro.toLocaleString('pt-MZ', {
                                      style: 'currency',
                                      currency: 'MZN',
                                      minimumFractionDigits: 0,
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Resumo da Venda */}
                          <div className="mt-4 p-3 rounded-lg neu-surface neu-convex-sm space-y-1">
                            <div className="flex justify-between neu-text-caption">
                              <span>Subtotal:</span>
                              <span>{venda.subtotal.toLocaleString('pt-MZ', {
                                style: 'currency',
                                currency: 'MZN',
                                minimumFractionDigits: 0,
                              })}</span>
                            </div>
                            {venda.desconto > 0 && (
                              <div className="flex justify-between neu-text-caption text-[var(--neu-warning)]">
                                <span>Desconto:</span>
                                <span>-{venda.desconto.toLocaleString('pt-MZ', {
                                  style: 'currency',
                                  currency: 'MZN',
                                  minimumFractionDigits: 0,
                                })}</span>
                              </div>
                            )}
                            <div className="flex justify-between neu-text-body font-bold pt-2 border-t border-[var(--neu-border)]">
                              <span>Total:</span>
                              <span className="text-[var(--neu-success)]">{venda.total.toLocaleString('pt-MZ', {
                                style: 'currency',
                                currency: 'MZN',
                                minimumFractionDigits: 0,
                              })}</span>
                            </div>
                            <div className="flex justify-between neu-text-caption text-[var(--neu-success)]">
                              <span>Lucro:</span>
                              <span>{venda.lucro.toLocaleString('pt-MZ', {
                                style: 'currency',
                                currency: 'MZN',
                                minimumFractionDigits: 0,
                              })}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </NeuCardContent>
        </NeuCard>
      </motion.div>
      </div>
    </MaxWidthContainer>
  );
}
