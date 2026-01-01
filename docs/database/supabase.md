# Prompt Simplificado: Supabase Apenas para Banco de Dados

Aqui está o prompt otimizado para usar Supabase **apenas como banco de dados**, sem autenticação:

---

**Prompt:**

```
OBJETIVO:
Conectar o projeto BizControl 360 ao Supabase exclusivamente para banco de dados (armazenamento e recuperação de dados), sem implementar sistema de autenticação. O projeto deve usar Supabase no lugar de dados mockados.

PASSOS A EXECUTAR:

## 1. Análise do Projeto Atual

### 1.1 Verificar Estrutura do Projeto
```bash
# Verificar se já existe alguma integração com Supabase
grep -r "supabase" package.json src/ --include="*.json" --include="*.ts" --include="*.tsx" 2>/dev/null

# Verificar se há chamadas de API existentes
grep -r "fetch\|axios\|api\|http" src/ --include="*.ts" --include="*.tsx" | head -20

# Verificar onde estão os dados mockados
grep -r "mock\|fake\|dados\|example\|const data" src/ --include="*.ts" --include="*.tsx" | head -30

# Verificar estrutura de pastas
ls -la src/
```

### 1.2 Identificar Entidades do Sistema
Liste as principais entidades/tabelas que o sistema precisa:

```
ENTIDADE         │ DADOS MOCKADOS EM         │ PRECISA DE CRUD
─────────────────┼───────────────────────────┼─────────────────
Produtos         │ src/app/inventory/page.tsx│ [ ] Create [ ] Read [ ] Update [ ] Delete
Pedidos          │ src/app/pos/page.tsx      │ [ ] Create [ ] Read
KPIs/Dashboard   │ src/app/dashboard/page.tsx│ [ ] Read
Clientes         │ ?                         │ [ ] Create [ ] Read
Categorias       │ src/app/inventory/page.tsx│ [ ] Read
```

## 2. Configuração do Supabase (Apenas Banco de Dados)

### 2.1 Criar Projeto no Supabase
Acesse https://supabase.com:
1. Crie uma conta ou faça login
2. Clique em "New Project"
3. Preencha:
   - Name: `bizcontrol-360`
   - Database Password: Gere e guarde uma senha forte
   - Region: Selecione a região mais próxima
4. Aguarde a criação (2-3 minutos)

### 2.2 Obter Credenciais (Apenas URL e anon key)
No Supabase Dashboard:
1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public key** (chave pública)

### 2.3 Configurar Variáveis de Ambiente
Crie `.env.local`:

```bash
# Criar/editar .env.local
touch .env.local

# Adicionar apenas as variáveis necessárias para banco de dados
cat >> .env.local << 'EOF'
# Supabase - Banco de Dados Apenas
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
EOF
```

### 2.4 Proteger credenciais
```bash
# Verificar se .env.local está no .gitignore
grep -q ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

## 3. Instalação

### 3.1 Instalar cliente Supabase (apenas banco de dados)
```bash
# Instalar apenas o cliente básico do Supabase
npm install @supabase/supabase-js
```

**NOTA:** NÃO instale `@supabase/auth-helpers-nextjs` porque não estamos usando autenticação.

## 4. Criar Cliente Supabase

### 4.1 Criar arquivo de configuração
Crie `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Pegar variáveis de ambiente (apenas banco de dados)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Criar cliente (sem opções de auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions para operações CRUD básicas
export const db = {
  // === PRODUTOS ===
  async getProducts(filters?: { category?: string; search?: string }) {
    let query = supabase.from('products').select('*, categories(name)');
    
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    return data;
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<DatabaseProduct>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // === CATEGORIAS ===
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  // === PEDIDOS ===
  async createOrder(order: DatabaseOrder) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getOrders(filters?: { status?: string; limit?: number }) {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // === KPI DASHBOARD ===
  async getTodayKPIs() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('kpis')
      .select('*')
      .eq('date', today)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getWeeklySales() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getProductStats() {
    const { data, error } = await supabase
      .from('products')
      .select('id, quantity, price, category_id');
    if (error) throw error;
    return data;
  },
};

// Tipos TypeScript
export type DatabaseProduct = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  quantity: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DatabaseOrder = {
  id: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  customer_id: string | null;
  created_at: string;
};
```

### 4.2 Criar tipos TypeScript
Crie `src/types/database.ts`:

```typescript
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  quantity: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  // Relacionamento
  categories?: { name: string };
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Order {
  id: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  customer_id: string | null;
  created_at: string;
}

export interface KPI {
  id: string;
  date: string;
  revenue: number;
  sales_count: number;
  customers_count: number;
  created_at: string;
}
```

## 5. Configurar Banco de Dados Supabase

### 5.1 Executar SQL no Supabase SQL Editor
Vá no Supabase Dashboard → **SQL Editor** e execute:

```sql
-- Criar tabela de categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  customer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de KPIs
CREATE TABLE kpis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  revenue DECIMAL(10, 2) DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  customers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_kpis_date ON kpis(date);
```

