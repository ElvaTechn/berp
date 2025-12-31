"use client";
import { motion } from 'framer-motion';
import type { VendedorMetrics } from '@/types/vendedor';

interface Props { metrics: VendedorMetrics; }

export function DesempenhoHoje({ metrics }: Props) {
  const stats = [
    { label: 'Vendas Hoje', value: metrics.vendas_hoje, icon: '💰', color: 'text-green-600 dark:text-green-400' },
    { label: 'Valor Hoje', value: metrics.valor_hoje.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }), icon: '💵', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Clientes', value: metrics.clientes_atendidos_hoje, icon: '👥', color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Ticket Médio', value: metrics.ticket_medio_hoje.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }), icon: '🎫', color: 'text-orange-600 dark:text-orange-400' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Desempenho Hoje</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
