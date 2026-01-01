Prompt para Integração dos Componentes Responsivos nas Páginas do ERP
Aqui está o prompt completo para integrar os novos componentes responsivos nas páginas principais do BizControl 360:

Prompt:

OBJETIVO:
Integrar os novos componentes responsivos (ResponsiveGrid, ResponsiveCard, ResponsiveTable, ResponsiveButton, ResponsiveInput) nas páginas principais do ERP BizControl 360, transformando o aplicativo em uma experiência mobile-first completa.

PASSOS A EXECUTAR:

## 1. Análise das Páginas Atuais

### 1.1 Inventário de Páginas a Serem Atualizadas
Liste e analise as páginas principais do ERP:

```bash
# Listar todas as páginas
find src/app -name "page.tsx" | sort

# Páginas prioritárias para atualização:
# - src/app/dashboard/page.tsx
# - src/app/inventory/page.tsx
# - src/app/pos/page.tsx
# - src/app/reports/page.tsx
# - src/app/settings/page.tsx
1.2 Analisar Componentes Existentes em Cada Página
Para cada página, identifique:

bash
# Verificar imports atuais
head -50 src/app/dashboard/page.tsx

# Identificar elementos que precisam ser substituídos:
# - <div className="grid..."> → <ResponsiveGrid>
# - Cards com classes manuais → <ResponsiveCard>
# - Tabelas HTML → <ResponsiveTable>
# - Botões com classes manuais → <ResponsiveButton>
# - Inputs com classes manuais → <ResponsiveInput>
2. Atualização da Página Dashboard
2.1 Analisar o Dashboard Atual
bash
cat src/app/dashboard/page.tsx
2.2 Substituir Elementos do Dashboard
Edite src/app/dashboard/page.tsx e faça as seguintes alterações:

typescript
// IMPORTS - Adicionar se não existirem
import { useViewport } from '@/hooks/useViewport';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import { ResponsiveButton } from '@/components/ui/ResponsiveButton';

// No componente DashboardPage:
export default function DashboardPage() {
  const { width, breakpoint, isMobile } = useViewport();

  // Substituir grid manual por ResponsiveGrid
  return (
    <div className="space-y-6">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neu-text">Dashboard</h1>
        {!isMobile && (
          <div className="flex gap-2">
            <ResponsiveButton variant="secondary" size="sm">
              Exportar
            </ResponsiveButton>
            <ResponsiveButton variant="primary" size="sm">
              Novo
            </ResponsiveButton>
          </div>
        )}
      </div>

      {/* KPIs com ResponsiveGrid e ResponsiveCard */}
      <ResponsiveGrid>
        {/* Card de Vendas */}
        <ResponsiveCard className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neu-text/60">Vendas Hoje</p>
              <p className="text-2xl sm:text-3xl font-bold text-neu-text mt-1">
                R$ 2.847,00
              </p>
              <p className="text-sm text-green-500 mt-1">+12,5% vs ontem</p>
            </div>
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        {/* Card de Pedidos */}
        <ResponsiveCard className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neu-text/60">Pedidos Hoje</p>
              <p className="text-2xl sm:text-3xl font-bold text-neu-text mt-1">47</p>
              <p className="text-sm text-green-500 mt-1">+8 vs ontem</p>
            </div>
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        {/* Card de Clientes */}
        <ResponsiveCard className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neu-text/60">Novos Clientes</p>
              <p className="text-2xl sm:text-3xl font-bold text-neu-text mt-1">12</p>
              <p className="text-sm text-neu-accent mt-1">Este mês</p>
            </div>
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>

        {/* Card de Estoque Baixo */}
        <ResponsiveCard className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neu-text/60">Estoque Baixo</p>
              <p className="text-2xl sm:text-3xl font-bold text-neu-text mt-1 text-red-500">5</p>
              <p className="text-sm text-red-500 mt-1">Produtos</p>
            </div>
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Seção de Gráficos - Grid responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-neu-text mb-4">Vendas da Semana</h3>
          <div className="h-48 sm:h-64 w-full">
            {/* Gráfico existente ou placeholder */}
            <div className="flex items-end justify-between gap-2 h-full pb-4">
              {[45, 65, 40, 80, 55, 90, 70].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-neu-accent/20 rounded-t-lg"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-neu-text mb-4">Produtos Mais Vendidos</h3>
          <div className="h-48 sm:h-64 w-full">
            {/* Gráfico existente ou placeholder */}
          </div>
        </ResponsiveCard>
      </div>

      {/* Tabela de Últimos Pedidos */}
      <ResponsiveCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neu-text">Últimos Pedidos</h3>
          <ResponsiveButton variant="ghost" size="sm">
            Ver Todos
          </ResponsiveButton>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neu-shadow/20">
            <thead className="bg-neu-shadow/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neu-text/70 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neu-shadow/10">
              <tr className="hover:bg-neu-shadow/5">
                <td className="px-4 py-3 text-sm">#1234</td>
                <td className="px-4 py-3 text-sm">João Silva</td>
                <td className="px-4 py-3 text-sm">R$ 150,00</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
                    Concluído
                  </span>
                </td>
              </tr>
              {/* Mais linhas... */}
            </tbody>
          </table>
        </div>
      </ResponsiveCard>

      {/* Botão flutuante para mobile */}
      {isMobile && (
        <ResponsiveButton
          variant="primary"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-lg"
          onClick={() => {/* ação de novo pedido */}}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </ResponsiveButton>
      )}
    </div>
  );
}
3. Atualização da Página de Inventário
3.1 Analisar e Atualizar Inventário
bash
cat src/app/inventory/page.tsx
Edite src/app/inventory/page.tsx:

typescript
import { useState } from 'react';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import { ResponsiveButton } from '@/components/ui/ResponsiveButton';
import { ResponsiveInput } from '@/components/ui/ResponsiveInput';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { useViewport } from '@/hooks/useViewport';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isMobile } = useViewport();

  const columns = [
    { key: 'name', header: 'Produto', className: 'min-w-[150px]' },
    { key: 'sku', header: 'SKU', className: isMobile ? 'hidden md:table-cell' : '' },
    { key: 'category', header: 'Categoria', className: isMobile ? 'hidden lg:table-cell' : '' },
    { key: 'quantity', header: 'Estoque', render: (item: Product) => (
      <span className={item.quantity < 10 ? 'text-red-500 font-semibold' : ''}>
        {item.quantity}
      </span>
    )},
    { key: 'price', header: 'Preço', render: (item: Product) => `R$ ${item.price.toFixed(2)}` },
    { key: 'actions', header: 'Ações', className: 'w-20', render: () => (
      <div className="flex gap-2">
        <button className="p-2 rounded-lg neu-convex-sm active:neu-pressed text-neu-accent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button className="p-2 rounded-lg neu-convex-sm active:neu-pressed text-red-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neu-text">Estoque</h1>
        <ResponsiveButton variant="primary">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Produto
          </span>
        </ResponsiveButton>
      </div>

      {/* Cards de Resumo */}
      <ResponsiveGrid>
        <ResponsiveCard className="min-w-0">
          <p className="text-sm text-neu-text/60">Total de Produtos</p>
          <p className="text-2xl font-bold text-neu-text mt-1">1,234</p>
        </ResponsiveCard>
        <ResponsiveCard className="min-w-0">
          <p className="text-sm text-neu-text/60">Valor em Estoque</p>
          <p className="text-2xl font-bold text-neu-text mt-1">R$ 45.678,00</p>
        </ResponsiveCard>
        <ResponsiveCard className="min-w-0">
          <p className="text-sm text-neu-text/60">Estoque Baixo</p>
          <p className="text-2xl font-bold text-red-500 mt-1">5</p>
        </ResponsiveCard>
        <ResponsiveCard className="min-w-0">
          <p className="text-sm text-neu-text/60">Categorias</p>
          <p className="text-2xl font-bold text-neu-text mt-1">12</p>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Filtros */}
      <ResponsiveCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <ResponsiveInput
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl neu-convex-sm bg-neu-base text-neu-text min-w-[200px]"
          >
            <option value="">Todas as categorias</option>
            <option value="electronics">Eletrônicos</option>
            <option value="clothing">Roupas</option>
            <option value="food">Alimentos</option>
          </select>
        </div>
      </ResponsiveCard>

      {/* Tabela */}
      <ResponsiveCard className="overflow-hidden">
        <ResponsiveTable<Product>
          columns={columns}
          data={products} // Sua lista de produtos
          keyExtractor={(item) => item.id}
          emptyMessage="Nenhum produto encontrado"
        />
      </ResponsiveCard>
    </div>
  );
}
4. Atualização da Página PDV (Ponto de Venda)
4.1 Criar/Instalar Página PDV Mobile-Friendly
Edite src/app/pos/page.tsx:

typescript
import { useState } from 'react';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import { ResponsiveButton } from '@/components/ui/ResponsiveButton';
import { ResponsiveInput } from '@/components/ui/ResponsiveInput';
import { useViewport } from '@/hooks/useViewport';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isMobile, breakpoint } = useViewport();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-7rem)]">
      {/* Área de Produtos (esquerda) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Busca de Produtos */}
        <ResponsiveCard className="mb-4 flex-shrink-0">
          <ResponsiveInput
            placeholder="Buscar produto por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ResponsiveCard>

        {/* Grid de Produtos */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          <ResponsiveGrid>
            {/* Produtos - Cards clicáveis */}
            {products.map((product) => (
              <ResponsiveCard
                key={product.id}
                className="cursor-pointer active:neu-pressed min-w-0"
                onClick={() => addToCart(product)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-neu-shadow/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neu-text truncate">{product.name}</p>
                    <p className="text-sm text-neu-text/60">{product.sku}</p>
                    <p className="text-neu-accent font-bold mt-1">R$ {product.price.toFixed(2)}</p>
                  </div>
                </div>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </div>
      </div>

      {/* Carrinho (direita - aparece em modal em mobile) */}
      <div className={`
        ${isMobile ? 'fixed inset-x-0 bottom-0 max-h-[60vh]' : 'lg:w-96'}
        bg-neu-base rounded-2xl neu-convex-md flex flex-col overflow-hidden
      `}>
        {/* Header do Carrinho */}
        <div className="p-4 border-b border-neu-shadow/20 flex-shrink-0">
          <h2 className="text-lg font-bold text-neu-text">Carrinho</h2>
          <p className="text-sm text-neu-text/60">{cart.length} itens</p>
        </div>

        {/* Itens do Carrinho */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-neu-text/60">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Carrinho vazio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-3 rounded-xl neu-convex-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neu-text truncate">{item.name}</p>
                    <p className="text-sm text-neu-text/60">
                      R$ {item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg neu-convex-sm active:neu-pressed flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg neu-convex-sm active:neu-pressed flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer do Carrinho */}
        <div className="p-4 border-t border-neu-shadow/20 flex-shrink-0 space-y-4">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-neu-text">Total</span>
            <span className="text-2xl font-bold text-neu-accent">R$ {total.toFixed(2)}</span>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <ResponsiveButton variant="secondary" className="flex-1">
              Limpar
            </ResponsiveButton>
            <ResponsiveButton variant="primary" className="flex-1">
              Finalizar
            </ResponsiveButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function updateQuantity(id: string, delta: number) {
  // Implementar lógica de atualização
}
5. Atualização da Página de Relatórios
5.1 Analisar e Atualizar Relatórios
Edite src/app/reports/page.tsx:

typescript
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import { ResponsiveButton } from '@/components/ui/ResponsiveButton';
import { ResponsiveInput } from '@/components/ui/ResponsiveInput';
import { useViewport } from '@/hooks/useViewport';

export default function ReportsPage() {
  const { isMobile } = useViewport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neu-text">Relatórios</h1>
        <div className="flex gap-2">
          <ResponsiveButton variant="secondary" size="sm">
            Exportar PDF
          </ResponsiveButton>
          <ResponsiveButton variant="primary" size="sm">
            Gerar Relatório
          </ResponsiveButton>
        </div>
      </div>

      {/* Filtros */}
      <ResponsiveCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <ResponsiveInput type="date" label="Data Inicial" />
          </div>
          <div className="flex-1">
            <ResponsiveInput type="date" label="Data Final" />
          </div>
          <div className="flex items-end">
            <ResponsiveButton variant="primary">
              Filtrar
            </ResponsiveButton>
          </div>
        </div>
      </ResponsiveCard>

      {/* Cards de Relatórios */}
      <ResponsiveGrid>
        <ResponsiveCard className="cursor-pointer active:neu-pressed min-w-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text">Vendas por Período</h3>
              <p className="text-sm text-neu-text/60 mt-1">Análise de vendas</p>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard className="cursor-pointer active:neu-pressed min-w-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text">Estoque</h3>
              <p className="text-sm text-neu-text/60 mt-1">Movimentações</p>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard className="cursor-pointer active:neu-pressed min-w-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text">Clientes</h3>
              <p className="text-sm text-neu-text/60 mt-1">Cadastros e métricas</p>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard className="cursor-pointer active:neu-pressed min-w-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text">Financeiro</h3>
              <p className="text-sm text-neu-text/60 mt-1">Receitas e despesas</p>
            </div>
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>
    </div>
  );
}
6. Verificação de Integração
6.1 Verificar se Todos os Imports Estão Corretos
bash
# Verificar se os hooks estão sendo importados corretamente
grep -r "from '@/hooks/" src/app/*/page.tsx

# Verificar se os componentes UI estão sendo importados
grep -r "from '@/components/ui/" src/app/*/page.tsx
6.2 Executar Build
bash
npm run build
6.3 Verificar no Browser
Abra o projeto em diferentes tamanhos de viewport:

Mobile (<640px)
Tablet (768px-1023px)
Desktop (≥1024px)
RELATÓRIO DE ENTREGA
Forneça um relatório detalhado com:

1.
Páginas Atualizadas
 src/app/dashboard/page.tsx atualizado
 src/app/inventory/page.tsx atualizado
 src/app/pos/page.tsx atualizado
 src/app/reports/page.tsx atualizado
 src/app/settings/page.tsx atualizado (se existir)
2.
Componentes Usados em Cada Página
ResponsiveGrid
ResponsiveCard
ResponsiveTable
ResponsiveButton
ResponsiveInput
3.
Features Responsivas Implementadas
Grid adaptativo (1-4 colunas)
Cards com touch targets adequados
Tabelas com scroll horizontal
Botões flutuantes no mobile
Layouts flexíveis
4.
Testes Realizados
Build bem-sucedido
Verificação de imports
Lighthouse mobile score
5.
Problemas Encontrados e Soluções
Liste quaisquer erros encontrados
Explique como foram corrigidos