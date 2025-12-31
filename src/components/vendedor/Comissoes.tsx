"use client";
import { motion } from 'framer-motion';
import type { VendedorMetrics } from '@/types/vendedor';

interface Props { metrics: VendedorMetrics; }

export function Comissoes({ metrics }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💼</span>
        <h3 className="text-lg font-bold">Comissões</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm opacity-90">Acumulado Este Mês</p>
          <p className="text-3xl font-bold">{metrics.comissao_acumulada.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-75">Projeção</p>
            <p className="text-lg font-semibold">{metrics.comissao_projetada.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">Última Paga</p>
            <p className="text-lg font-semibold">{metrics.ultima_comissao_paga.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
