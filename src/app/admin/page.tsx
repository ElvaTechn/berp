"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Package
} from "lucide-react";
import Link from "next/link";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuInput } from "@/components/ui/neu-input";
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

interface Company {
  id: string;
  name: string;
  nuit: string;
  email: string;
  phone: string;
  created_at: string;
  _count: {
    employees: number;
    products: number;
    sales: number;
  };
}

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.nuit.includes(searchQuery) ||
    company.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total_companies: companies.length,
    total_users: companies.reduce((sum, c) => sum + c._count.employees, 0),
    total_products: companies.reduce((sum, c) => sum + c._count.products, 0),
    total_sales: companies.reduce((sum, c) => sum + c._count.sales, 0),
  };

  return (
    <MaxWidthContainer size="xl">
      <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="neu-text-h1">
            Administração do Sistema
          </h1>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Gestão de empresas, auditoria e configurações
          </p>
        </div>
        
        <NeuButton
          onClick={() => window.location.href = '/admin/companies'}
          variant="accent"
        >
          <Plus className="w-5 h-5" />
          <span>Ver Empresas</span>
        </NeuButton>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--neu-accent)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Empresas
              </p>
            </div>
            <p className="neu-text-h2">
              {stats.total_companies}
            </p>
          </NeuCardContent>
        </NeuCard>

        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--neu-accent)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Usuários
              </p>
            </div>
            <p className="neu-text-h2">
              {stats.total_users}
            </p>
          </NeuCardContent>
        </NeuCard>

        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--neu-success)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Vendas
              </p>
            </div>
            <p className="neu-text-h2">
              {stats.total_sales}
            </p>
          </NeuCardContent>
        </NeuCard>

        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                <Package className="w-5 h-5 text-[var(--neu-accent)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)]">
                Produtos
              </p>
            </div>
            <p className="neu-text-h2">
              {stats.total_products}
            </p>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Search Bar */}
      <NeuInput
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Buscar empresa por nome, NUIT ou email..."
        icon={<Search className="w-5 h-5" />}
      />

      {/* Companies Table */}
      <NeuCard variant="concave" size="md">
        <NeuCardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--neu-accent)] border-t-transparent rounded-full"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-[var(--neu-accent)]" />
              </div>
              <h3 className="neu-text-h2 mb-2">
                {searchQuery ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
              </h3>
              {!searchQuery && (
                <NeuButton
                  onClick={() => window.location.href = '/admin/companies'}
                  variant="accent"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ver Todas as Empresas</span>
                </NeuButton>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--neu-base)] border-b border-[var(--neu-border)]">
                  <tr>
                    <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                      Empresa
                    </th>
                    <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                      NUIT
                    </th>
                    <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                      Contato
                    </th>
                    <th className="px-6 py-4 text-center neu-text-label text-[var(--neu-text-muted)]">
                      Usuários
                    </th>
                    <th className="px-6 py-4 text-center neu-text-label text-[var(--neu-text-muted)]">
                      Vendas
                    </th>
                    <th className="px-6 py-4 text-right neu-text-label text-[var(--neu-text-muted)]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company, index) => (
                    <motion.tr
                      key={company.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="neu-text-body font-semibold">
                            {company.name}
                          </p>
                          <p className="neu-text-caption text-[var(--neu-text-muted)]">
                            Desde {new Date(company.created_at).toLocaleDateString('pt-MZ')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="neu-text-body font-mono">
                          {company.nuit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="neu-text-body">{company.email}</p>
                          <p className="neu-text-caption text-[var(--neu-text-muted)]">{company.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full neu-surface neu-convex-xs text-[var(--neu-accent)] font-bold text-sm">
                          {company._count.employees}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full neu-surface neu-convex-xs text-[var(--neu-success)] font-bold text-sm">
                          {company._count.sales}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <NeuButton variant="convex" size="icon">
                            <Eye className="w-4 h-4" />
                          </NeuButton>
                          <NeuButton variant="convex" size="icon">
                            <Edit className="w-4 h-4" />
                          </NeuButton>
                          <NeuButton variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-[var(--neu-error)]" />
                          </NeuButton>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeuCardContent>
      </NeuCard>
    </div>
    </MaxWidthContainer>
  );
}
