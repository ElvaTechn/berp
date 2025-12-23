"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Receipt,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// Components
import { KPICardMinimal } from "@/components/dashboard/KPICardMinimal";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TopProductsRanking } from "@/components/dashboard/TopProductsRanking";
import { PaymentDistribution } from "@/components/dashboard/PaymentDistribution";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Types
interface DashboardData {
  kpis: {
    today: {
      revenue: number;
      revenue_formatted: string;
      profit: number;
      profit_formatted: string;
      sales_count: number;
      avg_ticket: number;
      avg_ticket_formatted: string;
      profit_margin: number;
    };
    yesterday: any;
    growth: {
      revenue_percent: number;
      profit_percent: number;
      sales_percent: number;
      avg_ticket_percent: number;
    };
  };
  trend: Array<{
    date: string;
    revenue: number;
    profit: number;
    sales_count: number;
  }>;
  top_products: Array<any>;
  inventory_alerts: Array<any>;
  payment_distribution: Array<any>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboard = async (showToast = false) => {
    try {
      setRefreshing(true);

      const res = await fetch("/api/analytics/dashboard", {
        headers: {
          "Cache-Control": "no-cache"
        }
      });

      if (!res.ok) {
        throw new Error("Falha ao carregar dashboard");
      }

      const json = await res.json();

      if (json.success) {
        setData(json.data);
        if (showToast) {
          toast.success("Dashboard atualizado!");
        }
      } else {
        throw new Error(json.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboard();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboard();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // No data state - only show error if truly failed to load
  // If data exists but is empty, still render the dashboard with zeros
  if (!data && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg font-medium mb-4">
            Erro ao carregar dados do dashboard
          </p>
          <button
            onClick={() => fetchDashboard()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }
  
  // If data is null but we're not loading, return null to avoid rendering
  if (!data) {
    return null;
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-0.5">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Visão em tempo real do seu negócio</p>
        </div>

        {/* Refresh Button */}
        <motion.button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl
            bg-rose-400
            border border-orange-400/30
            font-bold text-white text-sm sm:text-base
            hover:from-orange-600 hover:to-red-600
            transition-all sunset-glow
            disabled:opacity-50 disabled:cursor-not-allowed
            w-full sm:w-auto
          `}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{refreshing ? "Atualizando..." : "Atualizar"}</span>
          <span className="sm:hidden">Refresh</span>
        </motion.button>
      </motion.div>

      {/* Empty State - Show friendly message when no sales exist */}
      {data.kpis.today.sales_count === 0 && (data.kpis.yesterday?.sales_count === 0 || !data.kpis.yesterday) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20 rounded-2xl p-8 text-center border border-orange-200 dark:border-orange-800/30"
        >
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ainda não há vendas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comece a registar vendas no sistema para ver as estatísticas aqui.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Os KPIs abaixo mostram valores iniciais (0 MT). Assim que fizer a primeira venda, verá os dados atualizados automaticamente.
            </p>
          </div>
        </motion.div>
      )}

      {/* KPI Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
          <KPICardMinimal
            title="Faturação Hoje"
            value={data.kpis.today.revenue_formatted}
            subtitle={`vs ${(data.kpis.yesterday?.revenue || 0).toLocaleString("pt-MZ")} MT ontem`}
            growth={data.kpis.growth.revenue_percent}
            icon={DollarSign}
            color="blue"
            index={0}
          />

          <KPICardMinimal
            title="Lucro Real"
            value={data.kpis.today.profit_formatted}
            subtitle={`Margem de ${data.kpis.today.profit_margin.toFixed(1)}%`}
            growth={data.kpis.growth.profit_percent}
            icon={TrendingUp}
            color="green"
            index={1}
          />

          <KPICardMinimal
            title="Vendas Hoje"
            value={data.kpis.today.sales_count}
            subtitle={`vs ${data.kpis.yesterday.sales_count} ontem`}
            growth={data.kpis.growth.sales_percent}
            icon={ShoppingCart}
            color="purple"
            index={2}
          />

          <KPICardMinimal
            title="Ticket Médio"
            value={data.kpis.today.avg_ticket_formatted}
            subtitle="Por venda"
            growth={data.kpis.growth.avg_ticket_percent}
            icon={Receipt}
            color="orange"
            index={3}
          />
        </div>

      {/* Main Chart */}
      <TrendChart data={data.trend} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
          {/* Left: Top Products */}
          <TopProductsRanking products={data.top_products} />

        {/* Right: Split Column */}
        <div className="space-y-2 sm:space-y-3">
          {/* Payment Distribution */}
          <PaymentDistribution distribution={data.payment_distribution} />

          {/* Inventory Alerts */}
          <InventoryAlerts alerts={data.inventory_alerts} />
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-6 sm:py-8"
      >
        <p className="text-xs text-gray-500 dark:text-gray-600 font-medium uppercase tracking-wider">
          BizControl 360 ERP • High-Contrast Premium • v2.0.0
        </p>
      </motion.div>
    </div>
  );
}
