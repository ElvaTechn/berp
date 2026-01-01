# Prompt Otimizado: Melhoria de Responsividade Mobile no BizControl 360

## OBJETIVO

Melhorar a experiencia mobile e tablet do ERP BizControl 360 **mantendo a consistência visual**, integrando os hooks responsivos criados (`useViewport`, `useOrientation`) e otimizando layouts existentes usando componentes já estabelecidos (Neu* components, ProductTable, TrendChart, etc).

## PRINCÍPIOS

✅ Integração com design system neumórfico existente
✅ Reutilização de componentes Neu* (NeuCard, NeuButton, NeuInput, NeuSelect)
✅ Manter componentes especializados (TrendChart, TopProductsRanking, ProductTable)
✅ Usar hooks de viewport para lógica condicional
✅ Melhorar gaps, padding e font sizes para mobile
✅ Implementar touch targets adequados (≥44px)
✅ Não duplicar código desnecessariamente

---

## PASSOS DE IMPLEMENTAÇÃO

### 1. Dashboard - Ajustes Mobile-First

**Arquivo:** `src/app/dashboard/page.tsx`

**Metas:**
- Botões de ação ocultos em mobile, visíveis em desktop
- KPI grid otimizado para todas as dimensões
- Chart container responsivo com altura adaptativa
- Botão flutuante "Nova Venda" para mobile

**Implementação:**

```tsx
// Adicionar import
import { useViewport } from '@/hooks/useViewport';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  // ... código existente ...

  // Adicionar hook de viewport
  const { width, isMobile, isTablet } = useViewport();

  // Ajuste dinâmico de altura do chart
  const chartHeight = useMemo(() => {
    if (isMobile) return 250;
    if (isTablet) return 300;
    return 400;
  }, [isMobile, isTablet]);

  // ... código existente ...

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="neu-text-h1 text-xl sm:text-2xl lg:text-3xl">Dashboard</h1>
          <p className="neu-text-caption mt-1">Visão em tempo real do seu negócio</p>
        </div>

        {/* Botão de refresh - Mobile: Ícone apenas, Desktop: Completo */}
        <NeuButton
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          variant="accent"
          size={isMobile ? "sm" : "md"}
          loading={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className={isMobile ? "sr-only" : "hidden sm:inline ml-2"}>
            {refreshing ? "Atualizando..." : "Atualizar"}
          </span>
        </NeuButton>
      </motion.div>

      {/* KPI Grid - Otimização de breakpoints */}
      <div
        className="w-full gap-3 sm:gap-4 lg:gap-6"
        style={{
          gridTemplateColumns: isMobile
            ? '1fr'
            : isTablet
            ? 'repeat(2, 1fr)'
            : 'repeat(auto-fit, minmax(220px, 1fr))',
          display: 'grid'
        }}
      >
        {/* Cards de KPI existentes (NeuKPICard) */}
        <NeuKPICard {...props} />
        {/* ... outros KPIs ... */}
      </div>

      {/* Main Chart - Altura adaptativa */}
      <NeuCard variant="convex" size="md" className="w-full">
        <NeuCardHeader>
          <NeuCardTitle className="text-base sm:text-lg">Tendência de Vendas (7 dias)</NeuCardTitle>
        </NeuCardHeader>
        <NeuCardContent style={{ minHeight: chartHeight }}>
          <TrendChart data={data?.trend || []} isMobile={isMobile} />
        </NeuCardContent>
      </NeuCard>

      {/* Bottom Grid - Responsivo */}
      <div className={`w-full grid gap-4 lg:gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Top Products */}
        <NeuCard variant="convex" size="md">
          <NeuCardHeader>
            <NeuCardTitle className="text-base sm:text-lg">Produtos Mais Vendidos</NeuCardTitle>
          </NeuCardHeader>
          <NeuCardContent>
            <TopProductsRanking products={data?.top_products || []} limit={isMobile ? 3 : 5} />
          </NeuCardContent>
        </NeuCard>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Payment Distribution */}
          <NeuCard variant="convex" size="md">
            <NeuCardHeader>
              <NeuCardTitle className="text-base sm:text-lg">Distribuição de Pagamentos</NeuCardTitle>
            </NeuCardHeader>
            <NeuCardContent>
              <PaymentDistribution distribution={data?.payment_distribution || []} />
            </NeuCardContent>
          </NeuCard>

          {/* Inventory Alerts */}
          <NeuCard variant="convex" size="md">
            <NeuCardHeader>
              <NeuCardTitle className="text-base sm:text-lg">Alertas de Stock</NeuCardTitle>
            </NeuCardHeader>
            <NeuCardContent>
              <InventoryAlerts alerts={data?.inventory_alerts || []} limit={isMobile ? 2 : 3} />
            </NeuCardContent>
          </NeuCard>
        </div>
      </div>

      {/* Botão flutuante para mobile - Nova Venda */}
      {isMobile && (
        <motion.button
          onClick={() => router.push('/pos')}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full neu-surface neu-convex-lg flex items-center justify-center shadow-xl z-50 touch-target tap-highlight-transparent"
        >
          <ShoppingCart className="w-6 h-6 text-[var(--neu-accent)]" />
        </motion.button>
      )}
    </div>
  );
}
```

**Mudanças no TrendChart Component:**

Arquivo: `src/components/dashboard/TrendChart.tsx`

```tsx
// Adicionar prop isMobile
interface TrendChartProps {
  data: Array<{date: string; revenue: number; profit: number}>;
  isMobile?: boolean;
}

