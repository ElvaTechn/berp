"use client";

import { useState, useEffect } from 'react';
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
      if (!response.ok) throw new Error('Erro ao carregar vendas');

      const data = await response.json();
      setSales(data.sales || []);
    } catch (error) {
      toast.error('Erro ao carregar vendas');
      console.error(error);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Receipt className="w-6 h-6 text-slate-900 dark:text-slate-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white italic tracking-tight">
                Histórico de <span className="text-blue-500">Transações</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-600 dark:text-slate-400 font-medium">
                Todas as vendas realizadas
              </p>
            </div>
          </div>

          {/* Nova Venda Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/sales/pos')}
            className="h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white font-black text-lg flex items-center gap-3 shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all"
          >
            <Plus className="w-6 h-6" />
            NOVA VENDA (PDV)
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Vendas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/20 p-6 backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-600/20 px-2 py-1 rounded-full">
                  TOTAL
                </span>
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white mb-1">{sales.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-600 dark:text-slate-400 font-medium">Vendas realizadas</p>
            </div>
          </motion.div>

          {/* Vendas Hoje */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-600/20 p-6 backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-600/20">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-600/20 px-2 py-1 rounded-full">
                  HOJE
                </span>
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white mb-1">{todaySales.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-600 dark:text-slate-400 font-medium">Vendas de hoje</p>
            </div>
          </motion.div>

          {/* Receita Total */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-600/20 p-6 backdrop-blur-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-600/20 px-2 py-1 rounded-full">
                  RECEITA HOJE
                </span>
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-900 dark:text-white mb-1">
                {todayTotal.toLocaleString('pt-MZ', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-600 dark:text-slate-400 font-medium">MT hoje</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-200 dark:border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Package className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white mb-2">
              Nenhuma venda realizada
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-600 dark:text-slate-400">
              As vendas aparecerão aqui quando forem finalizadas
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-200 dark:border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Total (MT)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-wider">
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
                      className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => toggleExpand(sale.id)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-600 dark:text-slate-400">
                          {sale.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-slate-900 dark:text-slate-900 dark:text-white font-medium">
                            {formatDate(sale.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-slate-900 dark:text-slate-900 dark:text-white font-medium">
                            {sale.employee.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-slate-900 dark:text-slate-900 dark:text-white font-medium">
                            {paymentMethodLabels[sale.payment_method] ||
                              sale.payment_method}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-lg font-black text-green-400">
                            {Number(sale.total).toLocaleString('pt-MZ', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/api/sales/${sale.id}/receipt`, '_blank');
                            }}
                            className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all"
                            title="Imprimir Recibo"
                          >
                            <Receipt className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            animate={{ rotate: expandedSaleId === sale.id ? 180 : 0 }}
                            className="p-2 rounded-xl bg-white/5 text-slate-600 dark:text-slate-600 dark:text-slate-400 hover:bg-white/10 transition-all"
                          >
                            {expandedSaleId === sale.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
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
                          <td colSpan={6} className="px-6 py-4 bg-white/5">
                            <div className="space-y-2">
                              <p className="text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase mb-3">
                                Items da Venda
                              </p>
                              {sale.sale_items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-900 dark:text-slate-900 dark:text-white text-xs font-black"
                                      style={{
                                        backgroundColor: item.product.category.color,
                                      }}
                                    >
                                      {item.product.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white">
                                        {item.product.name}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-600 dark:text-slate-400">
                                        {item.quantity}x{' '}
                                        {Number(item.unit_price).toLocaleString('pt-MZ', {
                                          minimumFractionDigits: 2,
                                        })}{' '}
                                        MT
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-black text-slate-900 dark:text-slate-900 dark:text-white">
                                      {(
                                        Number(item.unit_price) * item.quantity
                                      ).toLocaleString('pt-MZ', {
                                        minimumFractionDigits: 2,
                                      })}
                                    </p>
                                    <p className="text-xs text-slate-500">MT</p>
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
      </motion.div>
    </div>
  );
}
>
    </div>
  );
}
