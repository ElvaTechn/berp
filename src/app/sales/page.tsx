"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Calendar,
  User,
  CreditCard,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';

interface SaleItem {
  id: string;
  quantity: number;
  unit_price: number;
  product: {
    name: string;
    category: {
      name: string;
      color: string;
    };
  };
}

interface Sale {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
  employee: {
    full_name: string;
  };
  sale_items: SaleItem[];
}

const paymentMethodLabels: Record<string, string> = {
  DINHEIRO: 'Dinheiro',
  MPESA: 'M-Pesa',
  EMOLA: 'e-Mola',
  CARTAO: 'Cartão',
  MULTICAIXA: 'Multicaixa',
  TRANSFERENCIA: 'Transferência',
};

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sales');
      
      if (!response.ok) {
        // Erro real (401, 403, 500, etc.)
        const errorData = await response.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));
        throw new Error(errorData.error || `Erro ${response.status}: Falha ao carregar vendas`);
      }

      const data = await response.json();
      const salesList = data.sales || [];
      setSales(salesList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar vendas';
      toast.error(errorMessage);
      console.error(error);
      // Em caso de erro, limpar a lista
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotalSales = () => {
    return sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  };

  const getTodaySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sales.filter((sale) => {
      const saleDate = new Date(sale.created_at);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
  };

  const todaySales = getTodaySales();
  const todayTotal = todaySales.reduce((sum, sale) => sum + Number(sale.total), 0);

  return (
    <div className="min-h-screen bg-[var(--neu-base)] p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="neu-text-h1">
              Histórico de Vendas
            </h1>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
              Todas as transações realizadas
            </p>
          </div>

          {/* Nova Venda Button */}
          <NeuButton
            onClick={() => router.push('/sales/pos')}
            variant="accent"
            size="lg"
          >
            <Plus className="w-6 h-6" />
            NOVA VENDA (PDV)
          </NeuButton>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Total Vendas */}
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-[var(--neu-accent)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Total Vendas
                </p>
              </div>
              <p className="neu-text-h2">{sales.length}</p>
              <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                Vendas realizadas
              </p>
            </NeuCardContent>
          </NeuCard>

          {/* Vendas Hoje */}
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[var(--neu-success)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Vendas Hoje
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-success)]">{todaySales.length}</p>
              <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                Vendas de hoje
              </p>
            </NeuCardContent>
          </NeuCard>

          {/* Receita Hoje */}
          <NeuCard variant="convex" size="sm">
            <NeuCardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[var(--neu-success)]" />
                </div>
                <p className="neu-text-label text-[var(--neu-text-muted)]">
                  Receita Hoje
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-success)]">
                {todayTotal.toLocaleString('pt-MZ', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                MT hoje
              </p>
            </NeuCardContent>
          </NeuCard>
        </motion.div>

        {/* Sales Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NeuCard variant="concave" size="md">
            <NeuCardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin" />
                </div>
              ) : sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 p-8">
                  <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mb-6">
                    <Receipt className="w-10 h-10 text-[var(--neu-accent)]" />
                  </div>
                  <h3 className="neu-text-h2 mb-3">
                    Nenhuma venda realizada
                  </h3>
                  <p className="neu-text-body text-[var(--neu-text-muted)] text-center max-w-md">
                    As vendas aparecerão aqui quando forem finalizadas no PDV
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--neu-base)]">
                      <tr className="border-b border-[var(--neu-border)]">
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Data/Hora
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Vendedor
                        </th>
                        <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                          Pagamento
                        </th>
                        <th className="px-6 py-4 text-right neu-text-label text-[var(--neu-text-muted)]">
                          Total (MT)
                        </th>
                        <th className="px-6 py-4 text-center neu-text-label text-[var(--neu-text-muted)]">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale, index) => (
                        <React.Fragment key={sale.id}>
                          <motion.tr
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)] transition-all cursor-pointer"
                            onClick={() => toggleExpand(sale.id)}
                          >
                            <td className="px-6 py-4">
                              <span className="neu-text-caption font-mono text-[var(--neu-text-muted)]">
                                {sale.id.slice(0, 8)}...
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[var(--neu-accent)]" />
                                <span className="neu-text-body">
                                  {formatDate(sale.created_at)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[var(--neu-success)]" />
                                <span className="neu-text-body">
                                  {sale.employee.full_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[var(--neu-accent)]" />
                                <span className="neu-text-body">
                                  {paymentMethodLabels[sale.payment_method] ||
                                    sale.payment_method}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <DollarSign className="w-4 h-4 text-[var(--neu-success)]" />
                                <span className="neu-text-h3 text-[var(--neu-success)]">
                                  {Number(sale.total).toLocaleString('pt-MZ', {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <NeuButton
                                  variant="convex"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/api/sales/${sale.id}/receipt`, '_blank');
                                  }}
                                  title="Imprimir Recibo"
                                >
                                  <Receipt className="w-4 h-4" />
                                </NeuButton>
                                <motion.button
                                  animate={{ rotate: expandedSaleId === sale.id ? 180 : 0 }}
                                  className="p-2 rounded-xl neu-surface neu-convex-xs hover:neu-convex-sm transition-all"
                                >
                                  {expandedSaleId === sale.id ? (
                                    <ChevronUp className="w-4 h-4 text-[var(--neu-text-primary)]" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-[var(--neu-text-primary)]" />
                                  )}
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>

                          {/* Expanded Sale Items */}
                          <AnimatePresence>
                            {expandedSaleId === sale.id && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <td colSpan={6} className="px-6 py-4 bg-[var(--neu-base)]">
                                  <div className="space-y-2">
                                    <p className="neu-text-label text-[var(--neu-text-muted)] mb-3">
                                      Items da Venda
                                    </p>
                                    {sale.sale_items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 rounded-xl neu-surface neu-concave-sm border border-[var(--neu-border)]"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            className="w-8 h-8 rounded-lg neu-convex-xs flex items-center justify-center text-white text-xs font-black"
                                            style={{
                                              backgroundColor: item.product.category.color,
                                            }}
                                          >
                                            {item.product.name.charAt(0)}
                                          </div>
                                          <div>
                                            <p className="neu-text-body font-semibold">
                                              {item.product.name}
                                            </p>
                                            <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                              {item.quantity}x{' '}
                                              {Number(item.unit_price).toLocaleString('pt-MZ', {
                                                minimumFractionDigits: 2,
                                              })}{' '}
                                              MT
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="neu-text-h3">
                                            {(
                                              Number(item.unit_price) * item.quantity
                                            ).toLocaleString('pt-MZ', {
                                              minimumFractionDigits: 2,
                                            })}
                                          </p>
                                          <p className="neu-text-caption text-[var(--neu-text-muted)]">MT</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </NeuCardContent>
          </NeuCard>
        </motion.div>
      </div>
    </div>
  );
}
