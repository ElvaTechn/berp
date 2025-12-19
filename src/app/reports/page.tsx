
"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Sale, Product, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  TrendingUp,
  Wallet,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';
import PageHeader from '@/components/Common/PageHeader';
import StatsCard from '@/components/Common/StatsCard';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { formatMT, formatNumber } from '@/components/Common/FormatCurrency';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalTransactions: 0,
    averageTicket: 0,
    salesByDay: [] as any[],
    topProducts: [] as any[],
    salesByPayment: [] as any[],
    salesByCategory: [] as any[],
  });

  useEffect(() => {
    loadData();
  }, [period]);

  const getDateRange = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    switch (period) {
      case 'today':
        return { start: todayStr, end: todayStr };
      case 'week':
        return { start: format(subDays(today, 7), 'yyyy-MM-dd'), end: todayStr };
      case 'month':
        return { start: format(startOfMonth(today), 'yyyy-MM-dd'), end: todayStr };
      case 'year':
        return { start: format(startOfYear(today), 'yyyy-MM-dd'), end: todayStr };
      default:
        return { start: todayStr, end: todayStr };
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await apiClient.auth.me();
      if (!user) return; // Auth should be handled by middleware or layout eventually

      const { start, end } = getDateRange();

      const [salesData, productsData, categoriesData] = await Promise.all([
        apiClient.sales.list({ start, end }),
        apiClient.products.list(),
        apiClient.categories.list(),
      ]);

      // Calculate stats
      const totalSales = salesData.reduce((sum, s) => sum + (s.total || 0), 0);
      const totalProfit = salesData.reduce((sum, s) => sum + (s.total_profit || 0), 0);
      const totalTransactions = salesData.length;
      const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

      // Sales by day
      const salesByDayMap: Record<string, any> = {};
      salesData.forEach(sale => {
        const day = format(new Date(sale.created_at), 'yyyy-MM-dd');
        if (!salesByDayMap[day]) {
          salesByDayMap[day] = { date: day, total: 0, profit: 0 };
        }
        salesByDayMap[day].total += sale.total || 0;
        salesByDayMap[day].profit += sale.total_profit || 0; // Assuming API returns total_profit
      });
      const salesByDay = Object.values(salesByDayMap)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({
          ...d,
          date: format(new Date(d.date), 'dd/MM'),
        }));

      // Top products
      const productSales: Record<string, any> = {};
      salesData.forEach(sale => {
        sale.items?.forEach(item => {
          // items might be unknown if use Prisma includes? Check API types.
          // API sales.list uses prisma include items. So it should work if typed.
          // However Sales interface in apiClient might need 'items' prop.
          // I'll assume item has product_name or I lookup via ID.
          // My Sales Create stored product_name? Wait. 
          // My SaleItem model has product_id.
          // I need product map.
          const pName = productsData.find(p => p.id === item.product_id)?.name || 'Unknown';

          if (!productSales[pName]) {
            productSales[pName] = { name: pName, quantity: 0, total: 0 };
          }
          productSales[pName].quantity += item.quantity;
          productSales[pName].total += (item.quantity * item.price);
        });
      });
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      // Sales by payment method
      const paymentMap: Record<string, number> = {};
      salesData.forEach(sale => {
        const method = sale.payment_method || 'dinheiro';
        paymentMap[method] = (paymentMap[method] || 0) + (sale.total || 0);
      });
      const salesByPayment = Object.entries(paymentMap)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

      // Sales by category
      const categoryMap: Record<string, string> = {};
      categoriesData.forEach(c => categoryMap[c.id] = c.name);

      const salesByCat: Record<string, number> = {};
      salesData.forEach(sale => {
        sale.items?.forEach(item => {
          const product = productsData.find(p => p.id === item.product_id);
          if (product) {
            const catName = categoryMap[product.category_id] || 'Sem Categoria';
            salesByCat[catName] = (salesByCat[catName] || 0) + (item.quantity * item.price);
          }
        });
      });
      const salesByCategory = Object.entries(salesByCat)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setStats({
        totalSales,
        totalProfit,
        totalTransactions,
        averageTicket,
        salesByDay,
        topProducts,
        salesByPayment,
        salesByCategory,
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const periodLabels: Record<string, string> = {
    today: 'Hoje',
    week: 'Últimos 7 dias',
    month: 'Este Mês',
    year: 'Este Ano',
  };

  if (loading) {
    return <LoadingSpinner text="A carregar relatórios..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análise detalhada das suas vendas e desempenho"
        action={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total de Vendas"
          value={formatMT(stats.totalSales)}
          subtitle={periodLabels[period]}
          icon={Wallet}
          variant="primary"
        />
        <StatsCard
          title="Lucro Total"
          value={formatMT(stats.totalProfit)}
          subtitle={`Margem: ${stats.totalSales > 0 ? ((stats.totalProfit / stats.totalSales) * 100).toFixed(1) : 0}%`}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Transacções"
          value={formatNumber(stats.totalTransactions)}
          subtitle="Vendas realizadas"
          icon={ShoppingCart}
          variant="default"
        />
        <StatsCard
          title="Ticket Médio"
          value={formatMT(stats.averageTicket)}
          subtitle="Por venda"
          icon={Package}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Evolução das Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.salesByDay.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.salesByDay}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any) => formatMT(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      name="Vendas"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      name="Lucro"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Sem dados no período seleccionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by Payment Method */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Vendas por Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.salesByPayment.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.salesByPayment}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.salesByPayment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatMT(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Sem dados no período seleccionado
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {stats.salesByPayment.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simple table/list for top products */}
          {stats.topProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.quantity} vendidos</p>
                  </div>
                  <p className="font-bold">{formatMT(p.total)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">Sem dados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
