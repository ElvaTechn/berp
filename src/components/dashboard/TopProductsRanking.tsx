"use client";

import { motion } from "framer-motion";
import { TrendingUp, Package } from "lucide-react";

interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  revenue_formatted: string;
  profit: number;
  profit_margin: number;
}

interface TopProductsRankingProps {
  products: TopProduct[];
}

const rankColors = [
  "from-yellow-500 to-orange-500", // 1º
  "from-slate-400 to-slate-500",    // 2º
  "from-orange-600 to-orange-700",  // 3º
  "from-blue-500 to-blue-600",      // 4º
  "from-purple-500 to-purple-600"   // 5º
];

const rankBg = [
  "bg-yellow-500/10 border-yellow-500/30",
  "bg-slate-500/10 border-slate-500/30",
  "bg-orange-500/10 border-orange-500/30",
  "bg-blue-500/10 border-blue-500/30",
  "bg-purple-500/10 border-purple-500/30"
];

export function TopProductsRanking({ products }: TopProductsRankingProps) {
  // Encontrar o maior valor para calcular percentuais
  const maxRevenue = Math.max(...products.map(p => p.revenue));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
      className="
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-slate-900/50 to-slate-900/20
        border border-slate-300 dark:border-slate-800
        backdrop-blur-xl
        p-6
        h-full
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-1">
            Top Produtos
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Ranking por valor gerado
          </p>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">
              Nenhuma venda registrada ainda
            </p>
          </div>
        ) : (
          products.map((product, index) => {
            const percentage = (product.revenue / maxRevenue) * 100;
            
            return (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.6 + (index * 0.1),
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group"
              >
                {/* Rank Badge + Product Info */}
                <div className="flex items-start gap-3 mb-2">
                  {/* Rank */}
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-lg 
                    ${rankBg[index]} 
                    flex items-center justify-center
                    border
                  `}>
                    <span className={`
                      text-sm font-black
                      bg-gradient-to-br ${rankColors[index]}
                      bg-clip-text text-transparent
                    `}>
                      {index + 1}º
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-400 transition-colors">
                        {product.product_name}
                      </h4>
                      <span className="text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {product.revenue_formatted}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span className="font-medium">
                        {product.quantity_sold} unidades
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className={`
                        font-bold
                        ${product.profit_margin >= 30 ? 'text-emerald-400' : 
                          product.profit_margin >= 20 ? 'text-yellow-400' : 
                          'text-orange-400'}
                      `}>
                        {product.profit_margin.toFixed(1)}% margem
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ 
                          delay: 0.6 + (index * 0.1) + 0.2,
                          duration: 0.8,
                          ease: "easeOut"
                        }}
                        className={`
                          absolute inset-y-0 left-0
                          bg-gradient-to-r ${rankColors[index]}
                          rounded-full
                        `}
                      />
                      
                      {/* Shine Effect */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          delay: 0.6 + (index * 0.1) + 0.5,
                          duration: 1,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Background Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),transparent_50%)]" />
      </div>
    </motion.div>
  );
}
