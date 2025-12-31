"use client";
import { motion } from 'framer-motion';
import type { UltimaVenda } from '@/types/vendedor';

interface Props { vendas: UltimaVenda[]; }

export function UltimasVendas({ vendas }: Props) {
  const getStatusIcon = (status: UltimaVenda['status']) => {
    if (status === 'synced') return '✅';
    if (status === 'syncing') return '⏳';
    if (status === 'pending') return '📴';
    return '⚠️';
  };

  const getStatusColor = (status: UltimaVenda['status']) => {
    if (status === 'synced') return 'text-green-600 dark:text-green-400';
    if (status === 'syncing') return 'text-blue-600 dark:text-blue-400';
    if (status === 'pending') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📈</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Últimas Vendas</h3>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {vendas.slice(0, 8).map((venda, i) => (
          <motion.div key={venda.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{venda.cliente_nome}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {venda.items_count} {venda.items_count === 1 ? 'item' : 'itens'} • 
                  {new Date(venda.data).toLocaleString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">
                  {venda.valor.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                </p>
                <p className={`text-xs ${getStatusColor(venda.status)}`}>
                  {getStatusIcon(venda.status)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