### 5.2 Configurar Permissões Simples (sem autenticação)
Como NÃO estamos usando autenticação, tornaremos todas as tabelas públicas para leitura/escrita:

```sql
-- Tornar todas as tabelas públicas para este projeto (banco de dados apenas)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

-- Permitir acesso público completo (para uso sem auth)
CREATE POLICY "Allow public access" ON categories FOR ALL USING (true);
CREATE POLICY "Allow public access" ON products FOR ALL USING (true);
CREATE POLICY "Allow public access" ON orders FOR ALL USING (true);
CREATE POLICY "Allow public access" ON kpis FOR ALL USING (true);
```

### 5.3 Inserir dados de exemplo
```sql
-- Inserir categorias
INSERT INTO categories (name) VALUES
('Eletrônicos'), ('Roupas'), ('Alimentos'), ('Bebidas'), ('Outros');

-- Inserir produtos
INSERT INTO products (name, sku, description, price, quantity, category_id) VALUES
('Smartphone X', 'SKU-001', 'Smartphone com tela 6.5"', 1999.00, 50, (SELECT id FROM categories WHERE name = 'Eletrônicos')),
('Notebook Pro', 'SKU-002', 'Notebook i5 8GB', 3499.00, 25, (SELECT id FROM categories WHERE name = 'Eletrônicos')),
('Camiseta Básica', 'SKU-003', 'Camiseta 100% algodão', 49.90, 100, (SELECT id FROM categories WHERE name = 'Roupas'));

-- Inserir KPIs de hoje
INSERT INTO kpis (date, revenue, sales_count, customers_count)
VALUES (CURRENT_DATE, 2847.00, 47, 12)
ON CONFLICT (date) DO UPDATE SET
  revenue = EXCLUDED.revenue,
  sales_count = EXCLUDED.sales_count,
  customers_count = EXCLUDED.customers_count;
```

## 6. Atualizar Páginas do Projeto

### 6.1 Atualizar Dashboard (src/app/dashboard/page.tsx)
Substitua dados mockados por chamadas ao Supabase:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { NeuCard, NeuKPICard } from '@/components/ui';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [kpis, productStats] = await Promise.all([
          db.getTodayKPIs(),
          db.getProductStats(),
        ]);

        // Calcular métricas
        const lowStock = productStats?.filter(p => p.quantity < 10).length || 0;
        const totalValue = productStats?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0;

        setData({
          kpis: {
            today: {
              revenue_formatted: kpis?.revenue ? `R$ ${kpis.revenue.toFixed(2)}` : 'R$ 0,00',
              revenue_trend: '+12,5%',
              sales_count: kpis?.sales_count?.toString() || '0',
              sales_trend: '+8',
              customers_count: kpis?.customers_count?.toString() || '0',
            },
            inventory: {
              low_stock_count: lowStock,
              total_value: `R$ ${totalValue.toFixed(2)}`,
            },
          },
        });
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao conectar com banco de dados');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neu-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-neu-accent text-white rounded-lg"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NeuKPICard
          title="Vendas Hoje"
          value={data?.kpis?.today?.revenue_formatted || 'R$ 0,00'}
          trend={data?.kpis?.today?.revenue_trend}
        />
        <NeuKPICard
          title="Pedidos Hoje"
          value={data?.kpis?.today?.sales_count || '0'}
          trend={data?.kpis?.today?.sales_trend}
        />
        <NeuKPICard
          title="Novos Clientes"
          value={data?.kpis?.today?.customers_count || '0'}
        />
        <NeuKPICard
          title="Estoque Baixo"
          value={data?.kpis?.inventory?.low_stock_count?.toString() || '0'}
          variant={data?.kpis?.inventory?.low_stock_count > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <NeuCard>
          <h3 className="text-lg font-semibold text-neu-text mb-4">Vendas da Semana</h3>
          <div className="h-48 sm:h-64">
            {/* Seu componente de gráfico existente */}
          </div>
        </NeuCard>

        <NeuCard>
          <h3 className="text-lg font-semibold text-neu-text mb-4">Resumo do Estoque</h3>
          <p className="text-neu-text/60">Valor total: {data?.kpis?.inventory?.total_value}</p>
        </NeuCard>
      </div>
    </div>
  );
}
```

### 6.2 Atualizar Inventário (src/app/inventory/page.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { NeuCard, NeuButton, NeuInput, NeuSelect } from '@/components/ui';
import { Product } from '@/types/database';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          db.getProducts({ search: searchTerm, category: selectedCategory }),
          db.getCategories(),
        ]);
        setProducts(productsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchTerm, selectedCategory]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await db.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neu-text">Estoque</h1>
        <NeuButton variant="primary" onClick={() => setShowForm(true)}>
          + Novo Produto
        </NeuButton>
      </div>

      {/* Filtros */}
      <NeuCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <NeuInput
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <NeuSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Todas as categorias"
          />
        </div>
      </NeuCard>

      {/* Tabela de Produtos */}
      <NeuCard>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neu-accent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neu-shadow/20">
              <thead className="bg-neu-shadow/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">Estoque</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neu-shadow/10">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-neu-shadow/5">
                    <td className="px-4 py-3 text-sm text-neu-text">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-neu-text/60">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-neu-text">R$ {product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={product.quantity < 10 ? 'text-red-500 font-semibold' : ''}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditProduct(product); setShowForm(true); }}
                          className="p-2 rounded-lg neu-convex-sm text-neu-accent"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg neu-convex-sm text-red-500"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NeuCard>

      {/* Formulário (simplificado) */}
      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          onSave={async (product) => {
            if (editProduct) {
              await db.updateProduct(editProduct.id, product);
              setProducts(products.map(p => p.id === editProduct.id ? { ...p, ...product } : p));
            } else {
              const newProduct = await db.createProduct(product);
              setProducts([...products, newProduct]);
            }
            setShowForm(false);
            setEditProduct(null);
          }}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}
    </div>
  );
}
```

