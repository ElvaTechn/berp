"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Loader2,
  Clock
} from 'lucide-react';
import { format, differenceInDays, addMonths, addYears } from 'date-fns';
import { pt } from 'date-fns/locale';
import PageHeader from '@/components/Common/PageHeader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { toast } from '@/components/ui/toast';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscription_status: string;
  subscription_type: string;
  subscription_end: string | null;
  created_at: string;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) {
      toast.error('Erro ao carregar', 'Não foi possível carregar as subscrições');
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.subscription_status === statusFilter);
    }

    setFilteredCompanies(filtered);
  };

  const getStatusBadge = (status: string, endDate: string | null) => {
    const daysUntilExpiry = endDate ? differenceInDays(new Date(endDate), new Date()) : null;

    if (status === 'activo') {
      if (daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        return <Badge className="bg-amber-100 text-amber-700">Expira em {daysUntilExpiry}d</Badge>;
      }
      if (daysUntilExpiry !== null && daysUntilExpiry <= 0) {
        return <Badge className="bg-red-100 text-red-700">Expirado</Badge>;
      }
      return <Badge className="bg-emerald-100 text-emerald-700">Activo</Badge>;
    }
    if (status === 'inactivo') {
      return <Badge className="bg-red-100 text-red-700">Inactivo</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-700">Pendente</Badge>;
  };

  const handleRenew = async (company: Company, months: number) => {
    setUpdating(true);
    try {
      const newEndDate = company.subscription_end
        ? addMonths(new Date(company.subscription_end), months)
        : addMonths(new Date(), months);

      const res = await fetch(`/api/admin/subscriptions/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_status: 'activo',
          subscription_end: newEndDate.toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to renew');

      toast.success('Subscrição renovada', `+${months} meses adicionados`);
      loadData();
      setSelectedCompany(null);
    } catch {
      toast.error('Erro', 'Não foi possível renovar a subscrição');
    } finally {
      setUpdating(false);
    }
  };

  const handleSuspend = async (company: Company) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_status: 'inactivo' }),
      });

      if (!res.ok) throw new Error('Failed to suspend');

      toast.success('Subscrição suspensa', 'A empresa não terá mais acesso');
      loadData();
      setSelectedCompany(null);
    } catch {
      toast.error('Erro', 'Não foi possível suspender a subscrição');
    } finally {
      setUpdating(false);
    }
  };

  const handleActivate = async (company: Company) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_status: 'activo',
          subscription_end: addMonths(new Date(), 1).toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to activate');

      toast.success('Subscrição activada', '1 mês de acesso concedido');
      loadData();
      setSelectedCompany(null);
    } catch {
      toast.error('Erro', 'Não foi possível activar a subscrição');
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.subscription_status === 'activo').length,
    inactive: companies.filter(c => c.subscription_status === 'inactivo').length,
    expiring: companies.filter(c => {
      if (!c.subscription_end) return false;
      const days = differenceInDays(new Date(c.subscription_end), new Date());
      return days <= 7 && days > 0;
    }).length,
  };

  if (loading) {
    return <LoadingSpinner text="A carregar subscrições..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Subscrições"
        description="Controle as subscrições das empresas"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-slate-500">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expiring}</p>
                <p className="text-sm text-slate-500">A expirar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-sm text-slate-500">Inactivas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Pesquisar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Empresas ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length > 0 ? (
            <div className="space-y-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{company.name}</h4>
                      <p className="text-sm text-slate-500">{company.email}</p>
                      {company.subscription_end && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          Expira: {format(new Date(company.subscription_end), "dd 'de' MMMM, yyyy", { locale: pt })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    {getStatusBadge(company.subscription_status, company.subscription_end)}
                    
                    <div className="flex gap-2">
                      {company.subscription_status !== 'activo' && (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(company)}
                          disabled={updating}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activar
                        </Button>
                      )}
                      
                      {company.subscription_status === 'activo' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenew(company, 1)}
                            disabled={updating}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            +1 mês
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSuspend(company)}
                            disabled={updating}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Suspender
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma empresa encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
