"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuTextarea } from '@/components/ui/neu-textarea';
import { NeuSelect, NeuSelectContent, NeuSelectItem, NeuSelectTrigger, NeuSelectValue } from '@/components/ui/neu-select';
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogFooter } from '@/components/ui/neu-dialog';
import { Plus, Pencil, Trash2, Package, Search, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  min_stock: number;
  category_id: string;
  company_id: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    min_stock: '',
    category_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          min_stock: parseInt(formData.min_stock),
        }),
      });

      if (res.ok) {
        toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
        await loadData();
        closeDialog();
      } else {
        toast.error('Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Produto excluído!');
        await loadData();
      } else {
        toast.error('Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        min_stock: product.min_stock.toString(),
        category_id: product.category_id,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        min_stock: '5',
        category_id: categories[0]?.id || '',
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--neu-accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="neu-text-h1">Produtos</h1>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Gerencie o inventário da sua empresa
          </p>
        </div>
        <NeuButton onClick={() => openDialog()} variant="accent" size="md">
          <Plus className="h-4 w-4" />
          <span>Novo Produto</span>
        </NeuButton>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <NeuInput
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <NeuSelect value={filterCategory} onValueChange={setFilterCategory}>
          <NeuSelectTrigger variant="concave" size="md" className="w-full sm:w-[200px]">
            <NeuSelectValue placeholder="Categoria" />
          </NeuSelectTrigger>
          <NeuSelectContent>
            <NeuSelectItem value="all">Todas as categorias</NeuSelectItem>
            {categories.map((cat) => (
              <NeuSelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </NeuSelectItem>
            ))}
          </NeuSelectContent>
        </NeuSelect>
      </motion.div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NeuCard variant="concave" size="lg">
            <NeuCardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full neu-surface neu-convex-lg flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-[var(--neu-accent)]" />
              </div>
              <h3 className="neu-text-h2 mb-2">Nenhum produto encontrado</h3>
              <p className="neu-text-body text-[var(--neu-text-muted)] mb-4">
                {searchTerm || filterCategory !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Comece adicionando seu primeiro produto'}
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <NeuButton onClick={() => openDialog()} variant="accent" size="md">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Produto</span>
                </NeuButton>
              )}
            </NeuCardContent>
          </NeuCard>
        </motion.div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => {
            const category = getCategoryById(product.category_id);
            const isLowStock = product.quantity <= product.min_stock;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NeuCard variant="convex" size="md" className="group">
                  <NeuCardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="neu-text-body font-bold">{product.name}</h3>
                        {category && (
                          <span
                            className="inline-block mt-1 px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold"
                            style={{ color: category.color }}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <NeuButton variant="ghost" size="icon" onClick={() => openDialog(product)}>
                          <Pencil className="h-4 w-4" />
                        </NeuButton>
                        <NeuButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-[var(--neu-error)]" />
                        </NeuButton>
                      </div>
                    </div>

                    {product.description && (
                      <p className="neu-text-caption text-[var(--neu-text-muted)] mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="neu-text-h3">{formatCurrency(product.price)}</span>
                      <div
                        className={`flex items-center gap-1 neu-text-caption ${
                          isLowStock ? 'text-[var(--neu-error)]' : 'text-[var(--neu-text-muted)]'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="h-4 w-4" />}
                        <span>Stock: {product.quantity}</span>
                      </div>
                    </div>
                  </NeuCardContent>
                </NeuCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <NeuDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <NeuDialogContent size="md">
          <NeuDialogHeader>
            <NeuDialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</NeuDialogTitle>
          </NeuDialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="neu-text-label">Nome</label>
                <NeuInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="neu-text-label">Descrição</label>
                <NeuTextarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="neu-text-label">Categoria</label>
                <NeuSelect
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <NeuSelectTrigger variant="concave" size="md">
                    <NeuSelectValue placeholder="Selecione uma categoria" />
                  </NeuSelectTrigger>
                  <NeuSelectContent>
                    {categories.map((cat) => (
                      <NeuSelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </NeuSelectItem>
                    ))}
                  </NeuSelectContent>
                </NeuSelect>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="neu-text-label">Preço (MZN)</label>
                  <NeuInput
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="neu-text-label">Quantidade</label>
                  <NeuInput
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="neu-text-label">Stock Mínimo (alerta)</label>
                <NeuInput
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <NeuDialogFooter>
              <NeuButton type="button" variant="convex" size="md" onClick={closeDialog}>
                Cancelar
              </NeuButton>
              <NeuButton type="submit" variant="accent" size="md" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{editingProduct ? 'Salvar' : 'Criar'}</span>
              </NeuButton>
            </NeuDialogFooter>
          </form>
        </NeuDialogContent>
      </NeuDialog>
    </div>
  );
}
