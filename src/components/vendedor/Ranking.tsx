"use client";
import { motion } from 'framer-motion';
import type { RankingVendedor } from '@/types/vendedor';

interface Props { ranking: RankingVendedor[]; }

export function Ranking({ ranking }: Props) {
  const getMedal = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `${pos}º`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏆</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ranking</h3>
      </div>
      <div className="space-y-2">
        {ranking.slice(0, 5).map((vendedor, i) => (
          <motion.div key={vendedor.vendedor_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-xl border ${vendedor.eh_voce ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30' : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/5'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">{getMedal(vendedor.posicao)}</span>
                <div>
                  <p className={`font-semibold ${vendedor.eh_voce ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {vendedor.vendedor_nome} {vendedor.eh_voce && '(Você)'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {vendedor.valor_total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{vendedor.vendas}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
