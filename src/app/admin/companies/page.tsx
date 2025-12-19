"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Plus,
    Search,
    RefreshCw,
    Crown,
    AlertTriangle,
    TrendingUp,
    Eye,
    Pause,
    RotateCcw,
    Edit2,
    Calendar,
    Users,
    Package,
    ShoppingCart,
    CheckCircle,
    XCircle,
    Clock,
    X,
    Mail,
    Lock,
    Phone,
    MapPin,
    Hash,
    Briefcase,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Company {
    id: string;
    name: string;
    nuit: string | null;
    email: string | null;
    phone: string | null;
    subscription_status: string;
    subscription_type: string;
    subscription_end: string | null;
    created_at: string;
    owner: {
        id: string;
        full_name: string;
        email: string;
    };
    _count: {
        employees: number;
        products: number;
        sales: number;
    };
}

interface Stats {
    totalCompanies: number;
    activeCompanies: number;
    expiringCompanies: number;
    monthlyRevenue: number;
}

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdCompany, setCreatedCompany] = useState<{
        company: { name: string; subscriptionEnd: string };
        user: { email: string };
    } | null>(null);

    // Fetch stats
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Fetch companies
    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (statusFilter !== 'all') params.set('status', statusFilter);

            const res = await fetch(`/api/admin/companies?${params}`);
            if (res.ok) {
                const data = await res.json();
                setCompanies(data.companies);
            }
        } catch (error) {
            toast.error('Erro ao carregar empresas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchCompanies();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(fetchCompanies, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm, statusFilter]);

    // Suspend company
    const handleSuspend = async (companyId: string, companyName: string) => {
        if (!confirm(`Tem certeza que deseja suspender "${companyName}"?`)) return;

        try {
            const res = await fetch(`/api/admin/companies/${companyId}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Suspensão administrativa' }),
            });

            if (res.ok) {
                toast.success('Empresa suspensa com sucesso');
                fetchCompanies();
                fetchStats();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Erro ao suspender empresa');
            }
        } catch (error) {
            toast.error('Erro ao suspender empresa');
        }
    };

    // Renew subscription
    const handleRenew = async (companyId: string, companyName: string) => {
        const days = prompt(`Quantos dias deseja renovar para "${companyName}"?`, '30');
        if (!days) return;

        const daysNum = parseInt(days);
        if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
            toast.error('Dias deve ser um número entre 1 e 365');
            return;
        }

        try {
            const res = await fetch(`/api/admin/companies/${companyId}/renew`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: daysNum }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Subscrição renovada até ${new Date(data.newEndDate).toLocaleDateString('pt-MZ')}`);
                fetchCompanies();
                fetchStats();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Erro ao renovar subscrição');
            }
        } catch (error) {
            toast.error('Erro ao renovar subscrição');
        }
    };

    // Impersonate (View as client)
    const handleImpersonate = async (companyId: string, companyName: string) => {
        if (!confirm(`Vai aceder ao dashboard de "${companyName}" como suporte. Continuar?`)) return;

        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                window.location.href = data.redirectTo;
            } else {
                const data = await res.json();
                toast.error(data.error || 'Erro ao aceder como cliente');
            }
        } catch (error) {
            toast.error('Erro ao aceder como cliente');
        }
    };

    // Success callback from create modal
    const handleCreateSuccess = (result: { company: { name: string; subscriptionEnd: string }; user: { email: string } }) => {
        setShowCreateModal(false);
        setCreatedCompany(result);
        setShowSuccessModal(true);
        fetchCompanies();
        fetchStats();
    };

    // Status badge
    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: React.ElementType; label: string }> = {
            ACTIVE: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Ativo' },
            TRIAL: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock, label: 'Trial' },
            SUSPENDED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Pause, label: 'Suspenso' },
            EXPIRED: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: XCircle, label: 'Expirado' },
        };

        const badge = badges[status] || badges.EXPIRED;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tight flex items-center gap-3">
                        <Building2 className="w-10 h-10 text-purple-500" />
                        Gestão de <span className="text-purple-400">Empresas</span>
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">
                        Gerir clientes e subscrições da plataforma
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nova Empresa
                </motion.button>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Empresas */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 p-6 backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20">
                                <Building2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="text-xs font-bold text-purple-400 bg-purple-600/20 px-2 py-1 rounded-full">
                                TOTAL
                            </span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">
                            {stats?.totalCompanies || 0}
                        </p>
                        <p className="text-sm text-slate-400 font-medium">Empresas cadastradas</p>
                    </div>
                </motion.div>

                {/* Empresas Ativas */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 p-6 backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-600/20">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <span className="text-xs font-bold text-green-400 bg-green-600/20 px-2 py-1 rounded-full">
                                ATIVAS
                            </span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">
                            {stats?.activeCompanies || 0}
                        </p>
                        <p className="text-sm text-slate-400 font-medium">Subscrições ativas</p>
                    </div>
                </motion.div>

                {/* A Expirar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 p-6 backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-600/20">
                                <AlertTriangle className="w-6 h-6 text-orange-400" />
                            </div>
                            <span className="text-xs font-bold text-orange-400 bg-orange-600/20 px-2 py-1 rounded-full">
                                ALERTA
                            </span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">
                            {stats?.expiringCompanies || 0}
                        </p>
                        <p className="text-sm text-slate-400 font-medium">Expiram em 7 dias</p>
                    </div>
                </motion.div>

                {/* Faturação Mensal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600/10 to-pink-600/5 border border-pink-500/20 p-6 backdrop-blur-sm"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-600/20">
                                <TrendingUp className="w-6 h-6 text-pink-400" />
                            </div>
                            <span className="text-xs font-bold text-pink-400 bg-pink-600/20 px-2 py-1 rounded-full">
                                MÊS
                            </span>
                        </div>
                        <p className="text-4xl font-black text-white mb-1">
                            {(stats?.monthlyRevenue || 0).toLocaleString('pt-MZ', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-sm text-slate-400 font-medium">MT faturados</p>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col md:flex-row gap-4"
            >
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, NUIT ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-12 px-4 bg-white/5 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                >
                    <option value="all">Todos os status</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="TRIAL">Trial</option>
                    <option value="SUSPENDED">Suspensos</option>
                    <option value="EXPIRED">Expirados</option>
                </select>

                {/* Refresh */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { fetchStats(); fetchCompanies(); }}
                    className="h-12 px-4 bg-white/5 border border-purple-500/20 rounded-xl text-white hover:bg-purple-500/10 transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </motion.button>
            </motion.div>

            {/* Companies Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-purple-500/20 bg-white/5 backdrop-blur-sm overflow-hidden"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Building2 className="w-16 h-16 text-slate-600 mb-4" />
                        <p className="text-lg font-bold text-white mb-2">Nenhuma empresa encontrada</p>
                        <p className="text-sm text-slate-400">Crie a primeira empresa clicando no botão acima</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-purple-500/20">
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                                        Empresa
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                                        Proprietário
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                                        Validade
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                                        Métricas
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-500/10">
                                {companies.map((company, index) => (
                                    <motion.tr
                                        key={company.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-purple-500/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                                                    <span className="text-sm font-black text-purple-400">
                                                        {company.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{company.name}</p>
                                                    <p className="text-xs text-slate-500">NUIT: {company.nuit || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-white font-medium">{company.owner.full_name}</p>
                                            <p className="text-xs text-slate-500">{company.owner.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(company.subscription_status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-white">
                                                    {company.subscription_end
                                                        ? new Date(company.subscription_end).toLocaleDateString('pt-MZ')
                                                        : '—'
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {company._count.employees}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" />
                                                    {company._count.products}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ShoppingCart className="w-3 h-3" />
                                                    {company._count.sales}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View as Client */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleImpersonate(company.id, company.name)}
                                                    className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                                                    title="Ver como cliente"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </motion.button>

                                                {/* Renew */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleRenew(company.id, company.name)}
                                                    className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                                                    title="Renovar subscrição"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </motion.button>

                                                {/* Suspend */}
                                                {company.subscription_status !== 'SUSPENDED' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleSuspend(company.id, company.name)}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                                        title="Suspender empresa"
                                                    >
                                                        <Pause className="w-4 h-4" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Create Company Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateCompanyModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleCreateSuccess}
                    />
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && createdCompany && (
                    <SuccessModal
                        company={createdCompany.company}
                        user={createdCompany.user}
                        onClose={() => { setShowSuccessModal(false); setCreatedCompany(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ================================================================
// CREATE COMPANY MODAL
// ================================================================

interface CreateCompanyModalProps {
    onClose: () => void;
    onSuccess: (result: { company: { name: string; subscriptionEnd: string }; user: { email: string } }) => void;
}

function CreateCompanyModal({ onClose, onSuccess }: CreateCompanyModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        companyName: '',
        nuit: '',
        address: '',
        phone: '',
        companyEmail: '',
        businessSector: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        confirmPassword: '',
        trialDays: '30',
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Company name
        if (!form.companyName.trim() || form.companyName.length < 2) {
            newErrors.companyName = 'Nome da empresa é obrigatório (mín. 2 caracteres)';
        }

        // NUIT validation (9 dígitos)
        const cleanNuit = form.nuit.replace(/\s/g, '');
        if (!cleanNuit || !/^\d{9}$/.test(cleanNuit)) {
            newErrors.nuit = 'NUIT deve ter exatamente 9 dígitos';
        }

        // Owner name
        if (!form.ownerName.trim() || form.ownerName.length < 2) {
            newErrors.ownerName = 'Nome do proprietário é obrigatório';
        }

        // Email validation (rigorosa)
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!form.ownerEmail || !emailRegex.test(form.ownerEmail.trim())) {
            newErrors.ownerEmail = 'Email inválido. Use um formato válido (ex: nome@empresa.com)';
        }

        // Password validation
        if (!form.ownerPassword || form.ownerPassword.length < 8) {
            newErrors.ownerPassword = 'Senha deve ter pelo menos 8 caracteres';
        } else {
            if (!/[A-Z]/.test(form.ownerPassword)) {
                newErrors.ownerPassword = 'Senha deve conter pelo menos uma letra maiúscula';
            } else if (!/[a-z]/.test(form.ownerPassword)) {
                newErrors.ownerPassword = 'Senha deve conter pelo menos uma letra minúscula';
            } else if (!/\d/.test(form.ownerPassword)) {
                newErrors.ownerPassword = 'Senha deve conter pelo menos um número';
            }
        }

        // Confirm password
        if (form.ownerPassword !== form.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: form.companyName.trim(),
                    nuit: form.nuit.replace(/\s/g, ''),
                    address: form.address.trim() || undefined,
                    phone: form.phone.trim() || undefined,
                    companyEmail: form.companyEmail.trim() || undefined,
                    businessSector: form.businessSector.trim() || undefined,
                    ownerName: form.ownerName.trim(),
                    ownerEmail: form.ownerEmail.trim().toLowerCase(),
                    ownerPassword: form.ownerPassword,
                    trialDays: parseInt(form.trialDays) || 30,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Erro ao criar empresa');
                return;
            }

            toast.success('Empresa criada com sucesso!');
            onSuccess({
                company: data.company,
                user: data.user,
            });
        } catch (error) {
            toast.error('Erro ao criar empresa');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-purple-500/20 rounded-3xl shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#0a0a0a] border-b border-purple-500/20 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white italic">Nova Empresa</h2>
                            <p className="text-sm text-slate-400">Cadastrar cliente na plataforma</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Empresa Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Dados da Empresa
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Company Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nome da Empresa *
                                </label>
                                <input
                                    type="text"
                                    value={form.companyName}
                                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                    placeholder="Ex: Supermercado XYZ"
                                    className={`w-full h-12 px-4 bg-white/5 border ${errors.companyName ? 'border-red-500' : 'border-purple-500/20'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                                />
                                {errors.companyName && (
                                    <p className="mt-1 text-xs text-red-400">{errors.companyName}</p>
                                )}
                            </div>

                            {/* NUIT */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Hash className="w-4 h-4 inline mr-1" />
                                    NUIT *
                                </label>
                                <input
                                    type="text"
                                    value={form.nuit}
                                    onChange={(e) => setForm({ ...form, nuit: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                    placeholder="123456789"
                                    maxLength={9}
                                    className={`w-full h-12 px-4 bg-white/5 border ${errors.nuit ? 'border-red-500' : 'border-purple-500/20'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                                />
                                {errors.nuit && (
                                    <p className="mt-1 text-xs text-red-400">{errors.nuit}</p>
                                )}
                            </div>

                            {/* Business Sector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Briefcase className="w-4 h-4 inline mr-1" />
                                    Sector
                                </label>
                                <input
                                    type="text"
                                    value={form.businessSector}
                                    onChange={(e) => setForm({ ...form, businessSector: e.target.value })}
                                    placeholder="Retalho, Restauração, etc."
                                    className="w-full h-12 px-4 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Endereço
                                </label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Av. Eduardo Mondlane, Maputo"
                                    className="w-full h-12 px-4 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+258 84 XXX XXXX"
                                    className="w-full h-12 px-4 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Owner Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Dados do Proprietário
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Owner Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={form.ownerName}
                                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                                    placeholder="João da Silva"
                                    className={`w-full h-12 px-4 bg-white/5 border ${errors.ownerName ? 'border-red-500' : 'border-purple-500/20'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                                />
                                {errors.ownerName && (
                                    <p className="mt-1 text-xs text-red-400">{errors.ownerName}</p>
                                )}
                            </div>

                            {/* Owner Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email de Acesso *
                                </label>
                                <input
                                    type="email"
                                    value={form.ownerEmail}
                                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                                    placeholder="joao@empresa.co.mz"
                                    className={`w-full h-12 px-4 bg-white/5 border ${errors.ownerEmail ? 'border-red-500' : 'border-purple-500/20'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                                />
                                {errors.ownerEmail && (
                                    <p className="mt-1 text-xs text-red-400">{errors.ownerEmail}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Senha Inicial *
                                </label>
                                <input
                                    type="password"
                                    value={form.ownerPassword}
                                    onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                                    placeholder="Min. 8 caracteres"
                                    className={`w-full h-12 px-4 bg-white/5 border ${errors.ownerPassword ? 'border-red-500' : 'border-purple-500/20'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                                />
                                {errors.ownerPassword && (
                                    <p className="mt-1 text-xs text-red-400">{errors.ownerPassword}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Lock className="w-4 h-4 inline mr-1" />
                                    Confirmar Senha *
                                </label>
                                <input
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    placeholder="Repetir senha"
                                    className={`w-full h-12 px-4 bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-purple-500/20'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trial Days */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Dias de Trial
                        </label>
                        <select
                            value={form.trialDays}
                            onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
                            className="w-full h-12 px-4 bg-white/5 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            <option value="7">7 dias</option>
                            <option value="14">14 dias</option>
                            <option value="30">30 dias</option>
                            <option value="60">60 dias</option>
                            <option value="90">90 dias</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl border border-purple-500/20 text-white font-bold hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    A criar...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Criar Empresa
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ================================================================
// SUCCESS MODAL
// ================================================================

interface SuccessModalProps {
    company: { name: string; subscriptionEnd: string };
    user: { email: string };
    onClose: () => void;
}

function SuccessModal({ company, user, onClose }: SuccessModalProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#0a0a0a] border border-green-500/20 rounded-3xl shadow-2xl p-8 text-center"
            >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-black text-white mb-2">
                    Empresa Criada!
                </h2>

                <div className="mt-6 space-y-4 text-left bg-white/5 rounded-xl p-4 border border-green-500/20">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Empresa:</span>
                        <span className="text-white font-bold">{company.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Acesso enviado para:</span>
                        <span className="text-green-400 font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Próximo pagamento:</span>
                        <span className="text-white font-medium">
                            {new Date(company.subscriptionEnd).toLocaleDateString('pt-MZ', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/30"
                >
                    Fechar
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
