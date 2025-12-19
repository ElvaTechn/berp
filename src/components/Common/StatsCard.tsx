import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = 'default' 
}: StatsCardProps) {
  const variants: Record<string, string> = {
    default: 'from-slate-500 to-slate-600',
    primary: 'from-blue-500 to-blue-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
              {value}
            </h3>
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${variants[variant]} flex items-center justify-center shadow-lg`}>
            {Icon && <Icon className="h-7 w-7 text-white" />}
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${variants[variant]}`} />
    </Card>
  );
}
