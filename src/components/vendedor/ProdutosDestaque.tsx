"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ProdutoDestaque } from '@/types/vendedor';

interface Props { produtos: ProdutoDestaque[]; }

export function ProdutosDestaque({ produtos }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Produtos em Destaque</h3>
        </div>
        <Link href="/products" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Ver todos
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {produtos.slice(0, 4).map((produto, i) => (
          <motion.div key={produto.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors cursor-pointer">
            <p className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">{produto.nome}</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
              {produto.preco.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${produto.estoque_baixo ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                {produto.estoque_disponivel} em estoque
              </span>
              {produto.estoque_baixo && <span className="text-xs">⚠️</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
