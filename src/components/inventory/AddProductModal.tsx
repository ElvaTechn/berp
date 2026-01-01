"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
import { NeuInput } from '@/components/ui/neu-input';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard } from '@/components/ui/neu-card';
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription, NeuDialogFooter } from '@/components/ui/neu-dialog';
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from '@/components/ui/neu-select';
import { NeuTextarea } from '@/components/ui/neu-textarea';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddProductModal({ open, onOpenChange, onSuccess }: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };
  
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao conectar ao servidor' }));

        if (errorData.requiresSetup) {
          toast.info('É necessário configurar sua empresa primeiro.');
          return;
        }

        throw new Error(errorData.error || 'Erro ao carregar categorias');
      }

      const data = await response.json();
      setCategories(data.categories || []);

      if (data.categories && data.categories.length > 0) {
        setForm(prev => ({ ...prev, category_id: data.categories[0].id }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar categorias';
      toast.error(errorMessage);
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
      toast.success(`Categoria "${data.category.name}" criada!`);
    } catch (error: any) {
      toast.error(error.message);
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
      toast.success(`Produto "${data.product.name}" adicionado!`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeuDialog open={open} onOpenChange={onOpenChange}>
      <NeuDialogContent size="lg">
        <NeuDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
              <Package className="w-6 h-6 text-[var(--neu-accent)]" />
            </div>
            <div>
              <NeuDialogTitle>Novo Produto</NeuDialogTitle>
              <NeuDialogDescription>Adicione um item ao inventário</NeuDialogDescription>
            </div>
          </div>
        </NeuDialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <NeuInput
                label="Nome do Produto *"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                icon={<Tag className="w-5 h-5" />}
                error={errors.name}
              />

              {/* Categoria */}
              <div>
                <label className="neu-text-label mb-1.5 block">Categoria *</label>
                <div className="flex gap-2">
                  <NeuSelect
                    value={form.category_id}
                    onValueChange={(value) => setForm({ ...form, category_id: value })}
                    disabled={loadingCategories}
                  >
                    <NeuSelectTrigger variant="concave" size="md" className="flex-1">
                      <NeuSelectValue placeholder="Selecionar categoria..." />
                    </NeuSelectTrigger>
                    <NeuSelectContent>
                      {categories.map((cat) => (
                        <NeuSelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </NeuSelectItem>
                      ))}
                    </NeuSelectContent>
                  </NeuSelect>
                  <NeuButton
                    type="button"
                    variant={showNewCategory ? "accent" : "convex"}
                    size="icon"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                  >
                    <Plus className={`w-5 h-5 transition-transform ${showNewCategory ? 'rotate-45' : ''}`} />
                  </NeuButton>
                </div>
                {errors.category_id && (
                  <p className="neu-text-caption text-[var(--neu-error)] mt-1 flex items-center gap-1">
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
                    <NeuCard variant="concave" size="sm" className="bg-[var(--neu-success-light)]">
                      <p className="neu-text-body font-semibold text-[var(--neu-success)] mb-2">Nova Categoria</p>
                      <div className="flex gap-2">
                        <NeuInput
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                          placeholder="Nome da categoria..."
                          className="flex-1"
                        />
                        <NeuButton
                          type="button"
                          variant="accent"
                          onClick={handleCreateCategory}
                          disabled={creatingCategory || !newCategoryName.trim()}
                          loading={creatingCategory}
                        >
                          Criar
                        </NeuButton>
                      </div>
                    </NeuCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Descrição */}
              <NeuTextarea
                label="Descrição"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição detalhada..."
                rows={3}
              />

              {/* Códigos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NeuInput
                  label="Código de Barras"
                  type="text"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="7891234567890"
                  icon={<Hash className="w-5 h-5" />}
                />
                <NeuInput
                  label="SKU"
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="PROD-001"
                  icon={<Hash className="w-5 h-5" />}
                />
              </div>

              {/* Preços */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="neu-text-label mb-1.5 block flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-[var(--neu-success)]" />
                    Preço Venda (MT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 neu-text-body font-bold text-[var(--neu-success)]">
                      MT
                    </span>
                    <input
                      type="text"
                      required
                      value={form.price}
                      onChange={(e) => handlePriceChange('price', e.target.value)}
                      className="w-full pl-14 pr-4 py-3 rounded-xl neu-surface neu-concave-sm neu-text-body font-bold placeholder:text-[var(--neu-text-muted)] focus:outline-none focus:neu-concave-md focus:ring-2 focus:ring-[var(--neu-success)] transition-all"
                      placeholder="450.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="neu-text-caption text-[var(--neu-error)] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="neu-text-label mb-1.5 block flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-[var(--neu-warning)]" />
                    Preço Custo (MT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 neu-text-body font-bold text-[var(--neu-warning)]">
                      MT
                    </span>
                    <input
                      type="text"
                      value={form.cost_price}
                      onChange={(e) => handlePriceChange('cost_price', e.target.value)}
                      className="w-full pl-14 pr-4 py-3 rounded-xl neu-surface neu-concave-sm neu-text-body font-bold placeholder:text-[var(--neu-text-muted)] focus:outline-none focus:neu-concave-md focus:ring-2 focus:ring-[var(--neu-warning)] transition-all"
                      placeholder="380.00"
                    />
                  </div>
                </div>
              </div>

              {/* Aviso */}
              {errors.warning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <NeuCard variant="flat" size="sm" className="bg-[var(--neu-warning-light)]">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-[var(--neu-warning)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="neu-text-body font-semibold text-[var(--neu-warning)]">Atenção</p>
                        <p className="neu-text-caption text-[var(--neu-warning)]">{errors.warning}</p>
                      </div>
                    </div>
                  </NeuCard>
                </motion.div>
              )}

              {/* Stocks */}
              <div className="grid grid-cols-3 gap-3">
                <NeuInput
                  label="Qtd Inicial *"
                  type="number"
                  required
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0"
                  className="text-center"
                />
                <NeuInput
                  label="Min *"
                  type="number"
                  required
                  min="1"
                  value={form.min_stock}
                  onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                  placeholder="10"
                  className="text-center"
                  error={errors.min_stock}
                />
                <NeuInput
                  label="Max"
                  type="number"
                  min="1"
                  value={form.max_stock}
                  onChange={(e) => setForm({ ...form, max_stock: e.target.value })}
                  placeholder="200"
                  className="text-center"
                />
              </div>

              {/* Data Validade */}
              <NeuInput
                label="Data de Validade"
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                icon={<Calendar className="w-5 h-5" />}
              />

              {/* Buttons */}
              <NeuDialogFooter className="border-t border-[var(--neu-border)] pt-4">
                <NeuButton
                  type="button"
                  variant="convex"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </NeuButton>
                <NeuButton
                  type="submit"
                  variant="accent"
                  loading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Guardar Produto
                </NeuButton>
              </NeuDialogFooter>
            </form>
      </NeuDialogContent>
    </NeuDialog>
  );
}
