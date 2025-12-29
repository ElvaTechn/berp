"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuSelect, NeuSelectContent, NeuSelectItem, NeuSelectTrigger, NeuSelectValue } from '@/components/ui/neu-select';
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription } from '@/components/ui/neu-dialog';
import {
    Building2,
    Plus,
    Search,
    RefreshCw,
    Crown,
    AlertTriangle,
    TrendingUp,
    Eye,
    EyeOff,
    Pause,
    RotateCcw,
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
    
    // Preservar dados do formulário entre aberturas do modal
    const [savedFormData, setSavedFormData] = useState<any>(null);

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
        setSavedFormData(null); // Limpar dados salvos após sucesso
        setCreatedCompany(result);
        setShowSuccessModal(true);
        fetchCompanies();
        fetchStats();
    };

    // Callback para salvar dados do formulário
    const handleSaveFormData = (data: any) => {
        setSavedFormData(data);
    };

    // Status badge
    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: React.ElementType; label: string }> = {
            ACTIVE: { color: 'text-[var(--neu-success)]', icon: CheckCircle, label: 'Ativo' },
            TRIAL: { color: 'text-[var(--neu-accent)]', icon: Clock, label: 'Trial' },
            SUSPENDED: { color: 'text-[var(--neu-error)]', icon: Pause, label: 'Suspenso' },
            EXPIRED: { color: 'text-[var(--neu-warning)]', icon: XCircle, label: 'Expirado' },
        };

        const badge = badges[status] || badges.EXPIRED;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
                <div>
                    <h1 className="neu-text-h1 flex items-center gap-3">
                        <Building2 className="w-10 h-10 text-[var(--neu-accent)]" />
                        Gestão de Empresas
                    </h1>
                    <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                        Gerir clientes e subscrições da plataforma
                    </p>
                </div>

                <NeuButton
                    variant="accent"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus className="w-5 h-5" />
                    <span>Nova Empresa</span>
                </NeuButton>
            </motion.div>

            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Total Empresas */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-[var(--neu-accent)]" />
                            </div>
                            <p className="neu-text-label text-[var(--neu-text-muted)]">Empresas</p>
                        </div>
                        <p className="neu-text-h2">{stats?.totalCompanies || 0}</p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                            Cadastradas
                        </p>
                    </NeuCardContent>
                </NeuCard>

                {/* Empresas Ativas */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-[var(--neu-success)]" />
                            </div>
                            <p className="neu-text-label text-[var(--neu-text-muted)]">Ativas</p>
                        </div>
                        <p className="neu-text-h2 text-[var(--neu-success)]">
                            {stats?.activeCompanies || 0}
                        </p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                            Subscrições ativas
                        </p>
                    </NeuCardContent>
                </NeuCard>

                {/* A Expirar */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-[var(--neu-warning)]" />
                            </div>
                            <p className="neu-text-label text-[var(--neu-text-muted)]">Alerta</p>
                        </div>
                        <p className="neu-text-h2 text-[var(--neu-warning)]">
                            {stats?.expiringCompanies || 0}
                        </p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                            Expiram em 7 dias
                        </p>
                    </NeuCardContent>
                </NeuCard>

                {/* Faturação Mensal */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-[var(--neu-accent)]" />
                            </div>
                            <p className="neu-text-label text-[var(--neu-text-muted)]">Mês</p>
                        </div>
                        <p className="neu-text-h2">
                            {(stats?.monthlyRevenue || 0).toLocaleString('pt-MZ', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                            MT faturados
                        </p>
                    </NeuCardContent>
                </NeuCard>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4"
            >
                {/* Search */}
                <div className="flex-1">
                    <NeuInput
                        type="text"
                        placeholder="Pesquisar por nome, NUIT ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-5 h-5" />}
                    />
                </div>

                {/* Status Filter */}
                <NeuSelect value={statusFilter} onValueChange={setStatusFilter}>
                    <NeuSelectTrigger variant="concave" size="md" className="w-full md:w-[200px]">
                        <NeuSelectValue placeholder="Todos os status" />
                    </NeuSelectTrigger>
                    <NeuSelectContent>
                        <NeuSelectItem value="all">Todos os status</NeuSelectItem>
                        <NeuSelectItem value="ACTIVE">Activos</NeuSelectItem>
                        <NeuSelectItem value="TRIAL">Trial</NeuSelectItem>
                        <NeuSelectItem value="SUSPENDED">Suspensos</NeuSelectItem>
                        <NeuSelectItem value="EXPIRED">Expirados</NeuSelectItem>
                    </NeuSelectContent>
                </NeuSelect>

                {/* Refresh */}
                <NeuButton
                    variant="convex"
                    size="icon"
                    onClick={() => {
                        fetchStats();
                        fetchCompanies();
                    }}
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </NeuButton>
            </motion.div>

            {/* Companies Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <NeuCard variant="concave" size="md">
                    <NeuCardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin" />
                            </div>
                        ) : companies.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-10 h-10 text-[var(--neu-accent)]" />
                                </div>
                                <h3 className="neu-text-h2 mb-2">Nenhuma empresa encontrada</h3>
                                <p className="neu-text-body text-[var(--neu-text-muted)]">
                                    Crie a primeira empresa clicando no botão acima
                                </p>
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
                                                Proprietário
                                            </th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                                                Validade
                                            </th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">
                                                Métricas
                                            </th>
                                            <th className="px-6 py-4 text-right neu-text-label text-[var(--neu-text-muted)]">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map((company, index) => (
                                            <motion.tr
                                                key={company.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                                            <span className="neu-text-body font-bold text-[var(--neu-accent)]">
                                                                {company.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="neu-text-body font-bold">{company.name}</p>
                                                            <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                                                NUIT: {company.nuit || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="neu-text-body">{company.owner.full_name}</p>
                                                    <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                                        {company.owner.email}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">{getStatusBadge(company.subscription_status)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-[var(--neu-text-muted)]" />
                                                        <span className="neu-text-body">
                                                            {company.subscription_end
                                                                ? new Date(company.subscription_end).toLocaleDateString('pt-MZ')
                                                                : '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4 neu-text-caption text-[var(--neu-text-muted)]">
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
                                                        <NeuButton
                                                            variant="convex"
                                                            size="icon"
                                                            onClick={() => handleImpersonate(company.id, company.name)}
                                                            title="Ver como cliente"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </NeuButton>

                                                        {/* Renew */}
                                                        <NeuButton
                                                            variant="convex"
                                                            size="icon"
                                                            onClick={() => handleRenew(company.id, company.name)}
                                                            title="Renovar subscrição"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </NeuButton>

                                                        {/* Suspend */}
                                                        {company.subscription_status !== 'SUSPENDED' && (
                                                            <NeuButton
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleSuspend(company.id, company.name)}
                                                                title="Suspender empresa"
                                                            >
                                                                <Pause className="w-4 h-4 text-[var(--neu-error)]" />
                                                            </NeuButton>
                                                        )}
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
            </motion.div>

            {/* Create Company Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateCompanyModal 
                        onClose={() => setShowCreateModal(false)} 
                        onSuccess={handleCreateSuccess}
                        onSaveFormData={handleSaveFormData}
                        initialData={savedFormData}
                    />
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && createdCompany && (
                    <SuccessModal
                        company={createdCompany.company}
                        user={createdCompany.user}
                        onClose={() => {
                            setShowSuccessModal(false);
                            setCreatedCompany(null);
                        }}
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
    onSaveFormData: (data: any) => void;
    initialData: any;
}

function CreateCompanyModal({ onClose, onSuccess, onSaveFormData, initialData }: CreateCompanyModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [form, setForm] = useState({
        companyName: initialData?.companyName || '',
        nuit: initialData?.nuit || '',
        address: initialData?.address || '',
        phone: initialData?.phone || '',
        companyEmail: initialData?.companyEmail || '',
        businessSector: initialData?.businessSector || '',
        ownerName: initialData?.ownerName || '',
        ownerEmail: initialData?.ownerEmail || '',
        ownerPassword: initialData?.ownerPassword || '',
        confirmPassword: initialData?.confirmPassword || '',
        trialDays: initialData?.trialDays || '30',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Verificar se há dados preenchidos no formulário
    const hasFormData = () => {
        return form.companyName.trim() !== '' || 
               form.nuit.trim() !== '' || 
               form.ownerName.trim() !== '' || 
               form.ownerEmail.trim() !== '' ||
               form.ownerPassword.trim() !== '';
    };

    // Salvar dados antes de fechar
    const handleClose = () => {
        if (hasFormData()) {
            const confirm = window.confirm(
                'Tem dados não salvos. Deseja fechar mesmo assim?\n\nClique "Cancelar" para continuar editando ou "OK" para fechar (os dados serão preservados).'
            );
            if (!confirm) return;
            
            // Salvar dados para não perder
            onSaveFormData(form);
        }
        onClose();
    };

    // Validar campo individual quando perde o foco
    const handleBlur = (fieldName: string) => {
        setTouched({ ...touched, [fieldName]: true });
        validateField(fieldName);
    };

    // Validar campo individual
    const validateField = (fieldName: string) => {
        const newErrors = { ...errors };

        switch (fieldName) {
            case 'companyName':
                if (!form.companyName.trim() || form.companyName.length < 2) {
                    newErrors.companyName = 'Nome da empresa é obrigatório (mín. 2 caracteres)';
                } else {
                    delete newErrors.companyName;
                }
                break;

            case 'nuit':
                const cleanNuit = form.nuit.replace(/\s/g, '');
                if (!cleanNuit || !/^\d{9}$/.test(cleanNuit)) {
                    newErrors.nuit = 'NUIT deve ter exatamente 9 dígitos';
                } else {
                    delete newErrors.nuit;
                }
                break;

            case 'ownerName':
                if (!form.ownerName.trim() || form.ownerName.length < 2) {
                    newErrors.ownerName = 'Nome do proprietário é obrigatório';
                } else {
                    delete newErrors.ownerName;
                }
                break;

            case 'ownerEmail':
                const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
                if (!form.ownerEmail || !emailRegex.test(form.ownerEmail.trim())) {
                    newErrors.ownerEmail = 'Email inválido';
                } else {
                    delete newErrors.ownerEmail;
                }
                break;

            case 'ownerPassword':
                if (!form.ownerPassword || form.ownerPassword.length < 8) {
                    newErrors.ownerPassword = 'Senha deve ter pelo menos 8 caracteres';
                } else if (!/[A-Z]/.test(form.ownerPassword)) {
                    newErrors.ownerPassword = 'Senha deve conter pelo menos uma letra maiúscula';
                } else if (!/[a-z]/.test(form.ownerPassword)) {
                    newErrors.ownerPassword = 'Senha deve conter pelo menos uma letra minúscula';
                } else if (!/\d/.test(form.ownerPassword)) {
                    newErrors.ownerPassword = 'Senha deve conter pelo menos um número';
                } else {
                    delete newErrors.ownerPassword;
                }
                break;

            case 'confirmPassword':
                if (form.ownerPassword !== form.confirmPassword) {
                    newErrors.confirmPassword = 'As senhas não coincidem';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
        }

        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.companyName.trim() || form.companyName.length < 2) {
            newErrors.companyName = 'Nome da empresa é obrigatório (mín. 2 caracteres)';
        }

        const cleanNuit = form.nuit.replace(/\s/g, '');
        if (!cleanNuit || !/^\d{9}$/.test(cleanNuit)) {
            newErrors.nuit = 'NUIT deve ter exatamente 9 dígitos';
        }

        if (!form.ownerName.trim() || form.ownerName.length < 2) {
            newErrors.ownerName = 'Nome do proprietário é obrigatório';
        }

        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!form.ownerEmail || !emailRegex.test(form.ownerEmail.trim())) {
            newErrors.ownerEmail = 'Email inválido. Use um formato válido (ex: nome@empresa.com)';
        }

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

        if (form.ownerPassword !== form.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Limpar erros anteriores
        setErrors({});

        if (!validateForm()) {
            toast.error('Por favor, preencha todos os campos obrigatórios corretamente', {
                description: 'Verifique os campos marcados em vermelho',
                duration: 5000,
            });
            return;
        }

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
                // Mensagens de erro específicas baseadas na resposta do servidor
                const errorMsg = data.error || 'Erro ao criar empresa';
                
                if (errorMsg.toLowerCase().includes('nuit') && errorMsg.toLowerCase().includes('registado')) {
                    toast.error('NUIT já cadastrado', {
                        description: 'Uma empresa com este NUIT já existe no sistema. Use um NUIT diferente.',
                        duration: 6000,
                    });
                } else if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('registado')) {
                    toast.error('Email já cadastrado', {
                        description: 'Este email já está em uso. Use um email diferente para o proprietário.',
                        duration: 6000,
                    });
                } else if (errorMsg.toLowerCase().includes('senha')) {
                    toast.error('Erro na senha', {
                        description: errorMsg,
                        duration: 5000,
                    });
                } else if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('inválido')) {
                    toast.error('Email inválido', {
                        description: 'O formato do email não é válido. Verifique e tente novamente.',
                        duration: 5000,
                    });
                } else {
                    toast.error('Erro ao criar empresa', {
                        description: errorMsg,
                        duration: 5000,
                    });
                }
                return;
            }

            toast.success('Empresa criada com sucesso!', {
                description: `${data.company.name} foi cadastrada na plataforma`,
                duration: 4000,
            });
            onSuccess({
                company: data.company,
                user: data.user,
            });
        } catch (error) {
            console.error('Erro ao criar empresa:', error);
            toast.error('Erro de conexão', {
                description: 'Não foi possível comunicar com o servidor. Verifique sua conexão.',
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <NeuDialog open={true} onOpenChange={handleClose}>
            <NeuDialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
                <NeuDialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-[var(--neu-accent)]" />
                            </div>
                            <div>
                                <NeuDialogTitle>Nova Empresa</NeuDialogTitle>
                                <NeuDialogDescription>Cadastrar cliente na plataforma</NeuDialogDescription>
                            </div>
                        </div>
                        {initialData && (
                            <NeuButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm('Deseja limpar todos os dados salvos e começar do zero?')) {
                                        onSaveFormData(null);
                                        setForm({
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
                                        setErrors({});
                                        setTouched({});
                                        toast.success('Formulário limpo');
                                    }
                                }}
                                title="Limpar formulário"
                            >
                                <X className="w-4 h-4" />
                                <span className="text-xs">Limpar</span>
                            </NeuButton>
                        )}
                    </div>
                </NeuDialogHeader>

                {/* Aviso de dados salvos */}
                {initialData && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-xl neu-surface neu-convex-sm border border-[var(--neu-accent)]/30"
                    >
                        <div className="flex items-center gap-2 text-[var(--neu-accent)]">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="neu-text-caption font-medium">
                                Formulário restaurado com dados anteriores
                            </p>
                        </div>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {/* Empresa Section */}
                    <div className="space-y-4">
                        <h3 className="neu-text-label text-[var(--neu-accent)] flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Dados da Empresa
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="neu-text-caption block mb-2">Nome da Empresa *</label>
                                <NeuInput
                                    type="text"
                                    value={form.companyName}
                                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                    onBlur={() => handleBlur('companyName')}
                                    placeholder="Ex: Supermercado XYZ"
                                    error={errors.companyName}
                                />
                                {errors.companyName && (
                                    <p className="neu-text-caption text-[var(--neu-error)] mt-1">{errors.companyName}</p>
                                )}
                            </div>

                            <div>
                                <label className="neu-text-caption block mb-2">
                                    <Hash className="w-3 h-3 inline mr-1" />
                                    NUIT *
                                </label>
                                <NeuInput
                                    type="text"
                                    value={form.nuit}
                                    onChange={(e) => setForm({ ...form, nuit: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                    onBlur={() => handleBlur('nuit')}
                                    placeholder="123456789"
                                    maxLength={9}
                                    error={errors.nuit}
                                />
                                {errors.nuit && <p className="neu-text-caption text-[var(--neu-error)] mt-1">{errors.nuit}</p>}
                            </div>

                            <div>
                                <label className="neu-text-caption block mb-2">
                                    <Briefcase className="w-3 h-3 inline mr-1" />
                                    Sector
                                </label>
                                <NeuInput
                                    type="text"
                                    value={form.businessSector}
                                    onChange={(e) => setForm({ ...form, businessSector: e.target.value })}
                                    placeholder="Retalho, Restauração, etc."
                                />
                            </div>

                            <div>
                                <label className="neu-text-caption block mb-2">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    Endereço
                                </label>
                                <NeuInput
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Av. Eduardo Mondlane, Maputo"
                                />
                            </div>

                            <div>
                                <label className="neu-text-caption block mb-2">
                                    <Phone className="w-3 h-3 inline mr-1" />
                                    Telefone
                                </label>
                                <NeuInput
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+258 84 XXX XXXX"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Owner Section */}
                    <div className="space-y-4">
                        <h3 className="neu-text-label text-[var(--neu-accent)] flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Dados do Proprietário
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="neu-text-caption block mb-2">Nome Completo *</label>
                                <NeuInput
                                    type="text"
                                    value={form.ownerName}
                                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                                    onBlur={() => handleBlur('ownerName')}
                                    placeholder="João da Silva"
                                    error={errors.ownerName}
                                />
                                {errors.ownerName && (
                                    <p className="neu-text-caption text-[var(--neu-error)] mt-1">{errors.ownerName}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="neu-text-caption block mb-2">
                                    <Mail className="w-3 h-3 inline mr-1" />
                                    Email de Acesso *
                                </label>
                                <NeuInput
                                    type="email"
                                    value={form.ownerEmail}
                                    onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                                    onBlur={() => handleBlur('ownerEmail')}
                                    placeholder="joao@empresa.co.mz"
                                    error={errors.ownerEmail}
                                />
                                {errors.ownerEmail && (
                                    <p className="neu-text-caption text-[var(--neu-error)] mt-1">{errors.ownerEmail}</p>
                                )}
                            </div>

                            <div>
                                <label className="neu-text-caption block mb-2">
                                    <Lock className="w-3 h-3 inline mr-1" />
                                    Senha Inicial *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.ownerPassword}
                                        onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                                        onBlur={() => handleBlur('ownerPassword')}
                                        placeholder="Min. 8 caracteres"
                                        className={`
                                            w-full neu-surface neu-concave-sm rounded-xl px-4 py-3 pr-12
                                            neu-text-body text-[var(--neu-text-primary)]
                                            placeholder:text-[var(--neu-text-muted)]
                                            border border-[var(--neu-border)]
                                            focus:outline-none focus:ring-2 focus:ring-[var(--neu-accent)]/50
                                            transition-all duration-200
                                            ${errors.ownerPassword ? 'border-[var(--neu-error)]' : ''}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg neu-surface neu-convex-sm hover:neu-convex-md transition-all"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4 text-[var(--neu-text-muted)]" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-[var(--neu-text-muted)]" />
                                        )}
                                    </button>
                                </div>
                                {errors.ownerPassword && (
                                    <p className="neu-text-caption text-[var(--neu-error)] mt-1">{errors.ownerPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="neu-text-caption block mb-2">
                                    <Lock className="w-3 h-3 inline mr-1" />
                                    Confirmar Senha *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        onBlur={() => handleBlur('confirmPassword')}
                                        placeholder="Repetir senha"
                                        className={`
                                            w-full neu-surface neu-concave-sm rounded-xl px-4 py-3 pr-12
                                            neu-text-body text-[var(--neu-text-primary)]
                                            placeholder:text-[var(--neu-text-muted)]
                                            border border-[var(--neu-border)]
                                            focus:outline-none focus:ring-2 focus:ring-[var(--neu-accent)]/50
                                            transition-all duration-200
                                            ${errors.confirmPassword ? 'border-[var(--neu-error)]' : ''}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg neu-surface neu-convex-sm hover:neu-convex-md transition-all"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4 text-[var(--neu-text-muted)]" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-[var(--neu-text-muted)]" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="neu-text-caption text-[var(--neu-error)] mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Trial Days */}
                    <div>
                        <label className="neu-text-caption block mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Dias de Trial
                        </label>
                        <NeuSelect value={form.trialDays} onValueChange={(v) => setForm({ ...form, trialDays: v })}>
                            <NeuSelectTrigger variant="concave" size="md">
                                <NeuSelectValue />
                            </NeuSelectTrigger>
                            <NeuSelectContent>
                                <NeuSelectItem value="7">7 dias</NeuSelectItem>
                                <NeuSelectItem value="14">14 dias</NeuSelectItem>
                                <NeuSelectItem value="30">30 dias</NeuSelectItem>
                                <NeuSelectItem value="60">60 dias</NeuSelectItem>
                                <NeuSelectItem value="90">90 dias</NeuSelectItem>
                            </NeuSelectContent>
                        </NeuSelect>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4">
                        <NeuButton type="button" onClick={handleClose} variant="convex" size="md" className="flex-1">
                            Cancelar
                        </NeuButton>
                        <NeuButton type="submit" disabled={isSubmitting} variant="accent" size="md" className="flex-1">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>A criar...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    <span>Criar Empresa</span>
                                </>
                            )}
                        </NeuButton>
                    </div>
                </form>
            </NeuDialogContent>
        </NeuDialog>
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
        <NeuDialog open={true} onOpenChange={onClose}>
            <NeuDialogContent size="md">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-[var(--neu-success)]" />
                    </div>

                    <h2 className="neu-text-h2 mb-6">Empresa Criada!</h2>

                    <NeuCard variant="convex" size="sm">
                        <NeuCardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="neu-text-caption text-[var(--neu-text-muted)]">Empresa:</span>
                                <span className="neu-text-body font-bold">{company.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="neu-text-caption text-[var(--neu-text-muted)]">Acesso enviado para:</span>
                                <span className="neu-text-body text-[var(--neu-success)]">{user.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="neu-text-caption text-[var(--neu-text-muted)]">Próximo pagamento:</span>
                                <span className="neu-text-body">
                                    {new Date(company.subscriptionEnd).toLocaleDateString('pt-MZ', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </NeuCardContent>
                    </NeuCard>

                    <NeuButton variant="accent" size="md" onClick={onClose} className="w-full mt-6">
                        Fechar
                    </NeuButton>
                </div>
            </NeuDialogContent>
        </NeuDialog>
    );
}
