"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuSelect, NeuSelectContent, NeuSelectItem, NeuSelectTrigger, NeuSelectValue } from '@/components/ui/neu-select';
import { useViewport } from '@/hooks/useViewport';
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
    Ban,
    TrendingUp,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

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
    const { isMobile } = useViewport();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

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
        if (reason === null) return;

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

        if (diff <= 0) return { text: 'Expirado', color: 'text-[var(--neu-error)]', urgent: true };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 6) return { text: `${hours}h ${minutes}m`, color: 'text-[var(--neu-warning)]', urgent: true };
        if (hours < 24) return { text: `${hours}h ${minutes}m`, color: 'text-[var(--neu-accent)]', urgent: false };

        const days = Math.floor(hours / 24);
        return { text: `${days}d ${hours % 24}h`, color: 'text-[var(--neu-success)]', urgent: false };
    };

    // Status badge
    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; icon: React.ElementType; label: string }> = {
            PENDING: { color: 'text-[var(--neu-warning)]', icon: Clock, label: 'Pendente' },
            CONFIRMED: { color: 'text-[var(--neu-accent)]', icon: CheckCircle, label: 'Confirmada' },
            COMPLETED: { color: 'text-[var(--neu-success)]', icon: ShoppingCart, label: 'Concluída' },
            CANCELLED: { color: 'text-[var(--neu-error)]', icon: XCircle, label: 'Cancelada' },
            EXPIRED: { color: 'text-[var(--neu-text-muted)]', icon: Ban, label: 'Expirada' },
        };

        const badge = badges[status] || badges.PENDING;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    // Create reservation
    const handleCreateReservation = async (formData: any) => {
        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: formData.product_id,
                    customerName: formData.customer_name,
                    customerBI: formData.customer_bi,
                    customerPhone: formData.customer_phone,
                    quantity: formData.quantity,
                    depositAmount: formData.deposit_amount,
                    notes: formData.notes,
                    expiresInHours: formData.expires_in_hours,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Reserva criada com sucesso!');
                setShowCreateModal(false);
                fetchData();
            } else {
                toast.error(data.error || 'Erro ao criar reserva');
            }
        } catch (error) {
            toast.error('Erro ao criar reserva');
        }
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
                    <h1 className="neu-text-h1 flex items-center gap-3">
                        <Calendar className="w-10 h-10 text-[var(--neu-accent)]" />
                        Reservas
                    </h1>
                    <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
                        Gerir reservas de produtos e conversão em vendas
                    </p>
                </div>

                <NeuButton 
                    variant="accent" 
                    size="md"
                    onClick={() => setShowCreateModal(true)}
                    className={isMobile ? "w-full" : ""}
                >
                    <Plus className="w-5 h-5" />
                    <span>Nova Reserva</span>
                </NeuButton>
            </motion.div>

            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Pendentes */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <Clock className="w-5 h-5 text-[var(--neu-warning)]" />
                            </div>
                            <p className="neu-text-label text-[var(--neu-text-muted)]">Ativas</p>
                        </div>
                        <p className="neu-text-h2">{stats?.pending || 0}</p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">Reservas pendentes</p>
                    </NeuCardContent>
                </NeuCard>

                {/* A Expirar */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-[var(--neu-error)]" />
                            </div>
                            <motion.p
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="neu-text-label text-[var(--neu-error)]"
                            >
                                Urgente
                            </motion.p>
                        </div>
                        <p className="neu-text-h2 text-[var(--neu-error)]">{stats?.expiringSoon || 0}</p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">Expiram em 24h</p>
                    </NeuCardContent>
                </NeuCard>

                {/* Concluídas Hoje */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-[var(--neu-success)]" />
                            </div>
                            <p className="neu-text-label text-[var(--neu-text-muted)]">Hoje</p>
                        </div>
                        <p className="neu-text-h2 text-[var(--neu-success)]">{stats?.completedToday || 0}</p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">Convertidas em venda</p>
                    </NeuCardContent>
                </NeuCard>

                {/* Valor Total Reservado */}
                <NeuCard variant="convex" size="sm">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-[var(--neu-accent)]" />
                            </div>
                            <p className="neu-text-label text-[var(--neu-text-muted)]">Valor</p>
                        </div>
                        <p className="neu-text-h2">
                            {(stats?.totalReservedValue || 0).toLocaleString('pt-MZ', { maximumFractionDigits: 0 })}
                        </p>
                        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">MT em reservas</p>
                    </NeuCardContent>
                </NeuCard>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-3"
            >
                <NeuInput
                    type="text"
                    placeholder="Pesquisar por nome, BI, telefone ou produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-5 h-5" />}
                />

                <div className="flex gap-3">
                    <NeuSelect value={statusFilter} onValueChange={setStatusFilter}>
                        <NeuSelectTrigger variant="concave" size="md" className="flex-1">
                            <NeuSelectValue placeholder="Todos os status" />
                        </NeuSelectTrigger>
                        <NeuSelectContent>
                            <NeuSelectItem value="all">Todos os status</NeuSelectItem>
                            <NeuSelectItem value="PENDING">Pendentes</NeuSelectItem>
                            <NeuSelectItem value="CONFIRMED">Confirmadas</NeuSelectItem>
                            <NeuSelectItem value="COMPLETED">Concluídas</NeuSelectItem>
                            <NeuSelectItem value="CANCELLED">Canceladas</NeuSelectItem>
                            <NeuSelectItem value="EXPIRED">Expiradas</NeuSelectItem>
                        </NeuSelectContent>
                    </NeuSelect>

                    <NeuButton variant="convex" size="icon" onClick={fetchData} title="Atualizar">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </NeuButton>
                </div>
            </motion.div>

            {/* Reservations Table */}
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
                        ) : filteredReservations.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="w-20 h-20 rounded-full neu-surface neu-convex-lg flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-10 h-10 text-[var(--neu-accent)]" />
                                </div>
                                <h3 className="neu-text-h2 mb-2">Nenhuma reserva encontrada</h3>
                                <p className="neu-text-body text-[var(--neu-text-muted)]">
                                    Crie a primeira reserva clicando no botão acima
                                </p>
                            </div>
                        ) : isMobile ? (
                            /* Mobile Card View */
                            <div className="space-y-4 p-4">
                                {filteredReservations.map((reservation, index) => {
                                    const timeRemaining = getTimeRemaining(reservation.expires_at);
                                    const total = (reservation.product?.price || 0) * reservation.quantity;

                                    return (
                                        <motion.div
                                            key={reservation.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <NeuCard variant="convex" size="sm">
                                                <NeuCardContent className="p-4 space-y-3">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="neu-text-body font-bold">{reservation.customer_name}</p>
                                                            <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                                                {reservation.customer_phone || reservation.customer_bi || '-'}
                                                            </p>
                                                        </div>
                                                        {getStatusBadge(reservation.status)}
                                                    </div>

                                                    {/* Product */}
                                                    <div className="space-y-1">
                                                        <p className="neu-text-caption text-[var(--neu-text-muted)]">Produto</p>
                                                        <p className="neu-text-body font-medium">{reservation.product?.name || '-'}</p>
                                                    </div>

                                                    {/* Info Grid */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="neu-text-caption text-[var(--neu-text-muted)]">Quantidade</p>
                                                            <p className="neu-text-body">{reservation.quantity}</p>
                                                        </div>
                                                        <div>
                                                            <p className="neu-text-caption text-[var(--neu-text-muted)]">Total</p>
                                                            <p className="neu-text-body font-bold text-[var(--neu-accent)]">
                                                                {total.toLocaleString('pt-MZ')} MT
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Expiration */}
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-[var(--neu-text-muted)]" />
                                                        <span className={`neu-text-caption font-bold ${timeRemaining.color}`}>
                                                            {timeRemaining.text}
                                                        </span>
                                                    </div>

                                                    {/* Actions */}
                                                    {reservation.status === 'PENDING' && (
                                                        <div className="flex gap-2 pt-2">
                                                            <NeuButton
                                                                variant="accent"
                                                                size="sm"
                                                                onClick={() => handleComplete(reservation.id)}
                                                                disabled={processingId === reservation.id}
                                                                className="flex-1"
                                                            >
                                                                {processingId === reservation.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="w-4 h-4" />
                                                                )}
                                                                <span>Completar</span>
                                                            </NeuButton>
                                                            <NeuButton
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCancel(reservation.id)}
                                                                disabled={processingId === reservation.id}
                                                                className="flex-1"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                <span>Cancelar</span>
                                                            </NeuButton>
                                                        </div>
                                                    )}
                                                </NeuCardContent>
                                            </NeuCard>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Desktop Table View */
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[var(--neu-base)] border-b border-[var(--neu-border)]">
                                        <tr>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Cliente</th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Produto</th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Qtd</th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Total</th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Expira</th>
                                            <th className="px-6 py-4 text-left neu-text-label text-[var(--neu-text-muted)]">Status</th>
                                            <th className="px-6 py-4 text-right neu-text-label text-[var(--neu-text-muted)]">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReservations.map((reservation, index) => {
                                            const timeRemaining = getTimeRemaining(reservation.expires_at);
                                            const total = (reservation.product?.price || 0) * reservation.quantity;

                                            return (
                                                <motion.tr
                                                    key={reservation.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)] transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <p className="neu-text-body font-medium">{reservation.customer_name}</p>
                                                        <p className="neu-text-caption text-[var(--neu-text-muted)]">
                                                            {reservation.customer_phone || reservation.customer_bi || '-'}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="neu-text-body">{reservation.product?.name || '-'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="neu-text-body">{reservation.quantity}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="neu-text-body font-bold">
                                                            {total.toLocaleString('pt-MZ')} MT
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className={`neu-text-caption font-bold ${timeRemaining.color}`}>
                                                            {timeRemaining.text}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">{getStatusBadge(reservation.status)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {reservation.status === 'PENDING' && (
                                                                <>
                                                                    <NeuButton
                                                                        variant="accent"
                                                                        onClick={() => handleComplete(reservation.id)}
                                                                        disabled={processingId === reservation.id}
                                                                    >
                                                                        {processingId === reservation.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        )}
                                                                        <span>Completar</span>
                                                                    </NeuButton>
                                                                    <NeuButton
                                                                        variant="ghost"
                                                                        onClick={() => handleCancel(reservation.id)}
                                                                        disabled={processingId === reservation.id}
                                                                    >
                                                                        <XCircle className="w-4 h-4 text-[var(--neu-error)]" />
                                                                        <span>Cancelar</span>
                                                                    </NeuButton>
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
                    </NeuCardContent>
                </NeuCard>
            </motion.div>

            {/* Create Reservation Modal */}
            {showCreateModal && (
                <CreateReservationModal
                    products={products}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateReservation}
                />
            )}
        </div>
      </MaxWidthContainer>
    );
}

// Create Reservation Modal Component
function CreateReservationModal({ products, onClose, onSubmit }: {
    products: Product[];
    onClose: () => void;
    onSubmit: (data: any) => void;
}) {
    const [form, setForm] = useState({
        customer_name: '',
        customer_bi: '',
        customer_phone: '',
        product_id: '',
        quantity: '1',
        deposit_amount: '',
        notes: '',
        expires_in_hours: '48',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedProduct = products.find(p => p.id === form.product_id);
    const total = selectedProduct ? selectedProduct.price * parseInt(form.quantity || '0') : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.product_id) {
            toast.error('Selecione um produto');
            return;
        }

        setIsSubmitting(true);
        await onSubmit({
            customer_name: form.customer_name,
            customer_bi: form.customer_bi || null,
            customer_phone: form.customer_phone || null,
            product_id: form.product_id,
            quantity: parseInt(form.quantity),
            deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
            notes: form.notes || null,
            expires_in_hours: parseInt(form.expires_in_hours),
        });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg my-8"
            >
                <NeuCard variant="convex" size="md">
                    <NeuCardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="neu-text-h3 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[var(--neu-accent)]" />
                                Nova Reserva
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-[var(--neu-surface)] transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <NeuInput
                                label="Nome do Cliente *"
                                type="text"
                                required
                                value={form.customer_name}
                                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                placeholder="João Silva"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <NeuInput
                                    label="BI"
                                    type="text"
                                    value={form.customer_bi}
                                    onChange={(e) => setForm({ ...form, customer_bi: e.target.value })}
                                    placeholder="12345678A"
                                />
                                <NeuInput
                                    label="Telefone"
                                    type="tel"
                                    value={form.customer_phone}
                                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                    placeholder="84 123 4567"
                                />
                            </div>

                            <div>
                                <label className="neu-text-label mb-1.5 block text-xs">Produto *</label>
                                <NeuSelect
                                    value={form.product_id}
                                    onValueChange={(value) => setForm({ ...form, product_id: value })}
                                >
                                    <NeuSelectTrigger variant="concave" size="sm">
                                        <NeuSelectValue placeholder="Selecionar..." />
                                    </NeuSelectTrigger>
                                    <NeuSelectContent>
                                        {products.map((product) => (
                                            <NeuSelectItem key={product.id} value={product.id}>
                                                {product.name} ({product.price.toLocaleString('pt-MZ')} MT)
                                            </NeuSelectItem>
                                        ))}
                                    </NeuSelectContent>
                                </NeuSelect>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <NeuInput
                                    label="Quantidade *"
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedProduct?.quantity || 999}
                                    value={form.quantity}
                                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                />
                                <NeuInput
                                    label="Adiantamento"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.deposit_amount}
                                    onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="neu-text-label mb-1.5 block text-xs">Expira em</label>
                                <NeuSelect
                                    value={form.expires_in_hours}
                                    onValueChange={(value) => setForm({ ...form, expires_in_hours: value })}
                                >
                                    <NeuSelectTrigger variant="concave" size="sm">
                                        <NeuSelectValue />
                                    </NeuSelectTrigger>
                                    <NeuSelectContent>
                                        <NeuSelectItem value="24">1 dia</NeuSelectItem>
                                        <NeuSelectItem value="48">2 dias</NeuSelectItem>
                                        <NeuSelectItem value="72">3 dias</NeuSelectItem>
                                        <NeuSelectItem value="168">1 semana</NeuSelectItem>
                                    </NeuSelectContent>
                                </NeuSelect>
                            </div>

                            {total > 0 && (
                                <div className="neu-surface neu-concave-sm rounded-lg p-3">
                                    <p className="neu-text-caption text-[var(--neu-text-muted)] text-xs">Total</p>
                                    <p className="neu-text-h3 text-[var(--neu-accent)]">
                                        {total.toLocaleString('pt-MZ')} MT
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <NeuButton
                                    type="button"
                                    variant="convex"
                                    size="sm"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Cancelar
                                </NeuButton>
                                <NeuButton
                                    type="submit"
                                    variant="accent"
                                    size="sm"
                                    disabled={isSubmitting || !form.product_id}
                                    loading={isSubmitting}
                                    className="flex-1"
                                >
                                    Criar
                                </NeuButton>
                            </div>
                        </form>
                    </NeuCardContent>
                </NeuCard>
            </motion.div>
        </div>
    );
}
