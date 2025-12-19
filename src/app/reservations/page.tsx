"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Plus,
    Search,
    RefreshCw,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ShoppingCart,
    User,
    CreditCard,
    Phone,
    FileText,
    Package,
    Loader2,
    X,
    Timer,
    Ban,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface Reservation {
    id: string;
    customer_name: string;
    customer_bi: string | null;
    customer_phone: string | null;
    quantity: number;
    status: string;
    deposit_amount: number | null;
    deposit_paid: boolean;
    notes: string | null;
    expires_at: string;
    created_at: string;
    product: {
        id: string;
        name: string;
        price: number;
    } | null;
    employee: {
        id: string;
        full_name: string;
    } | null;
}

interface Stats {
    pending: number;
    expiringSoon: number;
    completedToday: number;
    totalReservedValue: number;
}

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [resData, productsData, statsData] = await Promise.all([
                fetch('/api/reservations?stats=true').then(r => r.json()),
                fetch('/api/products').then(r => r.json()),
                fetch('/api/reservations/stats').then(r => r.json()),
            ]);

            if (resData.reservations) setReservations(resData.reservations);
            if (productsData.products) setProducts(productsData.products);
            if (statsData.stats) setStats(statsData.stats);
        } catch (error) {
            toast.error('Erro ao carregar dados');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Complete reservation (convert to sale)
    const handleComplete = async (reservationId: string) => {
        if (!confirm('Converter esta reserva em venda? O cliente pagou?')) return;

        setProcessingId(reservationId);
        try {
            const res = await fetch(`/api/reservations/${reservationId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethod: 'DINHEIRO' }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Venda criada! Total: ${data.sale?.total?.toLocaleString('pt-MZ')} MT`);
                fetchData();
            } else {
                toast.error(data.error || 'Erro ao completar reserva');
            }
        } catch (error) {
            toast.error('Erro ao completar reserva');
        } finally {
            setProcessingId(null);
        }
    };

    // Cancel reservation
    const handleCancel = async (reservationId: string) => {
        const reason = prompt('Motivo do cancelamento (opcional):');
        if (reason === null) return; // User clicked cancel

        setProcessingId(reservationId);
        try {
            const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Reserva cancelada. Stock devolvido!');
                fetchData();
            } else {
                toast.error(data.error || 'Erro ao cancelar reserva');
            }
        } catch (error) {
            toast.error('Erro ao cancelar reserva');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter reservations
    const filteredReservations = reservations.filter(res => {
        const matchesSearch = 
            res.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.customer_bi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.customer_phone?.includes(searchTerm) ||
            res.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Get time remaining
    const getTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) return { text: 'Expirado', color: 'text-red-400', urgent: true };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 6) return { text: `${hours}h ${minutes}m`, color: 'text-orange-400', urgent: true };
        if (hours < 24) return { text: `${hours}h ${minutes}m`, color: 'text-yellow-400', urgent: false };
        
        const days = Math.floor(hours / 24);
        return { text: `${days}d ${hours % 24}h`, color: 'text-green-400', urgent: false };
    };

    // Status badge
    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: React.ElementType; label: string }> = {
            PENDING: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Clock, label: 'Pendente' },
            CONFIRMED: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle, label: 'Confirmada' },
            COMPLETED: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: ShoppingCart, label: 'Concluída' },
            CANCELLED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Cancelada' },
            EXPIRED: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Ban, label: 'Expirada' },
        };

        const badge = badges[status] || badges.PENDING;
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
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tight flex items-center gap-3">
                        <Calendar className="w-10 h-10 text-cyan-500" />
                        <span className="text-slate-900 dark:text-white">Reservas</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                        Gerir reservas de produtos e conversão em vendas
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nova Reserva
                </motion.button>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pendentes */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-orange-600/10 dark:to-orange-600/5 border border-slate-200 dark:border-orange-500/20 p-6 shadow-lg shadow-orange-500/5 dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-600/20">
                                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-600/20 px-2 py-1 rounded-full">
                                ATIVAS
                            </span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {stats?.pending || 0}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Reservas pendentes</p>
                    </div>
                </motion.div>

                {/* A Expirar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-red-600/10 dark:to-red-600/5 border border-slate-200 dark:border-red-500/20 p-6 shadow-lg shadow-red-500/5 dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 dark:bg-red-600/20">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-600/20 px-2 py-1 rounded-full animate-pulse">
                                URGENTE
                            </span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {stats?.expiringSoon || 0}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Expiram em 24h</p>
                    </div>
                </motion.div>

                {/* Concluídas Hoje */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-green-600/10 dark:to-green-600/5 border border-slate-200 dark:border-green-500/20 p-6 shadow-lg shadow-green-500/5 dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-600/20">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-600/20 px-2 py-1 rounded-full">
                                HOJE
                            </span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {stats?.completedToday || 0}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Convertidas em venda</p>
                    </div>
                </motion.div>

                {/* Valor Total Reservado */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-cyan-600/10 dark:to-cyan-600/5 border border-slate-200 dark:border-cyan-500/20 p-6 shadow-lg shadow-cyan-500/5 dark:shadow-none"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-600/20">
                                <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-600/20 px-2 py-1 rounded-full">
                                VALOR
                            </span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                            {(stats?.totalReservedValue || 0).toLocaleString('pt-MZ', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">MT em reservas</p>
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
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, BI, telefone ou produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-12 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                    <option value="all">Todos os status</option>
                    <option value="PENDING">Pendentes</option>
                    <option value="CONFIRMED">Confirmadas</option>
                    <option value="COMPLETED">Concluídas</option>
                    <option value="CANCELLED">Canceladas</option>
                    <option value="EXPIRED">Expiradas</option>
                </select>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchData}
                    className="h-12 px-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-cyan-500/10 transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </motion.button>
            </motion.div>

            {/* Reservations Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-white/5 backdrop-blur-sm overflow-hidden shadow-lg dark:shadow-none"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                    </div>
                ) : filteredReservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhuma reserva encontrada</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Crie a primeira reserva clicando no botão acima</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-cyan-500/20 bg-slate-50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Produto
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Tempo Restante
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-cyan-500/10">
                                {filteredReservations.map((reservation, index) => {
                                    const timeRemaining = getTimeRemaining(reservation.expires_at);
                                    const totalValue = (reservation.product?.price || 0) * reservation.quantity;

                                    return (
                                        <motion.tr
                                            key={reservation.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`hover:bg-slate-50 dark:hover:bg-cyan-500/5 transition-colors ${
                                                timeRemaining.urgent && reservation.status === 'PENDING'
                                                    ? 'bg-orange-50 dark:bg-orange-500/5'
                                                    : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {reservation.customer_name}
                                                        </p>
                                                        {reservation.customer_bi && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                BI: {reservation.customer_bi}
                                                            </p>
                                                        )}
                                                        {reservation.customer_phone && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {reservation.customer_phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                    <div>
                                                        <p className="text-sm text-slate-900 dark:text-white font-medium">
                                                            {reservation.product?.name || '—'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Qtd: {reservation.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {totalValue.toLocaleString('pt-MZ')} MT
                                                </p>
                                                {reservation.deposit_amount && (
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        Sinal: {Number(reservation.deposit_amount).toLocaleString('pt-MZ')} MT
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {reservation.status === 'PENDING' || reservation.status === 'CONFIRMED' ? (
                                                    <div className={`flex items-center gap-2 ${timeRemaining.color}`}>
                                                        <Timer className={`w-4 h-4 ${timeRemaining.urgent ? 'animate-pulse' : ''}`} />
                                                        <span className="text-sm font-bold">{timeRemaining.text}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(reservation.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                                                        <>
                                                            {/* Complete (Convert to Sale) */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleComplete(reservation.id)}
                                                                disabled={processingId === reservation.id}
                                                                className="p-2 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/20 transition-all disabled:opacity-50"
                                                                title="Converter em Venda"
                                                            >
                                                                {processingId === reservation.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Sparkles className="w-4 h-4" />
                                                                )}
                                                            </motion.button>

                                                            {/* Cancel */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleCancel(reservation.id)}
                                                                disabled={processingId === reservation.id}
                                                                className="p-2 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 transition-all disabled:opacity-50"
                                                                title="Cancelar Reserva"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </motion.button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Create Reservation Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateReservationModal
                        products={products}
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchData();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ================================================================
// CREATE RESERVATION MODAL
// ================================================================

interface CreateReservationModalProps {
    products: Product[];
    onClose: () => void;
    onSuccess: () => void;
}

function CreateReservationModal({ products, onClose, onSuccess }: CreateReservationModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        productId: '',
        quantity: '1',
        customerName: '',
        customerBI: '',
        customerPhone: '',
        depositAmount: '',
        notes: '',
        expiresInHours: '48',
    });

    const selectedProduct = products.find(p => p.id === form.productId);
    const totalValue = selectedProduct ? selectedProduct.price * parseInt(form.quantity || '0') : 0;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.productId) {
            newErrors.productId = 'Selecione um produto';
        }

        if (!form.customerName.trim() || form.customerName.length < 2) {
            newErrors.customerName = 'Nome do cliente é obrigatório';
        }

        const qty = parseInt(form.quantity);
        if (!qty || qty < 1) {
            newErrors.quantity = 'Quantidade deve ser pelo menos 1';
        }

        if (selectedProduct && qty > selectedProduct.quantity) {
            newErrors.quantity = `Stock insuficiente. Disponível: ${selectedProduct.quantity}`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: form.productId,
                    quantity: parseInt(form.quantity),
                    customerName: form.customerName.trim(),
                    customerBI: form.customerBI.trim() || undefined,
                    customerPhone: form.customerPhone.trim() || undefined,
                    depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : undefined,
                    notes: form.notes.trim() || undefined,
                    expiresInHours: parseInt(form.expiresInHours),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Erro ao criar reserva');
                return;
            }

            toast.success(`Reserva criada para ${data.reservation?.customerName}! Stock atualizado.`);
            onSuccess();
        } catch (error) {
            toast.error('Erro ao criar reserva');
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
                className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-cyan-500/20 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white italic">Nova Reserva</h2>
                            <p className="text-sm text-white/80">Stock será subtraído automaticamente</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Product */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Package className="w-4 h-4 inline mr-1" />
                            Produto *
                        </label>
                        <select
                            value={form.productId}
                            onChange={(e) => setForm({ ...form, productId: e.target.value })}
                            className={`w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border ${errors.productId ? 'border-red-500' : 'border-slate-200 dark:border-cyan-500/20'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                        >
                            <option value="">Selecione um produto</option>
                            {products.filter(p => p.quantity > 0).map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {product.price.toLocaleString('pt-MZ')} MT (Stock: {product.quantity})
                                </option>
                            ))}
                        </select>
                        {errors.productId && (
                            <p className="mt-1 text-xs text-red-500">{errors.productId}</p>
                        )}
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Quantidade *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={selectedProduct?.quantity || 999}
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                            className={`w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border ${errors.quantity ? 'border-red-500' : 'border-slate-200 dark:border-cyan-500/20'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                        />
                        {errors.quantity && (
                            <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                        )}
                    </div>

                    {/* Customer Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <User className="w-4 h-4 inline mr-1" />
                            Nome do Cliente *
                        </label>
                        <input
                            type="text"
                            value={form.customerName}
                            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                            placeholder="Ex: Manuel João"
                            className={`w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border ${errors.customerName ? 'border-red-500' : 'border-slate-200 dark:border-cyan-500/20'} rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                        />
                        {errors.customerName && (
                            <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
                        )}
                    </div>

                    {/* BI and Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <CreditCard className="w-4 h-4 inline mr-1" />
                                BI / Passaporte
                            </label>
                            <input
                                type="text"
                                value={form.customerBI}
                                onChange={(e) => setForm({ ...form, customerBI: e.target.value })}
                                placeholder="123456789A"
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Phone className="w-4 h-4 inline mr-1" />
                                Telefone
                            </label>
                            <input
                                type="tel"
                                value={form.customerPhone}
                                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                                placeholder="+258 84 XXX XXXX"
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                    </div>

                    {/* Deposit and Expiry */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Sinal (MT)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.depositAmount}
                                onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                                placeholder="0"
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Validade
                            </label>
                            <select
                                value={form.expiresInHours}
                                onChange={(e) => setForm({ ...form, expiresInHours: e.target.value })}
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            >
                                <option value="24">24 horas</option>
                                <option value="48">48 horas</option>
                                <option value="72">72 horas</option>
                                <option value="168">7 dias</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Observações
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Informações adicionais..."
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-cyan-500/20 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                        />
                    </div>

                    {/* Total Preview */}
                    {selectedProduct && (
                        <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Valor Total da Reserva:
                                </span>
                                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                                    {totalValue.toLocaleString('pt-MZ')} MT
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-cyan-500/20 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    A criar...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Criar Reserva
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