export function TrendChart({ data, isMobile = false }: TrendChartProps) {
  // Ajustar tamanho da fonte e altura baseado em isMobile
  const fontSize = isMobile ? 10 : 12;
  const strokeWidth = isMobile ? 2 : 3;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          tick={{ fontSize }}
          tickMargin={8}
          height={isMobile ? 20 : 30}
        />
        <YAxis
          tick={{ fontSize }}
          tickMargin={8}
          width={isMobile ? 40 : 60}
        />
        <Tooltip
          formatter={(value: number) => value.toLocaleString('pt-MZ', {minimumFractionDigits: 0}) + ' MT'}
          contentStyle={{
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: isMobile ? '12px' : '14px'
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: isMobile ? 3 : 4 }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          dot={{ fill: '#10b981', strokeWidth: 2, r: isMobile ? 3 : 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### 2. Inventory - Melhoria na Tabela Mobile

**Arquivo:** `src/app/inventory/page.tsx`

**Metas:**
- Tabela com scroll horizontal suave
- Cards de stats com melhor spacing em mobile
- Filtros empilhados em mobile, lado a lado em desktop
- Indicador visual de scroll na tabela

**Implementação:**

```tsx
import { useViewport } from '@/hooks/useViewport';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const { isMobile, isTablet } = useViewport();
  const router = useRouter();

  // ... código existente ...

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsivo */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="neu-text-h1 text-xl sm:text-2xl lg:text-3xl">Inventário</h1>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Controle total do seu stock
          </p>
        </div>

        {/* Botão Adicionar - Full width no mobile */}
        <NeuButton
          onClick={() => router.push('/inventory/add')}
          variant="accent"
          className={isMobile ? "w-full" : ""}
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Produto</span>
        </NeuButton>
      </motion.div>

      {/* Statistics Cards - Ajuste de layout */}
      <motion.div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Total Products */}
        <NeuCard variant="convex" size="sm">
          <NeuCardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center touch-target">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--neu-accent)]" />
              </div>
              <p className="neu-text-label text-[var(--neu-text-muted)] text-xs sm:text-sm">Total</p>
            </div>
            <p className={`neu-text-h2 ${isMobile ? 'text-xl' : ''}`}>{stats.total}</p>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1 text-xs">
              Produtos
            </p>
          </NeuCardContent>
        </NeuCard>
        {/* ... outros stats ... */}
      </motion.div>

      {/* Filters - Empilhados no mobile */}
      <motion.div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row sm:flex-row'}`}>
        <div className="flex-1">
          <NeuInput
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        <NeuSelect value={filterStock} onValueChange={setFilterStock}>
          <NeuSelectTrigger variant="concave" size="md" className={isMobile ? "w-full" : "w-full sm:w-[200px]"}>
            <NeuSelectValue placeholder="Stock..." />
          </NeuSelectTrigger>
          <NeuSelectContent>
            <NeuSelectItem value="all">Todos</NeuSelectItem>
            <NeuSelectItem value="ok">OK</NeuSelectItem>
            <NeuSelectItem value="low">Baixo</NeuSelectItem>
            <NeuSelectItem value="critical">Esgotado</NeuSelectItem>
          </NeuSelectContent>
        </NeuSelect>
      </motion.div>

      {/* Products Table - Scroll wrapper com indicador */}
      <motion.div className="relative">
        {/* Indicador de scroll horizontal (apenas mobile/tablet) */}
        {(isMobile || isTablet) && products.length > 5 && (
          <div className="flex justify-center mb-2">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">
              ← Deslize para mais →
            </span>
          </div>
        )}

        <div className="-mx-4 sm:mx-0 overflow-x-auto scrollbar-hide">
          <ProductTable
            products={filteredProducts}
            isMobile={isMobile}
            onEdit={(product) => {
              setEditingProduct(product);
              setShowEditModal(true);
            }}
            onDelete={handleProductDeleted}
          />
        </div>
      </motion.div>

      {/* Modais existentes mantidos */}
      <AddProductModal />
      <EditProductModal />
    </div>
  );
}
```

**Ajuste no ProductTable Component:**

Adicionar prop `isMobile` e ajustar colunas visíveis:

```tsx
interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: () => void;
  isMobile?: boolean;
}

