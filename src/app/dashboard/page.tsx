"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Hooks
import { useViewport } from "@/hooks/useViewport";

// Components - Neumorphic
import { NeuKPICard } from "@/components/dashboard/NeuKPICard";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardContent } from "@/components/ui/neu-card";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TopProductsRanking } from "@/components/dashboard/TopProductsRanking";
import { PaymentDistribution } from "@/components/dashboard/PaymentDistribution";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { MaxWidthContainer } from "@/components/layout/MaxWidthContainer";

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
  const router = useRouter();

  // Hook de viewport para responsividade
  const { isMobile, isTablet } = useViewport();

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
        // Erro real (401, 403, 500, etc.)
        const errorData = await res.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));

        // Se o erro é sobre configuração incompleta, mostra info amigável
        if (errorData.requiresSetup) {
          toast.info(errorData.message || "É necessário configurar sua empresa primeiro.");
          return;
        }

        throw new Error(errorData.error || `Erro ${res.status}: Falha ao carregar dashboard`);
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
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar dashboard";
      toast.error(errorMessage);
      // Não definir data como null - mantém dados anteriores se houver
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

  // Altura do chart adaptativa (mantido para componentes Recharts que não suportam CSS responsivo)
  const chartHeight = useMemo(() => {
    if (isMobile) return 250;
    if (isTablet) return 300;
    return 400;
  }, [isMobile, isTablet]);

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Se não há dados (primeiro carregamento com banco vazio ou erro), 
  // ainda renderizar com valores vazios para não confundir com erro
  if (!data) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <h1 className="neu-text-h1">Dashboard</h1>
            <p className="neu-text-caption mt-1">Visão em tempo real do seu negócio</p>
          </div>

          {/* Refresh Button */}
          <NeuButton
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            variant="accent"
            size="md"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-2">{refreshing ? "Atualizando..." : "Atualizar"}</span>
          </NeuButton>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NeuCard variant="convex" size="lg">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full neu-surface neu-convex-md flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-[var(--neu-accent)]" />
              </div>
              <h3 className="neu-text-h2 mb-3">
                Ainda não há vendas
              </h3>
              <p className="neu-text-body max-w-md mx-auto mb-4">
                Comece a registar vendas no sistema para ver as estatísticas em tempo real aqui no dashboard.
              </p>
              <div className="neu-surface neu-concave-sm rounded-xl p-4 max-w-md mx-auto">
                <p className="neu-text-caption">
                  💡 <strong>Dica:</strong> Os KPIs abaixo mostram valores iniciais (0 MT). Assim que fizer a primeira venda, verá os dados atualizados automaticamente.
                </p>
              </div>
            </div>
          </NeuCard>
        </motion.div>
      </div>
    );
  }

  return (
    <MaxWidthContainer size="xl">
      <div className="w-full space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="neu-text-h1">Dashboard</h1>
          <p className="neu-text-caption mt-1">Visão em tempo real do seu negócio</p>
        </div>

        {/* Refresh Button */}
        <NeuButton
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          variant="accent"
          size="md"
          loading={refreshing}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Atualizar</span>
        </NeuButton>
      </motion.div>

      {/* Empty State Banner - Only if no sales today and yesterday */}
      {data.kpis.today.sales_count === 0 && (data.kpis.yesterday?.sales_count === 0 || !data.kpis.yesterday) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NeuCard variant="convex" size="lg">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full neu-surface neu-convex-md flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-[var(--neu-accent)]" />
              </div>
              <h3 className="neu-text-h3 mb-2">
                Ainda não há vendas
              </h3>
              <p className="neu-text-body max-w-md mx-auto">
                Comece a registar vendas para ver as estatísticas em tempo real.
              </p>
            </div>
          </NeuCard>
        </motion.div>
      )}

      {/* KPI Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols - usando Tailwind responsivo */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <NeuKPICard
          title="Faturação Hoje"
          value={data.kpis.today.revenue_formatted}
          subtitle={`vs ${(data.kpis.yesterday?.revenue || 0).toLocaleString("pt-MZ")} MT ontem`}
          trend={
            data.kpis.growth.revenue_percent !== 0
              ? {
                  value: data.kpis.growth.revenue_percent,
                  isPositive: data.kpis.growth.revenue_percent > 0
                }
              : undefined
          }
          icon={Receipt}
          color="accent"
          index={0}
        />

        <NeuKPICard
          title="Lucro Real"
          value={data.kpis.today.profit_formatted}
          subtitle={`Margem de ${data.kpis.today.profit_margin.toFixed(1)}%`}
          trend={
            data.kpis.growth.profit_percent !== 0
              ? {
                  value: data.kpis.growth.profit_percent,
                  isPositive: data.kpis.growth.profit_percent > 0
                }
              : undefined
          }
          icon={TrendingUp}
          color="success"
          index={1}
        />

        <NeuKPICard
          title="Vendas Hoje"
          value={data.kpis.today.sales_count}
          subtitle={`vs ${data.kpis.yesterday.sales_count} ontem`}
          trend={
            data.kpis.growth.sales_percent !== 0
              ? {
                  value: data.kpis.growth.sales_percent,
                  isPositive: data.kpis.growth.sales_percent > 0
                }
              : undefined
          }
          icon={ShoppingCart}
          color="default"
          index={2}
        />

        <NeuKPICard
          title="Ticket Médio"
          value={data.kpis.today.avg_ticket_formatted}
          subtitle="Por venda"
          trend={
            data.kpis.growth.avg_ticket_percent !== 0
              ? {
                  value: data.kpis.growth.avg_ticket_percent,
                  isPositive: data.kpis.growth.avg_ticket_percent > 0
                }
              : undefined
          }
          icon={Receipt}
          color="warning"
          index={3}
        />
      </div>

      {/* Main Chart - Altura adaptativa */}
      <NeuCard variant="convex" size="md" className="w-full">
        <NeuCardHeader>
          <NeuCardTitle className="text-base sm:text-lg">Tendência de Vendas (7 dias)</NeuCardTitle>
        </NeuCardHeader>
        <NeuCardContent style={{ minHeight: chartHeight }}>
          <TrendChart data={data.trend} isMobile={isMobile} />
        </NeuCardContent>
      </NeuCard>

      {/* Bottom Grid */}
      <div className={`w-full grid gap-4 lg:gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Left: Top Products */}
        <NeuCard variant="convex" size="md">
          <NeuCardHeader>
            <NeuCardTitle className="text-base sm:text-lg">Produtos Mais Vendidos</NeuCardTitle>
          </NeuCardHeader>
          <NeuCardContent>
            <TopProductsRanking products={data.top_products} limit={isMobile ? 3 : 5} />
          </NeuCardContent>
        </NeuCard>

        {/* Right: Split Column */}
        <div className="space-y-4">
          {/* Payment Distribution */}
          <NeuCard variant="convex" size="md">
            <NeuCardHeader>
              <NeuCardTitle className="text-base sm:text-lg">Distribuição de Pagamentos</NeuCardTitle>
            </NeuCardHeader>
            <NeuCardContent>
              <PaymentDistribution distribution={data.payment_distribution} />
            </NeuCardContent>
          </NeuCard>

          {/* Inventory Alerts */}
          <NeuCard variant="convex" size="md">
            <NeuCardHeader>
              <NeuCardTitle className="text-base sm:text-lg">Alertas de Stock</NeuCardTitle>
            </NeuCardHeader>
            <NeuCardContent>
              <InventoryAlerts alerts={data.inventory_alerts} limit={isMobile ? 2 : 3} />
            </NeuCardContent>
          </NeuCard>
        </div>
      </div>

      {/* Botão flutuante "Nova Venda" para mobile */}
      {isMobile && (
        <motion.button
          onClick={() => router.push('/pos')}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full neu-surface neu-convex-lg flex items-center justify-center shadow-xl z-50 touch-target tap-highlight-transparent"
        >
          <ShoppingCart className="w-6 h-6 text-[var(--neu-accent)]" />
        </motion.button>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-8"
      >
        <p className="neu-text-label text-[var(--neu-text-muted)]">
          BizControl 360 ERP • Neumorphism Design • v2.0.0
        </p>
      </motion.div>
      </div>
    </MaxWidthContainer>
  );
}
