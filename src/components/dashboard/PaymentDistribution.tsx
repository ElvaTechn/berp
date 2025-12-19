"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CreditCard } from "lucide-react";

interface PaymentDistribution {
  method: string;
  amount: number;
  amount_formatted: string;
  count: number;
  percentage: number;
}

interface PaymentDistributionProps {
  distribution: PaymentDistribution[];
}

const COLORS = {
  DINHEIRO: "#10b981",    // Emerald
  MPESA: "#3b82f6",       // Blue
  EMOLA: "#8b5cf6",       // Purple
  CARTAO: "#f59e0b",      // Amber
  MULTICAIXA: "#ec4899",  // Pink
  TRANSFERENCIA: "#06b6d4" // Cyan
};

const PAYMENT_LABELS: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  MPESA: "M-Pesa",
  EMOLA: "E-Mola",
  CARTAO: "Cartão",
  MULTICAIXA: "Multicaixa",
  TRANSFERENCIA: "Transferência"
};

export function PaymentDistribution({ distribution }: PaymentDistributionProps) {
  // Preparar dados para o gráfico
  const chartData = distribution.map(item => ({
    name: PAYMENT_LABELS[item.method] || item.method,
    value: item.amount,
    percentage: item.percentage,
    count: item.count,
    amount_formatted: item.amount_formatted
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-300 dark:border-slate-700 rounded-xl p-4 shadow-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">
          {data.name}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Valor Total</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {data.amount_formatted}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Transações</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {data.count}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 pt-2 border-t border-slate-300 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Percentual</span>
            <span className="text-sm font-black text-emerald-400">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
      className="
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-slate-900/50 to-slate-900/20
        border border-slate-300 dark:border-slate-800
        backdrop-blur-xl
        p-6
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-1">
            Métodos de Pagamento
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Distribuição por volume
          </p>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <CreditCard className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {distribution.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            Nenhuma venda registrada ainda
          </p>
        </div>
      ) : (
        <>
          {/* Pie Chart */}
          <div className="h-[280px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={700}
                >
                  {chartData.map((entry, index) => {
                    const method = distribution[index].method;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[method as keyof typeof COLORS] || "#64748b"}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend List */}
          <div className="space-y-3">
            {chartData.map((item, index) => {
              const method = distribution[index].method;
              const color = COLORS[method as keyof typeof COLORS] || "#64748b";
              
              return (
                <motion.div
                  key={method}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                  className="flex items-center justify-between group cursor-default hover:bg-slate-100 dark:bg-slate-800/30 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">
                      {item.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {item.count} vendas
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white min-w-[60px] text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Background Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.2),transparent_50%)]" />
      </div>
    </motion.div>
  );
}