export function ProductTable({ products, onEdit, onDelete, isMobile = false }: ProductTableProps) {
  // Colunas configuráveis
  const visibleColumns = isMobile
    ? ['name', 'quantity', 'actions']  // Mobile: reduzido
    : ['name', 'sku', 'category', 'quantity', 'price', 'actions'];  // Desktop: completo

  return (
    <table className="min-w-full">
      {/* ... implementação ... */}
    </table>
  );
}
```

---

### 3. POS - Carrinho Adaptativo para Mobile

**Arquivo:** `src/app/sales/pos/page.tsx`

**Metas:**
- Em mobile: Grid de produtos, carrinho em modal/drawer
- Em desktop: Layout lado a lado (atual)
- Botões de ação com touch targets adequados
- Sugestão de produtos swipeable

**Implementação:**

```tsx
import { useViewport, useOrientation } from '@/hooks/useViewport';
import { AnimatePresence } from 'framer-motion';

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const { isMobile, isTablet } = useViewport();
  const orientation = useOrientation();

  // ... código existente ...

  // Layout ajustado baseado em viewport
  const isSplitLayout = !isMobile && !isTablet;
  const productsGridCols = isMobile ? 2 : isTablet ? 3 : 4;

  return (
    <div className="min-h-screen bg-[var(--neu-base)] p-4 lg:p-8">
      {/* Header */}
      <motion.div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="neu-text-h1 text-xl sm:text-2xl lg:text-3xl">Ponto de Venda</h1>
            <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">Sistema de alta performance</p>
          </div>

          {/* Botão abrir carrinho (mobile) */}
          {isMobile && (
            <NeuButton
              onClick={() => setShowMobileCart(true)}
              variant="convex"
              size="icon"
              className="relative touch-target"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--neu-accent)] text-white text-xs font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              </NeuButton>
          )}
        </div>
      </motion.div>

      {/* Layout Baseado em Viewport */}
      {isSplitLayout ? (
        // Desktop: Lado a lado
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Products */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
          </div>
          {/* Cart */}
          <CartPanel cart={cart} onUpdate={updateQuantity} onRemove={removeFromCart} />
        </div>
      ) : (
        // Mobile/Tablet: Produtos em tela cheia, cart em modal
        <>
          <NeuCard variant="flat" className="h-[calc(100vh-180px)] overflow-hidden">
            <NeuCardContent className="h-full overflow-y-auto p-4">
              <ProductGrid products={filteredProducts} columns={productsGridCols} onAddToCart={addToCart} />
            </NeuCardContent>
          </NeuCard>

          {/* Carrinho Mobile (Drawer/Modal) */}
          <AnimatePresence>
            {showMobileCart && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  onClick={() => setShowMobileCart(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 h-[80vh] bg-[var(--neu-base)] rounded-t-3xl z-50 overflow-hidden
                    safe-area-top"
                >
                  {/* Header com drag handle */}
                  <div className="flex justify-center pt-3 pb-2 safe-area-top">
                    <div className="w-12 h-1.5 rounded-full bg-[var(--neu-border)]" />
                  </div>

                  {/* Conteúdo do carrinho */}
                  <div className="h-[calc(100%-2rem)] flex flex-col">
                    <CartPanel
                      cart={cart}
                      onUpdate={updateQuantity}
                      onRemove={removeFromCart}
                      onClose={() => setShowMobileCart(false)}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Botão flutuante do carrinho no grid */}
          {isMobile && cart.length > 0 && (
            <motion.button
              onClick={() => setShowMobileCart(true)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="fixed bottom-6 right-6 w-16 h-16 rounded-full neu-surface neu-convex-lg flex items-center justify-center shadow-xl z-30 touch-target"
            >
              <ShoppingCart className="w-7 h-7 text-[var(--neu-accent)]" />
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--neu-accent)] text-white text-sm font-bold">
                {cart.length}
              </span>
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}
```

---

### 4. Reports - Chart Responsivo

**Arquivo:** `src/app/reports/page.tsx`

**Metas:**
- Charts com altura adaptativa
- Filtros acessíveis no mobile
- Cards de stats compactos em telas pequenas

**Implementação:**

```tsx
import { useViewport } from '@/hooks/useViewport';

export default function Reports() {
  const { isMobile, isTablet } = useViewport();

  // ... código existente ...

  // Altura do chart adaptativa
  const chartHeight = useMemo(() => {
    if (isMobile) return 200;
    if (isTablet) return 250;
    return 300;
  }, [isMobile, isTablet]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={isMobile ? "Relatórios" : "Relatórios"}
        description={isMobile ? "" : "Análise detalhada das suas vendas"}
        action={
          <div className={isMobile ? "w-full" : ""}>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">7 Dias</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Stats Grid - Ajustado */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        <StatsCard {...statsCardProps} iconSize={isMobile ? "sm" : "md"} />
        {/* ... outros cards ... */}
      </div>

      {/* Charts - Altura responsiva */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Line Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Evolução das Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ minHeight: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  {/* ... config */}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ minHeight: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* ... config */}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Lista compacta para mobile */}
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
            {stats.topProducts.slice(0, isMobile ? 5 : 10).map((p, i) => (
              <ProductRankingItem key={i} product={p} rank={i + 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## VERIFICAÇÃO E TESTES

### Checklist de Validação

- [ ] **Dashboard**
  - [ ] KPI cards adaptam layout entre mobile/tablet/desktop
  - [ ] Chart escala corretamente em todas as dimensões
  - [ ] Botão flutuante "Nova Venda" aparece apenas no mobile
  - [ ] Textos truncados com ellipse quando necessário

- [ ] **Inventory**
  - [ ] Tabela tem scroll horizontal suave em mobile
  - [ ] Indicador de scroll aparece em telas pequenas
  - [ ] Filtros empilhados no mobile, lado a lado em desktop
  - [ ] Botão "Adicionar" tem largura total no mobile

- [ ] **POS**
  - [ ] Layout lado a lado em desktop
  - [ ] Carrinho em drawer/modal no mobile
  - [ ] Botão flutuante mostra contador de itens
  - [ ] Grid de produtos ajusta colunas por viewport

- [ ] **Reports**
  - [ ] Charts com altura adaptativa
  - [ ] Filtros acessíveis no mobile
  - [ ] Legendas de gráficos legíveis em telas pequenas

### Testes de Performance Mobile

```bash
# Build para produção
npm run build

# Verificar Lighthouse (usar Chrome DevTools)
# - Performance ≥ 90
# - Accessibility ≥ 95
# - Best Practices ≥ 90

# Testar em diferentes dimensões:
# - 375x667 (iPhone SE)
# - 390x844 (iPhone 12)
# - 430x932 (iPhone 14 Pro Max)
# - 768x1024 (iPad)
# - 1024x768 (Tablet landscape)
```

---

## ENTREGÁVEIS

1. **4 arquivos modificados:**
   - src/app/dashboard/page.tsx
   - src/app/inventory/page.tsx
   - src/app/sales/pos/page.tsx
   - src/app/reports/page.tsx

2. **Componentes ajustados:**
   - TrendChart (prop isMobile)
   - ProductTable (prop isMobile)
   - TopProductsRanking (prop limit)

3. **Integração de hooks:**
   - useViewport em todas as páginas
   - useOrientation no POS

4. **Melhorias responsivas:**
   - Layouts adaptativos
   - Font sizes escaláveis
   - Touch targets adequados
   - Safe areas para notched phones
   - Indicadores de scroll

---

Esta abordagem **mantém a consistência**, **reutiliza componentes existentes**, e **melhora a responsividade** sem duplicação de código.
