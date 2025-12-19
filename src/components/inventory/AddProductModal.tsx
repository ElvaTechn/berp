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

interface AddProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ onClose, onSuccess }: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    price: '',
    cost_price: '',
    quantity: '0',
    min_stock: '10',
    max_stock: '',
    category_id: '',
    expiry_date: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Erro ao carregar categorias');
      
      const data = await response.json();
      setCategories(data.categories || []);
      
      // Seleciona primeira categoria automaticamente
      if (data.categories && data.categories.length > 0) {
        setForm(prev => ({ ...prev, category_id: data.categories[0].id }));
      }
    } catch (error) {
      toast.error('Erro ao carregar categorias');
      console.error(error);
    } finally {
      setLoadingCategories(false);
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
    // Remove tudo exceto números e ponto decimal
    const numbers = value.replace(/[^\d.]/g, '');
    
    // Garante apenas um ponto decimal
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

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!form.category_id) {
      newErrors.category_id = 'Categoria é obrigatória';
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      newErrors.price = 'Preço de venda deve ser maior que zero';
    }

    if (form.cost_price && parseFloat(form.cost_price) < 0) {
      newErrors.cost_price = 'Preço de custo não pode ser negativo';
    }

    if (parseInt(form.quantity) < 0) {
      newErrors.quantity = 'Quantidade não pode ser negativa';
    }

    if (!form.min_stock || parseInt(form.min_stock) <= 0) {
      newErrors.min_stock = 'Stock mínimo deve ser maior que zero';
    }

    // Aviso se custo > venda
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
      const response = await fetch('/api/products', {
        method: 'POST',
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
        throw new Error(data.error || 'Erro ao criar produto');
      }

      const data = await response.json();
      toast.success(`✅ Produto "${data.product.name}" guardado no ecossistema!`, {
        description: `Stock inicial: ${data.product.quantity} unidades`,
      });
      onSuccess();
    } catch (error: any) {
      toast.error(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#050505] border-l border-white/10 z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 backdrop-blur-xl" />

        <div className="relative z-10 p-8 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50"
              >
                <Package className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-4xl font-black text-white italic tracking-tight">
                  Novo <span className="text-purple-500">Produto</span>
                </h2>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  Adicione um item ao inventário
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-300 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-purple-400" />
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="Ex: Arroz Tio Lucas 5kg"
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
                <Tag className="w-4 h-4 text-purple-400" />
                Categoria *
              </label>
              <div className="flex gap-2">
                <select
                  required
                  disabled={loadingCategories}
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="flex-1 h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                >
                  <option value="">Selecionar categoria</option>
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
                      : 'bg-purple-600/20 border-purple-600/30 text-purple-400 hover:bg-purple-600/30'
                  }`}
                >
                  <Plus className={`w-6 h-6 transition-transform ${showNewCategory ? 'rotate-45' : ''}`} />
                </motion.button>
              </div>
              {errors.category_id && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.category_id}
                </p>
              )}
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
                    <p className="text-sm font-bold text-green-400">Nova Categoria</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                        className="flex-1 h-12 px-4 bg-green-600/10 border border-green-600/30 rounded-xl text-white placeholder:text-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        placeholder="Nome da categoria..."
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                        className="h-12 px-6 bg-green-600 rounded-xl text-white font-bold hover:bg-green-700 disabled:opacity-50 transition-all"
                      >
                        {creatingCategory ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Criar'
                        )}
                      </motion.button>
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            {/* Códigos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  Código de Barras
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="7891234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  SKU
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="PROD-001"
                  />
                </div>
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
                    className="w-full h-14 pl-14 pr-4 bg-green-600/10 border border-green-600/30 rounded-2xl text-white text-lg font-bold placeholder:text-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    placeholder="450.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.price}
                  </p>
                )}
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
                    className="w-full h-14 pl-14 pr-4 bg-yellow-600/10 border border-yellow-600/30 rounded-2xl text-white text-lg font-bold placeholder:text-yellow-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all"
                    placeholder="380.00"
                  />
                </div>
                {errors.cost_price && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.cost_price}
                  </p>
                )}
              </div>
            </div>

            {/* Aviso de Lucro */}
            {errors.warning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-yellow-600/10 border border-yellow-600/30 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-yellow-400">Atenção</p>
                  <p className="text-xs text-yellow-300/80">{errors.warning}</p>
                </div>
              </motion.div>
            )}

            {/* Stocks */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  Qtd Inicial *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="0"
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
                  placeholder="10"
                />
                {errors.min_stock && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.min_stock}
                  </p>
                )}
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
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="200"
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
                className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
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
                className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg disabled:opacity-50 hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  '✨ Guardar no Ecossistema'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
