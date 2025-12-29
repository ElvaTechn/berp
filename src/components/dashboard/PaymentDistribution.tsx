"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CreditCard, Wallet, Smartphone, Banknote } from "lucide-react";

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

const PAYMENT_ICONS: Record<string, any> = {
  DINHEIRO: Banknote,
  MPESA: Smartphone,
  EMOLA: Smartphone,
  CARTAO: CreditCard,
  MULTICAIXA: Wallet,
  TRANSFERENCIA: Wallet
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
      <div className="neu-surface neu-convex-sm rounded-xl p-4 border border-[var(--neu-border)] shadow-xl">
        <p className="neu-text-caption font-bold uppercase tracking-wider text-[var(--neu-text-muted)] mb-3">
          {data.name}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">Valor Total</span>
            <span className="neu-text-body font-bold text-[var(--neu-text-primary)]">
              {data.amount_formatted}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">Transações</span>
            <span className="neu-text-body font-bold text-[var(--neu-text-primary)]">
              {data.count}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 pt-2 border-t border-[var(--neu-border)]">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">Percentual</span>
            <span className="neu-text-body font-bold text-[var(--neu-success)]">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {distribution.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[var(--neu-text-muted)]" />
          </div>
          <p className="neu-text-body text-[var(--neu-text-muted)]">
            Nenhuma venda registrada ainda
          </p>
        </div>
      ) : (
        <>
          {/* Pie Chart */}
          <div className="h-[240px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={200}
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
          <div className="space-y-2">
            {chartData.map((item, index) => {
              const method = distribution[index].method;
              const color = COLORS[method as keyof typeof COLORS] || "#64748b";
              const Icon = PAYMENT_ICONS[method as keyof typeof PAYMENT_ICONS] || CreditCard;
              
              return (
                <motion.div
                  key={method}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="neu-surface neu-concave-xs rounded-xl p-3 hover:neu-concave-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl neu-surface neu-convex-sm flex items-center justify-center"
                        style={{ color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="neu-text-body font-medium text-[var(--neu-text-primary)] group-hover:text-[var(--neu-accent)] transition-colors">
                        {item.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="neu-text-caption text-[var(--neu-text-muted)]">
                        {item.count} vendas
                      </span>
                      <span className="neu-text-body font-bold text-[var(--neu-accent)] min-w-[60px] text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
