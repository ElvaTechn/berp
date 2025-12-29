"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU KPI CARD - Neumorphic KPI Card for Dashboard
   
   Features:
   - Convex shadow (pops out of surface)
   - Animated entry
   - Trend indicator with growth percentage
   - Icon with accent color
   - Responsive sizing
   
   Usage:
   <NeuKPICard
     title="Faturação Hoje"
     value="125.000 MT"
     subtitle="vs. ontem"
     trend={{ value: 12.5, isPositive: true }}
     icon={DollarSign}
     color="accent"
     index={0}
   />
   ================================================================= */

interface NeuKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  index?: number;
  color?: 'default' | 'accent' | 'success' | 'warning';
}

export function NeuKPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  index = 0,
  color = 'default' 
}: NeuKPICardProps) {
  const colorClasses = {
    default: 'text-[var(--neu-text-primary)]',
    accent: 'text-[var(--neu-accent)]',
    success: 'text-[var(--neu-success)]',
    warning: 'text-[var(--neu-warning)]',
  };
  
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
        y: -2,
        transition: { duration: 0.2 }
      }}
      className="neu-surface neu-convex-md hover:neu-convex-lg rounded-2xl p-5 lg:p-6 transition-all duration-200 cursor-default"
      style={{
        width: '100%',
        minWidth: '220px',
        flex: '1 1 0%'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Side - Text Content */}
        <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>
          <span className="neu-text-label font-semibold uppercase tracking-wide text-[var(--neu-text-muted)] mb-2">
            {title}
          </span>
          <span 
            className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--neu-text-primary)] mb-1"
            style={{ 
              whiteSpace: 'nowrap',
              overflow: 'visible',
              width: '100%'
            }}
          >
            {value}
          </span>
          {subtitle && (
            <span className="neu-text-caption text-[var(--neu-text-muted)]" style={{ whiteSpace: 'nowrap' }}>
              {subtitle}
            </span>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-[var(--neu-success)]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--neu-error)]" />
              )}
              <span className={cn(
                'neu-text-caption font-semibold',
                trend.isPositive ? 'text-[var(--neu-success)]' : 'text-[var(--neu-error)]'
              )}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Right Side - Icon */}
        <div className={cn(
          'p-3 rounded-xl',
          'neu-surface',
          'neu-convex-sm',
          'flex-shrink-0'
        )}>
          <Icon className={cn('w-6 h-6', colorClasses[color])} />
        </div>
      </div>
    </motion.div>
  );
}
