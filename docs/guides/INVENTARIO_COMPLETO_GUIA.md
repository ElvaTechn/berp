# 📦 INVENTÁRIO COMPLETO - GUIA DE IMPLEMENTAÇÃO

## ✅ APIS CRIADAS E FUNCIONAIS!

### **1. GET /api/products** 
**Listar produtos da empresa**
- ✅ Multi-tenancy (apenas produtos da empresa do usuário)
- ✅ Filtros: category_id, is_active, search
- ✅ Ordenação: ativos primeiro, stock baixo, alfabética
- ✅ Inclui dados da categoria

### **2. POST /api/products**
**Criar novo produto**
- ✅ Validações completas
- ✅ Usa `Prisma.Decimal` para preços
- ✅ Verifica barcode duplicado
- ✅ Apenas GESTOR/ADMIN podem criar
- ✅ Auto-vincula à empresa do usuário

### **3. PATCH /api/products/[id]**
**Atualizar produto**
- ✅ Atualização parcial (só campos enviados)
- ✅ Validações de preço e stock
- ✅ Verifica barcode duplicado
- ✅ Soft delete via `is_active`
- ✅ Logs de auditoria

### **4. DELETE /api/products/[id]**
**Deletar produto**
- ✅ **Inteligente:** Se tem vendas = soft delete, senão = hard delete
- ✅ Verificação de propriedade (empresa)
- ✅ Apenas GESTOR/ADMIN
- ✅ Logs completos

### **5. GET /api/categories**
**Listar categorias**
- ✅ Apenas categorias ativas da empresa
- ✅ Ordenadas alfabeticamente

### **6. POST /api/categories**
**Criar categoria rápida**
- ✅ Cor aleatória se não fornecida
- ✅ Verifica duplicação de nome
- ✅ Apenas GESTOR/ADMIN

---

## 🎨 COMPONENTES CRIADOS

### **1. /inventory/page.tsx**
- ✅ Dashboard com 4 cards de estatísticas
- ✅ Busca em tempo real
- ✅ Filtros de stock
- ✅ Design maximalist

### **2. ProductTable.tsx**
- ✅ Tabela com cores de alerta
- ✅ Badges de categoria
- ✅ Ações (editar, ativar/desativar, deletar)
- ✅ Alertas de validade

---

## 🚀 O QUE FALTA (MODAIS)

Para completar, crie estes 2 componentes:

### **AddProductModal.tsx**

```typescript
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader2, Plus, Tag } from 'lucide-react';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    price: '',
    cost_price: '',
    quantity: '',
    min_stock: '',
    max_stock: '',
    category_id: '',
    expiry_date: '',
  });

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
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) throw new Error('Erro ao criar categoria');

      const data = await response.json();
      setCategories([...categories, data.category]);
      setForm({ ...form, category_id: data.category.id });
      setNewCategoryName('');
      setShowNewCategory(false);
      toast.success('✅ Categoria criada!');
    } catch (error) {
      toast.error('❌ Erro ao criar categoria');
    }
  };

  const formatCurrency = (value: string) => {
    // Remove tudo exceto números e ponto
    const numbers = value.replace(/[^\d.]/g, '');
    return numbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
          quantity: parseInt(form.quantity),
          min_stock: parseInt(form.min_stock),
          max_stock: form.max_stock ? parseInt(form.max_stock) : null,
          expiry_date: form.expiry_date || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar produto');
      }

      toast.success('✅ Produto cadastrado com sucesso!');
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-3xl border border-white/10 p-8 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic">
                  Novo <span className="text-purple-500">Produto</span>
                </h2>
                <p className="text-sm text-slate-400">Cadastre um item no inventário</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome e Descrição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Ex: Arroz Tio Lucas 5kg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  Categoria *
                </label>
                <div className="flex gap-2">
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="flex-1 h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Selecionar categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="h-12 px-4 bg-purple-600/20 border border-purple-600/30 rounded-xl text-purple-400 hover:bg-purple-600/30 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Nova Categoria */}
            {showNewCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 h-12 px-4 bg-green-600/10 border border-green-600/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="Nome da nova categoria"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="h-12 px-6 bg-green-600 rounded-xl text-white font-bold hover:bg-green-700 transition-all"
                >
                  Criar
                </button>
              </motion.div>
            )}

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            {/* Códigos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Código de Barras</label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="7891234567890"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">SKU (Código Interno)</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="PROD-001"
                />
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  Preço de Venda (MT) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    MT
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="450.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Preço de Custo (MT)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    MT
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="380.00"
                  />
                </div>
              </div>
            </div>

            {/* Stocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  Quantidade Inicial *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.min_stock}
                  onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Stock Máximo</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_stock}
                  onChange={(e) => setForm({ ...form, max_stock: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="200"
                />
              </div>
            </div>

            {/* Data de Validade */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Data de Validade</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Cadastrar Produto'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

### **EditProductModal.tsx**

Copie o `AddProductModal.tsx` e faça estas mudanças:

1. Adicione prop `product: Product`
2. Pré-preencha o formulário no `useEffect`
3. Mude POST para PATCH
4. Mude endpoint para `/api/products/${product.id}`

---

## 🎉 RESULTADO FINAL

Quando completar os modais, você terá:

✅ **CRUD Completo de Produtos**
✅ **Multi-tenancy** (isolamento por empresa)
✅ **Validações Robustas**
✅ **Soft Delete Inteligente**
✅ **Categorias Rápidas**
✅ **Design Maximalist**
✅ **Logs de Auditoria**

---

**Agora é só criar os 2 modais e testar! Todo o backend está pronto! 🚀**
