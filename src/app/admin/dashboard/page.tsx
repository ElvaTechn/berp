"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  CheckCircle,
  Activity,
  CreditCard,
  Shield,
  Database,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import PageHeader from '@/components/Common/PageHeader';
import StatsCard from '@/components/Common/StatsCard';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { formatNumber } from '@/components/Common/FormatCurrency';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalCompanies: number;
    activeSubscriptions: number;
    totalEmployees: number;
    totalProducts: number;
    companiesByStatus: { name: string; value: number }[];
    companiesByType: { name: string; value: number }[];
    recentCompanies: any[];
  }>({
    totalCompanies: 0,
    activeSubscriptions: 0,
    totalEmployees: 0,
    totalProducts: 0,
    companiesByStatus: [],
    companiesByType: [],
    recentCompanies: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await apiClient.auth.me();

      if (user?.role !== 'admin') {
        window.location.href = '/';
        return;
      }

      const [companies, employees, products] = await Promise.all([
        apiClient.companies.list(),
        apiClient.employees.list(),
        apiClient.products.list(),
      ]);

      // Stats
      const activeSubscriptions = companies.filter(c => c.subscription_status === 'activo').length;

      // Companies by status
      const statusMap: Record<string, number> = {};
      companies.forEach(c => {
        const status = c.subscription_status || 'pendente';
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const companiesByStatus = Object.entries(statusMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));

      // Companies by subscription type
      const typeMap: Record<string, number> = {};
      companies.forEach(c => {
        const type = c.subscription_type || 'mensal';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      const companiesByType = Object.entries(typeMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));

      // Recent companies
      const recentCompanies = companies
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setStats({
        totalCompanies: companies.length,
        activeSubscriptions,
        totalEmployees: employees.length,
        totalProducts: products.length,
        companiesByStatus,
        companiesByType,
        recentCompanies,
      });
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  if (loading) {
    return <LoadingSpinner text="A carregar dashboard administrativo..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Administrativo"
        description="Visão global de todas as empresas do sistema"
        action={undefined}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total de Empresas"
          value={formatNumber(stats.totalCompanies)}
          icon={Building2}
          variant="primary"
        />
        <StatsCard
          title="Subscrições Activas"
          value={formatNumber(stats.activeSubscriptions)}
          subtitle={`${stats.totalCompanies > 0 ? ((stats.activeSubscriptions / stats.totalCompanies) * 100).toFixed(0) : 0}% do total`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Total de Funcionários"
          value={formatNumber(stats.totalEmployees)}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Total de Produtos"
          value={formatNumber(stats.totalProducts)}
          icon={Activity}
          variant="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companies by Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Empresas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.companiesByStatus.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.companiesByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.companiesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Sem dados
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {stats.companiesByStatus.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Companies by Subscription Type */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Subscrição</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.companiesByType.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.companiesByType}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Empresas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Companies */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Empresas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentCompanies.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{company.name}</h4>
                      <p className="text-sm text-slate-500">{company.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      company.subscription_status === 'activo'
                        ? 'bg-emerald-100 text-emerald-700'
                        : company.subscription_status === 'inactivo'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }>
                      {company.subscription_status === 'activo' ? 'Activo' :
                        company.subscription_status === 'inactivo' ? 'Inactivo' : 'Pendente'}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(company.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Nenhuma empresa cadastrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Acções Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/companies"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">Empresas</p>
                <p className="text-xs text-blue-600">Gerir empresas</p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-400" />
            </a>

            <a
              href="/admin/subscriptions"
              className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
            >
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-900">Subscrições</p>
                <p className="text-xs text-emerald-600">Gerir pagamentos</p>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </a>

            <a
              href="/admin/audit"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-900">Auditoria</p>
                <p className="text-xs text-purple-600">Ver logs</p>
              </div>
              <ArrowRight className="h-4 w-4 text-purple-400" />
            </a>

            <a
              href="/admin/backup"
              className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
            >
              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200">
                <Database className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-900">Backup</p>
                <p className="text-xs text-amber-600">Exportar dados</p>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
