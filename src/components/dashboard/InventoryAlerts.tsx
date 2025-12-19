"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

interface InventoryAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  status: "critical" | "warning" | "low";
}

interface InventoryAlertsProps {
  alerts: InventoryAlert[];
}

const statusConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Crítico",
    pulse: true
  },
  warning: {
    icon: TrendingDown,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    label: "Atenção",
    pulse: false
  },
  low: {
    icon: Package,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "Baixo",
    pulse: false
  }
};

export function InventoryAlerts({ alerts }: InventoryAlertsProps) {
  // Ordenar por status (critical primeiro)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const order = { critical: 0, warning: 1, low: 2 };
    return order[a.status] - order[b.status];
  });

  // Contar por status
  const criticalCount = alerts.filter(a => a.status === "critical").length;
  const warningCount = alerts.filter(a => a.status === "warning").length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
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
            Alertas de Stock
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {alerts.length} produto{alerts.length !== 1 ? 's' : ''} com stock baixo
          </p>
        </div>
        
        {/* Status Badge */}
        {criticalCount > 0 && (
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </motion.div>
        )}
      </div>

      {/* Summary */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          {criticalCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400">
                {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {warningCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-bold text-orange-400">
                {warningCount} Atenção
              </span>
            </div>
          )}
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <p className="text-sm text-emerald-400 font-medium">
              ✓ Todos os produtos com stock adequado
            </p>
          </div>
        ) : (
          sortedAlerts.map((alert, index) => {
            const config = statusConfig[alert.status];
            const Icon = config.icon;
            const percentage = (alert.current_stock / alert.min_stock) * 100;
            
            return (
              <motion.div
                key={alert.product_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.8 + (index * 0.05),
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.02 }}
                className={`
                  relative p-4 rounded-xl
                  ${config.bg} border ${config.border}
                  transition-all group cursor-default
                `}
              >
                {/* Pulse Effect for Critical */}
                {config.pulse && (
                  <motion.div
                    animate={{ opacity: [0.5, 0, 0.5] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-red-500/5 rounded-xl"
                  />
                )}

                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-400 transition-colors">
                        {alert.product_name}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${config.bg} ${config.color} whitespace-nowrap`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-3">
                      <span className="font-medium">
                        Stock: <span className={`font-bold ${config.color}`}>{alert.current_stock}</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="font-medium">
                        Mínimo: {alert.min_stock}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ 
                          delay: 0.8 + (index * 0.05) + 0.2,
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          alert.status === "critical" ? "bg-red-500" :
                          alert.status === "warning" ? "bg-orange-500" :
                          "bg-yellow-500"
                        }`}
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(239,68,68,0.2),transparent_50%)]" />
      </div>
    </motion.div>
  );
}
