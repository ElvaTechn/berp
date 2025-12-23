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
} from 'lucide-react';
import { toast } from 'sonner';

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
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) {
      return {
        label: 'ESGOTADO',
        color: 'bg-red-600/20 text-red-400 border-red-600/30',
        icon: AlertTriangle,
      };
    } else if (product.quantity <= product.min_stock) {
      return {
        label: 'BAIXO',
        color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'OK',
        color: 'bg-green-600/20 text-green-400 border-green-600/30',
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
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 mb-4">
          <AlertTriangle className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-lg font-bold text-white mb-2">
          Nenhum produto encontrado
        </p>
        <p className="text-sm text-slate-400">
          Adicione produtos para começar a gerenciar seu inventário
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Scroll horizontal suave em mobile */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-transparent">
        <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">
              Preço Venda
            </th>
            <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">
              Preço Custo
            </th>
            <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">
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
                    border-b border-white/5 hover:bg-white/5 transition-all duration-300
                    ${!product.is_active ? 'opacity-50' : ''}
                  `}
                >
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg"
                        style={{ background: product.category.color }}
                      >
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-xs text-slate-400 truncate">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {product.barcode && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                              <Barcode className="w-3 h-3" />
                              {product.barcode}
                            </span>
                          )}
                          {(expired || expiringSoon) && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                expired
                                  ? 'bg-red-600/20 text-red-400'
                                  : 'bg-yellow-600/20 text-yellow-400'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {expired ? 'Vencido' : 'A vencer'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: product.category.color + '40' }}
                    >
                      {product.category.name}
                    </span>
                  </td>

                  {/* Stock Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-black text-white">
                        {product.quantity}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border ${stockStatus.color}`}
                      >
                        <StockIcon className="w-3 h-3" />
                        {stockStatus.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Min: {product.min_stock}
                      </span>
                    </div>
                  </td>

                  {/* Sale Price */}
                  <td className="px-6 py-4 text-right">
                    <p className="text-lg font-black text-white">
                      {product.price.toLocaleString('pt-MZ', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-slate-500">MT</p>
                  </td>

                  {/* Cost Price */}
                  <td className="px-6 py-4 text-right">
                    {product.cost_price ? (
                      <>
                        <p className="text-lg font-black text-slate-400">
                          {product.cost_price.toLocaleString('pt-MZ', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-slate-500">MT</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-600">-</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {product.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-600/20 text-green-400 border border-green-600/30">
                          <CheckCircle className="w-3 h-3" />
                          ATIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-600/20 text-slate-400 border border-slate-600/30">
                          <EyeOff className="w-3 h-3" />
                          INATIVO
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(product)}
                        className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>

                      {/* Toggle Active */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleToggleActive(product.id, product.is_active)
                        }
                        disabled={togglingId === product.id}
                        className={`p-2 rounded-xl transition-all ${
                          product.is_active
                            ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        }`}
                        title={
                          product.is_active ? 'Desativar' : 'Ativar'
                        }
                      >
                        {product.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </motion.button>

                      {/* Delete */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="p-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                        title="Deletar Permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
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