### 6.3 Atualizar PDV (src/app/pos/page.tsx)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { NeuCard, NeuButton, NeuInput } from '@/components/ui';
import { Product } from '@/types/database';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await db.getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleCheckout = async () => {
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    try {
      // Criar pedido
      await db.createOrder({
        id: '', // será gerado pelo Supabase
        total,
        status: 'completed',
        customer_id: null,
        created_at: new Date().toISOString(),
      });

      alert('Pedido realizado com sucesso!');
      setCart([]);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-7rem)]">
      {/* Produtos */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <NeuCard className="mb-4 flex-shrink-0">
          <NeuInput
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </NeuCard>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(product => (
                <NeuCard
                  key={product.id}
                  className="cursor-pointer active:neu-pressed"
                  onClick={() => addToCart(product)}
                >
                  <p className="font-semibold text-neu-text truncate">{product.name}</p>
                  <p className="text-neu-accent font-bold mt-1">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-neu-text/60 mt-2">
                    Estoque: {product.quantity}
                  </p>
                </NeuCard>
              ))}
          </div>
        </div>
      </div>

      {/* Carrinho */}
      <NeuCard className="lg:w-96 flex flex-col">
        <h2 className="text-lg font-bold text-neu-text mb-4">
          Carrinho ({cart.length} itens)
        </h2>

        <div className="flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-neu-text/60 py-8">Carrinho vazio</p>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-3 rounded-xl neu-convex-sm">
                <div>
                  <p className="font-medium text-neu-text">{item.product.name}</p>
                  <p className="text-sm text-neu-text/60">
                    R$ {item.product.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.product.id, -1)} className="w-8 h-8 rounded-lg neu-convex-sm">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, 1)} className="w-8 h-8 rounded-lg neu-convex-sm">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-neu-shadow/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold text-neu-accent">R$ {total.toFixed(2)}</span>
          </div>

          <NeuButton
            variant="primary"
            className="w-full"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Finalizar Pedido
          </NeuButton>
        </div>
      </NeuCard>
    </div>
  );
}
```

## 7. Testes

### 7.1 Verificar Conexão
```bash
# Build do projeto
npm run build

# Verificar erros
npx tsc --noEmit
```

### 7.2 Testar no Browser
```
1. Abrir localhost:3000
2. Verificar console por erros de Supabase
3. Dashboard deve carregar KPIs do banco
4. Inventário deve carregar produtos
5. PDV deve permitir adicionar ao carrinho e criar pedidos
```

## RELATÓRIO DE ENTREGA

Forneça um relatório simples:

1. **Configuração Supabase**
   - Projeto criado: SIM/NÃO
   - Tabelas criadas: categories, products, orders, kpis
   - Permissões: públicas (sem auth)

2. **Arquivos Criados**
   - `src/lib/supabase.ts` - Cliente Supabase
   - `src/types/database.ts` - Tipos TypeScript
   - `.env.local` - Variáveis de ambiente

3. **Dependências Instaladas**
   - `@supabase/supabase-js` instalado

4. **Páginas Atualizadas**
   - Dashboard - KPIs do Supabase
   - Inventory - CRUD de produtos
   - POS - Carrinho e pedidos

5. **Testes**
   - Build: sucesso/falha
   - Dados carregando: SIM/NÃO
   - Erros no console: lista

6. **Problemas Encontrados**
   - Liste problemas e soluções

Execute e forneça o relatório.
```

---

**Diferenças desta versão para a anterior:**

| Aspecto | Com Autenticação | Apenas Banco de Dados |
|---------|------------------|----------------------|
| Pacotes | @supabase/auth-helpers | Apenas @supabase/supabase-js |
| Políticas RLS | Complexas (por usuário) | Públicas (acesso total) |
| Cliente | Com auth options | Cliente básico |
| SQL | Policies detalhadas | Policies simples |
| Código | Mais complexo | Mais simples |

