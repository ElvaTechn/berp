"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  Loader2,
  Plus,
  Tag,
  DollarSign,
  Hash,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  color: string;
}

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
  category_id: string;
  expiry_date: Date | null;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({ product, onClose, onSuccess }: EditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  const [form, setForm] = useState({
    name: product.name,
    description: product.description || '',
    barcode: product.barcode || '',
    sku: product.sku || '',
    price: product.price.toString(),
    cost_price: product.cost_price?.toString() || '',
    quantity: product.quantity.toString(),
    min_stock: product.min_stock.toString(),
    max_stock: product.max_stock?.toString() || '',
    category_id: product.category.id,
    expiry_date: product.expiry_date ? new Date(product.expiry_date).toISOString().split('T')[0] : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar categoria');
      }

      const data = await response.json();
      setCategories([...categories, data.category]);
      setForm({ ...form, category_id: data.category.id });
      setNewCategoryName('');
      setShowNewCategory(false);
      toast.success(`✅ Categoria "${data.category.name}" criada!`);
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setCreatingCategory(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/[^\d.]/g, '');
    const parts = numbers.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return numbers;
  };

  const handlePriceChange = (field: 'price' | 'cost_price', value: string) => {
    const formatted = formatCurrency(value);
    setForm({ ...form, [field]: formatted });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.category_id) newErrors.category_id = 'Categoria é obrigatória';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Preço de venda deve ser maior que zero';
    if (form.cost_price && parseFloat(form.cost_price) < 0) newErrors.cost_price = 'Preço de custo não pode ser negativo';
    if (parseInt(form.quantity) < 0) newErrors.quantity = 'Quantidade não pode ser negativa';
    if (!form.min_stock || parseInt(form.min_stock) <= 0) newErrors.min_stock = 'Stock mínimo deve ser maior que zero';

    if (form.cost_price && form.price) {
      const cost = parseFloat(form.cost_price);
      const price = parseFloat(form.price);
      if (cost > price) {
        newErrors.warning = 'Preço de custo maior que preço de venda!';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).filter(k => k !== 'warning').length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          barcode: form.barcode.trim() || null,
          sku: form.sku.trim() || null,
          price: parseFloat(form.price),
          cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
          quantity: parseInt(form.quantity),
          min_stock: parseInt(form.min_stock),
          max_stock: form.max_stock ? parseInt(form.max_stock) : null,
          category_id: form.category_id,
          expiry_date: form.expiry_date || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar produto');
      }

      const data = await response.json();
      toast.success(`✅ Produto "${data.product.name}" atualizado no ecossistema!`);
      onSuccess();
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#050505] border-l border-white/10 z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 backdrop-blur-xl" />

        <div className="relative z-10 p-8 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-blue-500/50"
              >
                <Package className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-4xl font-black text-white italic tracking-tight">
                  Editar <span className="text-blue-500">Produto</span>
                </h2>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  Atualizar informações do produto
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <X className="w-6 h-6 text-slate-400" />
            </motion.button>
          </div>

          {/* Form - mesma estrutura do Add, mas valores pré-preenchidos */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-300 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-blue-400" />
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              {errors.name && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-300 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-blue-400" />
                Categoria *
              </label>
              <div className="flex gap-2">
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex-1 h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all ${
                    showNewCategory
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-blue-600/20 border-blue-600/30 text-blue-400 hover:bg-blue-600/30'
                  }`}
                >
                  <Plus className={`w-6 h-6 transition-transform ${showNewCategory ? 'rotate-45' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Nova Categoria */}
            <AnimatePresence>
              {showNewCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-green-600/10 border border-green-600/30 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 h-12 px-4 bg-green-600/10 border border-green-600/30 rounded-xl text-white placeholder:text-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        placeholder="Nome da categoria..."
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory}
                        className="h-12 px-6 bg-green-600 rounded-xl text-white font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        {creatingCategory ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
              />
            </div>

            {/* Códigos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  SKU
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-300 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Preço Venda (MT) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-black text-lg">
                    MT
                  </span>
                  <input
                    type="text"
                    required
                    value={form.price}
                    onChange={(e) => handlePriceChange('price', e.target.value)}
                    className="w-full h-14 pl-14 pr-4 bg-green-600/10 border border-green-600/30 rounded-2xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-300 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  Preço Custo (MT)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 font-black text-lg">
                    MT
                  </span>
                  <input
                    type="text"
                    value={form.cost_price}
                    onChange={(e) => handlePriceChange('cost_price', e.target.value)}
                    className="w-full h-14 pl-14 pr-4 bg-yellow-600/10 border border-yellow-600/30 rounded-2xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Stocks */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  Quantidade *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  Min *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.min_stock}
                  onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                  className="w-full h-14 px-4 bg-red-600/10 border border-red-600/30 rounded-2xl text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  Max
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.max_stock}
                  onChange={(e) => setForm({ ...form, max_stock: e.target.value })}
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Data Validade */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-300 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-blue-400" />
                Data de Validade
              </label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 h-16 rounded-2xl border-2 border-white/10 text-white font-black text-lg hover:bg-white/5 transition-all"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-lg disabled:opacity-50 hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                ) : (
                  '✨ Atualizar Produto'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
