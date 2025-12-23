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
  Trash2
} from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
            Administração do Sistema
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestão de empresas, auditoria e configurações
          </p>
        </div>
        
        <Link
          href="/admin/companies/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Empresa</span>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Empresas</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {stats.total_companies}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Usuários</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {stats.total_users}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Vendas</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {stats.total_sales}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Produtos</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {stats.total_products}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar empresa por nome, NUIT ou email..."
          className="w-full h-12 pl-11 pr-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {searchQuery ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
            </p>
            {!searchQuery && (
              <Link
                href="/admin/companies/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeira Empresa</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                    NUIT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                    Contato
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                    Usuários
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                    Vendas
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredCompanies.map((company, index) => (
                  <motion.tr
                    key={company.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Desde {new Date(company.created_at).toLocaleDateString('pt-MZ')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {company.nuit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{company.email}</p>
                        <p className="text-gray-500">{company.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-sm">
                        {company._count.employees}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-sm">
                        {company._count.sales}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
