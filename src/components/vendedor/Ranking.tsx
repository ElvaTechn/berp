/**
 * ================================================================
 * RANKING - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Ranking de vendedores - Design neumorphic
 * ================================================================
 */

"use client";

import { motion } from 'framer-motion';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { Trophy, Medal, Award } from 'lucide-react';
import type { RankingVendedor } from '@/types/vendedor';

interface Props {
  ranking: RankingVendedor[];
}

export function Ranking({ ranking }: Props) {
  const getMedalIcon = (pos: number) => {
    if (pos === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (pos === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (pos === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return <span className="neu-text-body font-bold">{pos}º</span>;
  };

  const getMedalEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <NeuCard variant="convex">
        <NeuCardContent>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[var(--neu-accent)]" />
            </div>
            <h3 className="neu-text-h3">Ranking de Vendedores</h3>
          </div>

          {/* Ranking List */}
          <div className="space-y-3">
            {ranking.slice(0, 5).map((vendedor, i) => (
              <motion.div
                key={vendedor.vendedor_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div
                  className={`p-4 rounded-xl ${
                    vendedor.eh_voce
                      ? 'neu-surface neu-concave-md border-2 border-[var(--neu-accent)]'
                      : 'neu-surface neu-convex-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Medal + Name */}
                    <div className="flex items-center gap-3">
                      {/* Medal Icon */}
                      <div className="w-10 h-10 rounded-xl neu-surface neu-concave-sm flex items-center justify-center">
                        {getMedalIcon(vendedor.posicao)}
                      </div>
                      
                      {/* Name + Value */}
                      <div>
                        <p
                          className={`neu-text-body font-bold ${
                            vendedor.eh_voce
                              ? 'text-[var(--neu-accent)]'
                              : ''
                          }`}
                        >
                          {vendedor.vendedor_nome}
                          {vendedor.eh_voce && (
                            <span className="ml-2 neu-text-caption text-[var(--neu-accent)]">
                              (Você)
                            </span>
                          )}
                          {getMedalEmoji(vendedor.posicao) && (
                            <span className="ml-2">{getMedalEmoji(vendedor.posicao)}</span>
                          )}
                        </p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)]">
                          {vendedor.valor_total.toLocaleString('pt-MZ', {
                            style: 'currency',
                            currency: 'MZN',
                            minimumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Vendas Count */}
                    <div className="text-right">
                      <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
                        <span className="neu-text-h4 text-[var(--neu-accent)]">
                          {vendedor.vendas}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  );
}
