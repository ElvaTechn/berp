"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Employee, Company } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/components/Common/PageHeader';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { formatMT } from '@/components/Common/FormatCurrency';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nuit: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await apiClient.auth.me();
      if (!user) return;

      const employees = await apiClient.employees.list({ email: user.email });

      if (employees.length === 0) return;

      setEmployee(employees[0]);
      const companyId = employees[0].company_id;

      const companyData = await apiClient.companies.get(companyId);

      if (companyData) {
        setCompany(companyData);
        setFormData({
          name: companyData.name || '',
          nuit: companyData.nuit || '',
          address: companyData.address || '',
          phone: companyData.phone || '',
          email: companyData.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (company) {
        await apiClient.companies.update(company.id, formData);
        await loadData();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (company?.subscription_status === 'activo') {
      return {
        label: 'Activa',
        variant: 'success',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
      };
    }
    return {
      label: 'Inactiva',
      variant: 'destructive',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    };
  };

  if (loading) {
    return <LoadingSpinner text="A carregar definições..." />;
  }

  const status = getSubscriptionStatus();

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <PageHeader
        title="Definições"
        description="Configurações da sua empresa"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Company Info */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription className="text-sm">
                Informações básicas da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="name">Nome da Empresa</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome da empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nuit">NUIT</Label>
                    <Input
                      id="nuit"
                      value={formData.nuit}
                      onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
                      placeholder="Número de contribuinte"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="84 XXX XXXX"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@empresa.co.mz"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Localização"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Subscription */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Subscrição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Estado</span>
                <Badge className={`${status.bg} ${status.color} hover:${status.bg}`}>
                  <status.icon className="h-3.5 w-3.5 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Plano</span>
                <span className="font-medium capitalize">
                  {company?.subscription_type || 'Mensal'}
                </span>
              </div>

              {company?.subscription_end && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Válido até</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {format(new Date(company.subscription_end), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </>
              )}

              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Gerir Subscrição
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Criada em</span>
                <span className="font-medium">
                  {company?.created_at ? format(new Date(company.created_at), 'dd/MM/yyyy') : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Seu papel</span>
                <Badge variant="outline" className="capitalize">
                  {employee?.role || 'Gestor'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span className="font-medium truncate max-w-[150px]">
                  {employee?.email}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
