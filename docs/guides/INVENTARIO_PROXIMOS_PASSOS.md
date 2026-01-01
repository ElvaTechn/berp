# 📦 INVENTÁRIO - PRÓXIMOS PASSOS

## ✅ O QUE JÁ FOI CRIADO

### **1. Página de Inventário** (`/inventory/page.tsx`)
- ✅ Dashboard com 4 cards de estatísticas
- ✅ Busca por nome, barcode, SKU
- ✅ Filtros de stock (todos, ok, baixo, crítico)
- ✅ Listagem de produtos com loading state
- ✅ Design maximalist com gradientes

### **2. ProductTable Component**
- ✅ Tabela responsiva com cores de alerta:
  - 🔴 **ESGOTADO** (quantidade = 0)
  - 🟡 **BAIXO** (quantidade <= min_stock)
  - 🟢 **OK** (quantidade > min_stock)
- ✅ Badges de categoria coloridos
- ✅ Indicador de ativo/inativo
- ✅ Alertas de produtos a vencer (30 dias)
- ✅ Alertas de produtos vencidos
- ✅ Ações: Editar, Ativar/Desativar, Deletar
- ✅ Formatação de preços em MT

---

## 🔨 O QUE FALTA CRIAR

### **3. AddProductModal** (`/components/inventory/AddProductModal.tsx`)

**Campos necessários:**
```typescript
- Nome *
- Descrição
- Código de Barras
- SKU (código interno)
- Preço de Venda * (MT)
- Preço de Custo (MT)
- Quantidade Inicial *
- Stock Mínimo *
- Stock Máximo
- Categoria * (select com categorias existentes)
- Data de Validade (opcional)
```

**Design:**
- Full-screen modal maximalist
- Gradientes vibrantes
- Validações client-side
- Loading state durante submit
- Toast notifications

---

### **4. EditProductModal** (`/components/inventory/EditProductModal.tsx`)

**Similar ao AddProductModal, mas:**
- Campos pré-preenchidos
- Não permite editar quantidade diretamente (apenas via ajuste de stock)
- Pode mudar apenas: nome, descrição, preços, stocks min/max, categoria, validade

---

### **5. API de Produtos**

#### **GET /api/products**
```typescript
// Listar todos produtos da empresa do usuário
// Query params: category_id, is_active, search
// Retorna: { products: Product[] }
```

#### **POST /api/products**
```typescript
// Criar novo produto
// Body: { name, description, barcode, sku, price, cost_price, quantity, min_stock, max_stock, category_id, expiry_date }
// Retorna: { product: Product }
```

#### **PATCH /api/products/[id]**
```typescript
// Atualizar produto (incluindo is_active para soft delete)
// Body: campos a atualizar
// Retorna: { product: Product }
```

#### **DELETE /api/products/[id]**
```typescript
// Deletar produto permanentemente
// Retorna: { success: true }
```

---

## 📝 TEMPLATES DE CÓDIGO

### **AddProductModal - Estrutura Base**

```typescript
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ onClose, onSuccess }: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
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

      if (!response.ok) throw new Error('Erro ao criar produto');

      toast.success('✅ Produto cadastrado com sucesso!');
      onSuccess();
    } catch (error) {
      toast.error('❌ Erro ao cadastrar produto');
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-3xl border border-white/10 p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white italic">
                  Novo <span className="text-purple-500">Produto</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Cadastre um novo item no inventário
                </p>
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
            {/* ... Campos do formulário ... */}
            
            {/* Buttons */}
            <div className="flex gap-3 pt-6">
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
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold disabled:opacity-50 transition-all"
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

---

## 🚀 COMO CONTINUAR

### **PASSO 1: Criar AddProductModal**
```bash
# Criar arquivo
touch src/components/inventory/AddProductModal.tsx

# Use o template acima
# Adicione todos os campos do formulário
```

### **PASSO 2: Criar EditProductModal**
```bash
# Copie AddProductModal
cp src/components/inventory/AddProductModal.tsx src/components/inventory/EditProductModal.tsx

# Ajuste para pré-preencher campos
# Use PATCH ao invés de POST
```

### **PASSO 3: Criar APIs**
```bash
# Listar produtos
touch src/app/api/products/route.ts

# Ações individuais
mkdir -p src/app/api/products/[id]
touch src/app/api/products/[id]/route.ts
```

---

## 🎯 RESULTADO ESPERADO

Quando tudo estiver pronto, você terá:

- ✅ **Página de Inventário** funcionando
- ✅ **Listagem de produtos** com cores de alerta
- ✅ **Busca e filtros** funcionais
- ✅ **Adicionar produto** via modal
- ✅ **Editar produto** via modal
- ✅ **Ativar/Desativar** produtos (soft delete)
- ✅ **Deletar** produtos permanentemente
- ✅ **Alertas visuais** de stock baixo
- ✅ **Alertas de validade** de produtos

---

## 💡 DICAS IMPORTANTES

1. **Validações:**
   - Preço de venda > Preço de custo (warning)
   - Quantidade inicial >= 0
   - Stock mínimo > 0
   - Nome é obrigatório

2. **Cálculos automáticos:**
   - Lucro por unidade: `price - cost_price`
   - Valor total em stock: `price * quantity`

3. **Soft Delete:**
   - Use `is_active: false` ao invés de deletar
   - Produtos inativos aparecem com opacity 50%
   - Podem ser reativados a qualquer momento

4. **Alertas:**
   - Stock crítico: `quantity === 0` (vermelho)
   - Stock baixo: `quantity <= min_stock` (amarelo)
   - A vencer: `< 30 dias` (amarelo)
   - Vencido: `< hoje` (vermelho)

---

**Continue criando os modais e APIs! A estrutura principal já está pronta! 🚀**
