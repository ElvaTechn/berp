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
import { KPICard } from "@/components/dashboard/KPICard";
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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] p-6">
        <div className="max-w-[1800px] mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-4">
            Erro ao carregar dados do dashboard
          </p>
          <button
            onClick={() => fetchDashboard()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Visão em tempo real do seu negócio
            </p>
          </div>

          {/* Refresh Button */}
          <motion.button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl
              bg-gradient-to-br from-blue-500 to-blue-600
              border border-blue-400/30
              font-bold text-white
              hover:from-blue-600 hover:to-blue-700
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
          </motion.button>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Faturação Hoje"
            value={data.kpis.today.revenue_formatted}
            subtitle={`vs ${data.kpis.yesterday.revenue.toLocaleString("pt-MZ")} MT ontem`}
            growth={data.kpis.growth.revenue_percent}
            icon={DollarSign}
            color="blue"
            index={0}
          />

          <KPICard
            title="Lucro Real"
            value={data.kpis.today.profit_formatted}
            subtitle={`Margem de ${data.kpis.today.profit_margin.toFixed(1)}%`}
            growth={data.kpis.growth.profit_percent}
            icon={TrendingUp}
            color="green"
            index={1}
          />

          <KPICard
            title="Vendas Hoje"
            value={data.kpis.today.sales_count}
            subtitle={`vs ${data.kpis.yesterday.sales_count} ontem`}
            growth={data.kpis.growth.sales_percent}
            icon={ShoppingCart}
            color="purple"
            index={2}
          />

          <KPICard
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Top Products */}
          <TopProductsRanking products={data.top_products} />

          {/* Right: Split Column */}
          <div className="space-y-6">
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
          className="text-center py-8"
        >
          <p className="text-xs text-slate-500 dark:text-slate-600 font-medium uppercase tracking-wider">
            BizControl 360 ERP • Enterprise Grade • v2.0.0
          </p>
        </motion.div>
      </div>
    </div>
  );
}
