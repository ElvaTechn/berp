"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Barcode,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { NeuBadge } from '@/components/ui/neu-badge';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard } from '@/components/ui/neu-card';

interface Product {
  id: string;
  name: string;
  description: string | null;
  barcode: string | null;
  sku: string | null;
  price: number;
  cost_price: number | null;
  quantity: number;
  min_stock: number;
  max_stock: number | null;
  is_active: boolean;
  expiry_date: Date | null;
  category_id: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  created_at: Date;
  updated_at: Date;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: () => void;
  isMobile?: boolean;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  isMobile = false,
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const getStockStatus = (product: Product): { label: string; status: 'error' | 'warning' | 'success'; icon: any } => {
    if (product.quantity === 0) {
      return {
        label: 'ESGOTADO',
        status: 'error',
        icon: AlertTriangle,
      };
    } else if (product.quantity <= product.min_stock) {
      return {
        label: 'BAIXO',
        status: 'warning',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'OK',
        status: 'success',
        icon: CheckCircle,
      };
    }
  };

  const handleToggleActive = async (productId: string, currentState: boolean) => {
    setTogglingId(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentState }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar produto');

      toast.success(
        !currentState ? 'Produto ativado!' : 'Produto desativado!'
      );
      onDelete(); // Refresh list
    } catch (error) {
      toast.error('Erro ao atualizar produto');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar permanentemente "${productName}"?\n\nEsta ação NÃO pode ser desfeita!`
      )
    ) {
      return;
    }

    setDeletingId(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar produto');

      toast.success('Produto deletado permanentemente!');
      onDelete(); // Refresh list
    } catch (error) {
      toast.error('Erro ao deletar produto');
    } finally {
      setDeletingId(null);
    }
  };

  const isExpiringSoon = (expiryDate: Date | null) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate: Date | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (products.length === 0) {
    return (
      <NeuCard variant="convex" size="lg">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl neu-surface neu-convex-md flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-[var(--neu-text-muted)]" />
          </div>
          <h3 className="neu-text-h3 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="neu-text-body text-[var(--neu-text-muted)]">
            Adicione produtos para começar a gerenciar seu inventário
          </p>
        </div>
      </NeuCard>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl neu-surface neu-concave-md">
      {/* Scroll horizontal suave em mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-[var(--neu-border-light)] bg-[var(--neu-base-light)]">
            <th className="px-6 py-4 text-left neu-text-label font-semibold">
              Produto
            </th>
            <th className="px-6 py-4 text-left neu-text-label font-semibold">
              Categoria
            </th>
            <th className="px-6 py-4 text-center neu-text-label font-semibold">
              Stock
            </th>
            <th className="px-6 py-4 text-right neu-text-label font-semibold">
              Preço Venda
            </th>
            <th className="px-6 py-4 text-right neu-text-label font-semibold">
              Preço Custo
            </th>
            <th className="px-6 py-4 text-center neu-text-label font-semibold">
              Estado
            </th>
            <th className="px-6 py-4 text-right neu-text-label font-semibold">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {products.map((product, index) => {
              const stockStatus = getStockStatus(product);
              const StockIcon = stockStatus.icon;
              const expired = isExpired(product.expiry_date);
              const expiringSoon = isExpiringSoon(product.expiry_date);

              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    border-b border-[var(--neu-border-light)] 
                    hover:bg-[var(--neu-surface-hover)] 
                    transition-all duration-200
                    ${!product.is_active ? 'opacity-50' : ''}
                  `}
                >
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg neu-convex-sm"
                        style={{ backgroundColor: product.category.color }}
                      >
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="neu-text-body font-semibold truncate text-[var(--neu-text-primary)]">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="neu-text-caption truncate">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {product.barcode && (
                            <span className="inline-flex items-center gap-1 neu-text-label text-[var(--neu-text-muted)]">
                              <Barcode className="w-3 h-3" />
                              {product.barcode}
                            </span>
                          )}
                          {(expired || expiringSoon) && (
                            <NeuBadge 
                              status={expired ? 'error' : 'warning'}
                              variant="flat"
                            >
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {expired ? 'Vencido' : 'A vencer'}
                            </NeuBadge>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <NeuBadge variant="convex" status="info">
                      <span style={{ color: product.category.color }}>
                        {product.category.name}
                      </span>
                    </NeuBadge>
                  </td>

                  {/* Stock Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-bold text-[var(--neu-text-primary)]">
                        {product.quantity}
                      </span>
                      <NeuBadge status={stockStatus.status} variant="flat">
                        <StockIcon className="w-3 h-3 inline mr-1" />
                        {stockStatus.label}
                      </NeuBadge>
                      <span className="neu-text-label text-[var(--neu-text-muted)]">
                        Min: {product.min_stock}
                      </span>
                    </div>
                  </td>

                  {/* Sale Price */}
                  <td className="px-6 py-4 text-right">
                    <p className="neu-text-h3 font-bold text-[var(--neu-text-primary)]">
                      {product.price.toLocaleString('pt-MZ', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="neu-text-caption">MT</p>
                  </td>

                  {/* Cost Price */}
                  <td className="px-6 py-4 text-right">
                    {product.cost_price ? (
                      <>
                        <p className="neu-text-h3 font-bold text-[var(--neu-text-secondary)]">
                          {product.cost_price.toLocaleString('pt-MZ', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="neu-text-caption">MT</p>
                      </>
                    ) : (
                      <p className="neu-text-body text-[var(--neu-text-muted)]">-</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {product.is_active ? (
                        <NeuBadge status="success" variant="flat">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          ATIVO
                        </NeuBadge>
                      ) : (
                        <NeuBadge status="default" variant="flat">
                          <EyeOff className="w-3 h-3 inline mr-1" />
                          INATIVO
                        </NeuBadge>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit */}
                      <NeuButton
                        variant="convex"
                        size="icon"
                        onClick={() => onEdit(product)}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </NeuButton>

                      {/* Toggle Active */}
                      <NeuButton
                        variant="convex"
                        size="icon"
                        onClick={() =>
                          handleToggleActive(product.id, product.is_active)
                        }
                        disabled={togglingId === product.id}
                        title={product.is_active ? 'Desativar' : 'Ativar'}
                      >
                        {product.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </NeuButton>

                      {/* Delete */}
                      <NeuButton
                        variant="convex"
                        size="icon"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        title="Deletar Permanentemente"
                      >
                        <Trash2 className="w-4 h-4 text-[var(--neu-error)]" />
                      </NeuButton>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
      </div>
    </div>
  );
}
