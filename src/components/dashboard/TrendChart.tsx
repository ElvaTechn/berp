"use client";

import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface TrendData {
  date: string;
  revenue: number;
  profit: number;
  sales_count: number;
}

interface TrendChartProps {
  data: TrendData[];
}

export function TrendChart({ data }: TrendChartProps) {
  // Formatar data para display
  const formattedData = data.map(item => ({
    ...item,
    dateFormatted: new Date(item.date).toLocaleDateString('pt-MZ', { 
      day: '2-digit', 
      month: 'short' 
    })
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
          {new Date(data.date).toLocaleDateString('pt-MZ', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long' 
          })}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Faturação</span>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {data.revenue.toLocaleString('pt-MZ')} MT
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Lucro</span>
            </div>
            <span className="text-sm font-black text-emerald-400">
              {data.profit.toLocaleString('pt-MZ')} MT
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 pt-2 border-t border-slate-300 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Vendas</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {data.sales_count}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
      className="
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-white/80 to-white/20 dark:from-slate-900/50 dark:to-slate-900/20
        border border-slate-300 dark:border-slate-800
        backdrop-blur-xl
        p-6
      "
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-1">
          Tendência de Performance
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Últimos 7 dias • Faturação vs Lucro
        </p>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Gradient para Revenue */}
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              
              {/* Gradient para Profit */}
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#cbd5e1" 
              className="dark:stroke-[#1e293b]"
              vertical={false}
            />

            <XAxis
              dataKey="dateFormatted"
              stroke="#64748b"
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'system-ui'
              }}
              tick={{ fill: '#64748b' }}
            />

            <YAxis
              stroke="#64748b"
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'system-ui'
              }}
              tick={{ fill: '#64748b' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
              iconType="circle"
            />

            {/* Area para Revenue */}
            <Area
              type="monotone"
              dataKey="revenue"
              name="Faturação"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              animationDuration={1000}
            />

            {/* Area para Profit */}
            <Area
              type="monotone"
              dataKey="profit"
              name="Lucro"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorProfit)"
              animationDuration={1000}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Background Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.2),transparent_50%)]" />
      </div>
    </motion.div>
  );
}
