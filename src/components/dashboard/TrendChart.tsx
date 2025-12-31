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
  isMobile?: boolean;
}

export function TrendChart({ data, isMobile = false }: TrendChartProps) {
  // Valores adaptativos baseados no viewport
  const fontSize = isMobile ? 10 : 12;
  const strokeWidth = isMobile ? 2 : 3;
  const dotSize = isMobile ? 3 : 4;
  const chartHeight = isMobile ? 250 : 350;

  // Formatar data para display
  const formattedData = data.map(item => ({
    ...item,
    dateFormatted: new Date(item.date).toLocaleDateString('pt-MZ',
      isMobile ? { day: '2-digit', month: 'short' }
        : { day: '2-digit', month: 'short' }
    )
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="neu-surface neu-convex-sm rounded-xl p-4 border border-[var(--neu-border)] shadow-xl">
        <p className="neu-text-caption font-bold uppercase tracking-wider text-[var(--neu-text-muted)] mb-3">
          {new Date(data.date).toLocaleDateString('pt-MZ', { 
            weekday: 'long',
            day: 'numeric',
            month: 'long' 
          })}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--neu-accent)]" />
              <span className="neu-text-caption text-[var(--neu-text-muted)]">Faturação</span>
            </div>
            <span className="neu-text-body font-bold text-[var(--neu-text-primary)]">
              {data.revenue.toLocaleString('pt-MZ')} MT
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--neu-success)]" />
              <span className="neu-text-caption text-[var(--neu-text-muted)]">Lucro</span>
            </div>
            <span className="neu-text-body font-bold text-[var(--neu-success)]">
              {data.profit.toLocaleString('pt-MZ')} MT
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 pt-2 border-t border-[var(--neu-border)]">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">Vendas</span>
            <span className="neu-text-body font-bold text-[var(--neu-text-primary)]">
              {data.sales_count}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Chart - Altura adaptativa */}
      <div style={{ height: chartHeight }}>
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
                fontSize: `${fontSize}px`,
                fontWeight: 'bold',
                fontFamily: 'system-ui'
              }}
              tick={{ fill: '#64748b' }}
              tickMargin={isMobile ? 8 : undefined}
              height={isMobile ? 20 : undefined}
            />

            <YAxis
              stroke="#64748b"
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: 'bold',
                fontFamily: 'system-ui'
              }}
              tick={{ fill: '#64748b' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tickMargin={isMobile ? 8 : undefined}
              width={isMobile ? 40 : undefined}
            />

            <Tooltip content={<CustomTooltip />} />

            {isMobile && <Legend
              wrapperStyle={{
                paddingTop: '10px',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              iconType="circle"
            />}

            {/* Area para Revenue */}
            <Area
              type="monotone"
              dataKey="revenue"
              name="Faturação"
              stroke="#3b82f6"
              strokeWidth={strokeWidth}
              fill="url(#colorRevenue)"
              animationDuration={1000}
            />

            {/* Area para Profit */}
            <Area
              type="monotone"
              dataKey="profit"
              name="Lucro"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              fill="url(#colorProfit)"
              animationDuration={1000}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
