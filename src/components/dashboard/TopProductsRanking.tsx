"use client";

import { motion } from "framer-motion";
import { TrendingUp, Package, Trophy } from "lucide-react";

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
  "text-yellow-500", // 1º - Ouro
  "text-slate-400",  // 2º - Prata
  "text-orange-600", // 3º - Bronze
  "text-blue-500",   // 4º
  "text-purple-500"  // 5º
];

export function TopProductsRanking({ products }: TopProductsRankingProps) {
  // Encontrar o maior valor para calcular percentuais
  const maxRevenue = Math.max(...products.map(p => p.revenue), 1);

  return (
    <div className="space-y-4">{products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[var(--neu-text-muted)]" />
          </div>
          <p className="neu-text-body text-[var(--neu-text-muted)]">
            Nenhuma venda registrada ainda
          </p>
        </div>
      ) : (

        products.map((product, index) => {
          const percentage = (product.revenue / maxRevenue) * 100;
          
          return (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
              className="neu-surface neu-concave-sm rounded-xl p-4 hover:neu-concave-md transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                  {index < 3 ? (
                    <Trophy className={`w-5 h-5 ${rankColors[index]}`} />
                  ) : (
                    <span className="neu-text-body font-bold text-[var(--neu-accent)]">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="neu-text-body font-bold text-[var(--neu-text-primary)] truncate group-hover:text-[var(--neu-accent)] transition-colors">
                      {product.product_name}
                    </h4>
                    <span className="neu-text-body font-bold text-[var(--neu-success)] whitespace-nowrap">
                      {product.revenue_formatted}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 neu-text-caption text-[var(--neu-text-muted)] mb-3">
                    <span className="font-medium">
                      {product.quantity_sold} unid.
                    </span>
                    <span>•</span>
                    <span className={`font-bold ${
                      product.profit_margin >= 30 ? 'text-[var(--neu-success)]' : 
                      product.profit_margin >= 20 ? 'text-[var(--neu-warning)]' : 
                      'text-[var(--neu-error)]'
                    }`}>
                      {product.profit_margin.toFixed(1)}% margem
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-2 neu-surface neu-concave-xs rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ 
                        delay: index * 0.05 + 0.2,
                        duration: 0.8,
                        ease: "easeOut"
                      }}
                      className="absolute inset-y-0 left-0 bg-[var(--neu-accent)] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
