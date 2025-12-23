"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardMinimalProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon: LucideIcon;
  index: number;
  color: "blue" | "green" | "orange" | "purple";
}

const badgeMinimalClasses = {
  positive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 
  negative: 'bg-red-500/20 text-red-400 border-red-500/30',
  neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const colorClasses = {
  blue: "sunset-accent bg-sunset-bg/10",
  green: "sunset-accent bg-emerald-500/20",
  orange: "sunset-accent bg-sunset-bg/10",
  purple: "sunset-accent bg-sunset-bg/10"
};

const iconColorClasses = {
  blue: "sunset-accent bg-sunset-bg/10",
  green: "sunset-accent bg-emerald-500/20",
  orange: "sunset-accent bg-sunset-bg/10",
  purple: "sunset-accent bg-sunset-bg/10"
};

export function KPICardMinimal({ 
  title, 
  value, 
  subtitle, 
  growth, 
  icon: Icon, 
  index,
  color 
}: KPICardMinimalProps) {
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
        relative overflow-hidden rounded-md
        bg-gradient-to-br ${colorClasses[color]}
        border backdrop-blur-xl
        p-6
        group cursor-default
        element-spacing-small
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-label mb-1">{title}</p>
          {subtitle && (
            <p className="text-caption">{subtitle}</p>
          )}
        </div>
        
        <div className={`p-3 rounded-md ${iconColorClasses[color]} transition-all`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <h2 className="kpi-value text-black dark:text-white tracking-tighter">
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
            inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium badge-minimal
            ${isPositive ? badgeMinimalClasses.positive : badgeMinimalClasses.negative}
          `}>
          <span className="text-sm">
            {isPositive ? '↑' : '↓'}
          </span>
          <span>
            {Math.abs(growth).toFixed(1)}%
          </span>
          <span className="text-caption opacity-70">vs ontem</span>
        </motion.div>
      )}

      {!hasGrowth && growth === 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium badge-minimal">
          <span>→</span>
          <span>Sem mudança</span>
        </div>
      )}
    </motion.div>
  );
}
