"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon: LucideIcon;
  index: number;
  color: "blue" | "green" | "orange" | "purple";
}

const colorClasses = {
  blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
  green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
  orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
  purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400"
};

const iconColorClasses = {
  blue: "text-blue-400 bg-blue-500/10",
  green: "text-emerald-400 bg-emerald-500/10",
  orange: "text-orange-400 bg-orange-500/10",
  purple: "text-purple-400 bg-purple-500/10"
};

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  growth, 
  icon: Icon, 
  index,
  color 
}: KPICardProps) {
  const isPositive = growth !== undefined && growth > 0;
  const hasGrowth = growth !== undefined && growth !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${colorClasses[color]}
        border backdrop-blur-xl
        p-6
        group cursor-default
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={`p-3 rounded-xl ${iconColorClasses[color]} transition-all group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">
            {value}
          </h2>
        </div>

        {/* Growth Indicator */}
        {hasGrowth && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
              ${isPositive 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }
            `}
          >
            <span className="text-sm">
              {isPositive ? '↑' : '↓'}
            </span>
            <span>
              {Math.abs(growth).toFixed(1)}%
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-normal">vs ontem</span>
          </motion.div>
        )}

        {!hasGrowth && growth === 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">
            <span>→</span>
            <span>Sem mudança</span>
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
