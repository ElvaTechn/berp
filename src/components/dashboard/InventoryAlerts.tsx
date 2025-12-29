"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Package, TrendingDown, CheckCircle } from "lucide-react";

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
    color: "text-[var(--neu-error)]",
    label: "Crítico",
    pulse: true
  },
  warning: {
    icon: TrendingDown,
    color: "text-[var(--neu-warning)]",
    label: "Atenção",
    pulse: false
  },
  low: {
    icon: Package,
    color: "text-[var(--neu-warning)]",
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
    <div>
      {/* Summary Badges */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          {criticalCount > 0 && (
            <div className="neu-surface neu-convex-xs rounded-lg px-3 py-1.5 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[var(--neu-error)]"
              />
              <span className="neu-text-caption font-bold text-[var(--neu-error)]">
                {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {warningCount > 0 && (
            <div className="neu-surface neu-convex-xs rounded-lg px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--neu-warning)]" />
              <span className="neu-text-caption font-bold text-[var(--neu-warning)]">
                {warningCount} Atenção
              </span>
            </div>
          )}
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[var(--neu-success)]" />
            </div>
            <p className="neu-text-body text-[var(--neu-success)] font-medium">
              Todos os produtos com stock adequado
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                className="neu-surface neu-concave-sm rounded-xl p-4 hover:neu-concave-md transition-all group relative overflow-hidden"
              >
                {/* Pulse Effect for Critical */}
                {config.pulse && (
                  <motion.div
                    animate={{ opacity: [0.3, 0, 0.3] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-[var(--neu-error)] opacity-5 rounded-xl"
                  />
                )}

                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="neu-text-body font-bold text-[var(--neu-text-primary)] truncate group-hover:text-[var(--neu-accent)] transition-colors">
                        {alert.product_name}
                      </h4>
                      <span className={`neu-text-caption font-bold uppercase px-2 py-1 rounded-lg neu-surface neu-convex-xs ${config.color} whitespace-nowrap`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center gap-3 neu-text-caption text-[var(--neu-text-muted)] mb-3">
                      <span className="font-medium">
                        Stock: <span className={`font-bold ${config.color}`}>{alert.current_stock}</span>
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        Mínimo: {alert.min_stock}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 neu-surface neu-concave-xs rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ 
                          delay: index * 0.05 + 0.2,
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          alert.status === "critical" ? "bg-[var(--neu-error)]" :
                          alert.status === "warning" ? "bg-[var(--neu-warning)]" :
                          "bg-[var(--neu-warning)]"
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
    </div>
  );
}
