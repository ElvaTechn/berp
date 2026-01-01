/**
 * ================================================================
 * PRODUTOS DESTAQUE - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Grid de produtos em destaque - Design neumorphic
 * ================================================================
 */

"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuButton } from '@/components/ui/neu-button';
import { Gift, Package, AlertTriangle, ExternalLink } from 'lucide-react';
import type { ProdutoDestaque } from '@/types/vendedor';

interface Props {
  produtos: ProdutoDestaque[];
}

export function ProdutosDestaque({ produtos }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <NeuCard variant="convex">
        <NeuCardContent>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
                <Gift className="w-6 h-6 text-[var(--neu-accent)]" />
              </div>
              <h3 className="neu-text-h3">Produtos em Destaque</h3>
            </div>
            
            <Link href="/products">
              <NeuButton variant="ghost" size="sm" className="flex items-center gap-2">
                Ver todos
                <ExternalLink className="w-4 h-4" />
              </NeuButton>
            </Link>
          </div>

          {/* Produtos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {produtos.slice(0, 4).map((produto, i) => (
              <motion.div
                key={produto.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-4 rounded-xl neu-surface neu-convex-sm hover:neu-convex-md transition-all cursor-pointer group">
                  {/* Icon */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg neu-surface neu-concave-sm flex items-center justify-center">
                      <Package className="w-5 h-5 text-[var(--neu-accent)]" />
                    </div>
                    {produto.estoque_baixo && (
                      <div className="w-8 h-8 rounded-lg neu-surface neu-concave-sm flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-[var(--neu-warning)] animate-pulse" />
                      </div>
                    )}
                  </div>

                  {/* Nome */}
                  <p className="neu-text-body font-semibold mb-2 line-clamp-2 group-hover:text-[var(--neu-accent)] transition-colors">
                    {produto.nome}
                  </p>

                  {/* Preço */}
                  <p className="neu-text-h4 text-[var(--neu-success)] mb-3">
                    {produto.preco.toLocaleString('pt-MZ', {
                      style: 'currency',
                      currency: 'MZN',
                      minimumFractionDigits: 0,
                    })}
                  </p>

                  {/* Estoque Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`px-3 py-1 rounded-lg neu-surface neu-concave-sm ${
                        produto.estoque_baixo
                          ? 'text-[var(--neu-error)]'
                          : 'text-[var(--neu-success)]'
                      }`}
                    >
                      <p className="neu-text-caption font-semibold">
                        {produto.estoque_disponivel} em estoque
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {produtos.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-surface neu-concave-md flex items-center justify-center">
                <Package className="w-8 h-8 text-[var(--neu-text-muted)]" />
              </div>
              <p className="neu-text-body text-[var(--neu-text-muted)]">
                Nenhum produto em destaque
              </p>
            </div>
          )}
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  );
}
