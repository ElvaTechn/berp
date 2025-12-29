# 📄 Guia de Atualização de Páginas para Neumorphic

## 📋 Status Atual das Páginas

### ✅ **Dashboard (page.tsx)** - COMPLETO
**Status:** ✅ Já implementado com design Neumorphic

**Componentes Usados:**
- ✅ `NeuKPICard` - Stats cards
- ✅ `NeuButton` - Refresh button
- ✅ `NeuCard` - Containers
- ✅ `neu-text-h1` - Títulos
- ✅ `neu-text-caption` - Subtítulos
- ✅ Empty states com Neumorphic

**Características:**
- Background: bg-[var(--neu-base)]
- Grid responsivo: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
- Animações com Framer Motion
- Loading state com DashboardSkeleton
- Auto-refresh a cada 5 minutos

---

### 🔄 **Funcionários (funcionarios/page.tsx)** - PRECISA ATUALIZAÇÃO

**Status Atual:** Usa estilos antigos (bg-white, text-slate, etc.)

#### **Mudanças Necessárias:**

**1. Container Principal:**
```tsx
// Antes:
<div className="min-h-screen bg-white dark:bg-[#050505] p-4 md:p-6">

// Depois:
<div className="min-h-screen bg-[var(--neu-base)] p-4 md:p-6">
```

**2. Header:**
```tsx
// Antes:
<h1 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white mb-2">
  Funcionários
</h1>
<p className="text-slate-600 dark:text-slate-400 font-medium">
  Gerir vendedores e funcionários da empresa
</p>

// Depois:
<h1 className="neu-text-h1">
  Funcionários
</h1>
<p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
  Gerir vendedores e funcionários da empresa
</p>
```

**3. Refresh Button:**
```tsx
// Antes:
<motion.button
  onClick={fetchEmployees}
  disabled={loading}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800..."
>
  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
</motion.button>

// Depois:
<NeuButton
  onClick={fetchEmployees}
  disabled={loading}
  loading={loading}
  variant="convex"
  size="icon"
>
  <RefreshCw className="w-4 h-4" />
</NeuButton>
```

**4. Add Button:**
```tsx
// Antes:
<motion.button
  onClick={() => setShowAddModal(true)}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600..."
>
  <Plus className="w-5 h-5" />
  <span>Adicionar Funcionário</span>
</motion.button>

// Depois:
<NeuButton
  onClick={() => setShowAddModal(true)}
  variant="accent"
  size="md"
>
  <Plus className="w-5 h-5" />
  <span>Adicionar Funcionário</span>
</NeuButton>
```

**5. Search Bar:**
```tsx
// Antes:
<div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900/50 dark:to-slate-900/20 border border-slate-200 dark:border-slate-800...">
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
    <input
      type="text"
      placeholder="Pesquisar por nome ou email..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800..."
    />
  </div>
</div>

// Depois:
<NeuInput
  type="text"
  placeholder="Pesquisar por nome ou email..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  icon={<Search className="w-5 h-5" />}
  variant="concave"
  size="md"
/>
```

**6. Stats Cards:**
```tsx
// Antes:
<div className="rounded-xl p-4 bg-blue-50 dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-blue-500/5 border border-blue-200 dark:border-blue-500/30">
  <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
    Total de Funcionários
  </p>
  <p className="text-3xl font-black text-slate-900 dark:text-white">
    {employees.length}
  </p>
</div>

// Depois:
<NeuCard variant="convex" size="sm">
  <NeuCardContent className="p-4">
    <p className="neu-text-label text-[var(--neu-text-muted)] mb-1">
      Total de Funcionários
    </p>
    <p className="neu-text-h2">
      {employees.length}
    </p>
  </NeuCardContent>
</NeuCard>
```

**7. Employee Table:**
```tsx
// Uso atual: EmployeeTable component
// Atualização necessária no componente EmployeeTable.tsx:
// - Container: usar neu-card variant="concave"
// - Rows: hover neu-surface-hover + neu-convex-xs
// - Actions: usar NeuButton variant="ghost" ou NeuDropdownMenu
```

---

### 🔄 **Inventário (inventory/page.tsx)** - PRECISA ATUALIZAÇÃO

**Status Atual:** Similar à página de Funcionários, usa estilos antigos

#### **Mudanças Necessárias:**

**1. Container e Header:** (mesmo padrão de Funcionários)

**2. Stats Cards (4 cards):**
```tsx
// KPIs específicos:
// - Total produtos
// - Ativos
// - Stock baixo (warning variant)
// - Valor total (success variant)

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <NeuCard variant="convex" size="sm">
    <NeuCardContent className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
          <Package className="w-5 h-5 text-[var(--neu-accent)]" />
        </div>
        <p className="neu-text-label">Total Produtos</p>
      </div>
      <p className="neu-text-h2">{stats.total}</p>
    </NeuCardContent>
  </NeuCard>
  {/* ... outros cards */}
</div>
```

**3. Filters:**
```tsx
// Category filter: usar NeuSelect
<NeuSelect value={filterCategory} onValueChange={setFilterCategory}>
  <NeuSelectTrigger variant="concave" size="md">
    <NeuSelectValue placeholder="Todas as categorias" />
  </NeuSelectTrigger>
  <NeuSelectContent>
    <NeuSelectItem value="all">Todas</NeuSelectItem>
    {categories.map(cat => (
      <NeuSelectItem key={cat.id} value={cat.id}>{cat.name}</NeuSelectItem>
    ))}
  </NeuSelectContent>
</NeuSelect>

// Stock filter: usar NeuSelect
<NeuSelect value={filterStock} onValueChange={setFilterStock}>
  <NeuSelectTrigger variant="concave" size="md">
    <NeuSelectValue placeholder="Filtrar por stock" />
  </NeuSelectTrigger>
  <NeuSelectContent>
    <NeuSelectItem value="all">Todos os stocks</NeuSelectItem>
    <NeuSelectItem value="ok">Stock OK</NeuSelectItem>
    <NeuSelectItem value="low">Stock Baixo</NeuSelectItem>
    <NeuSelectItem value="critical">Esgotado</NeuSelectItem>
  </NeuSelectContent>
</NeuSelect>
```

**4. Add Product Button:**
```tsx
<NeuButton
  onClick={() => setShowAddModal(true)}
  variant="accent"
  size="md"
>
  <Plus className="w-5 h-5" />
  <span>Adicionar Produto</span>
</NeuButton>
```

**5. Product Table:**
```tsx
// ProductTable.tsx precisa usar:
// - Container: NeuCard variant="concave" size="md"
// - Badges para categorias e status
// - NeuDropdownMenu para actions menu
```

---

### 🔄 **Vendas (sales/page.tsx)** - PRECISA ATUALIZAÇÃO

**Status Atual:** Precisa análise (provavelmente usa estilos antigos)

#### **Mudanças Necessárias:**

**1. Stats Cards (3 cards):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <NeuCard variant="convex" size="sm">
    <NeuCardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="neu-text-label">Total Vendas</p>
        <Receipt className="w-5 h-5 text-[var(--neu-accent)]" />
      </div>
      <p className="neu-text-h2">{stats.totalSales}</p>
    </NeuCardContent>
  </NeuCard>
  {/* Vendas Hoje, Receita Hoje */}
</div>
```

**2. Sales Table:**
```tsx
// Usar NeuTable ou criar versão Neumorphic
// Colunas:
// - ID: neu-text-caption font-mono
// - Data/Hora: neu-text-body
// - Vendedor: NeuAvatar + neu-text-body
// - Pagamento: Badge Neumorphic
// - Total: neu-text-h3 font-bold text-[var(--neu-success)]
// - Ações: NeuDropdownMenu
```

**3. Expandable Rows:**
```tsx
// Sale items accordion:
<NeuCard variant="concave" size="sm" className="mt-2">
  <NeuCardContent className="p-3">
    {sale.items.map(item => (
      <div key={item.id} className="flex items-center gap-3 py-2">
        <NeuAvatar size="xs">
          <NeuAvatarImage src={item.product_image} />
          <NeuAvatarFallback>{item.product_name[0]}</NeuAvatarFallback>
        </NeuAvatar>
        <div className="flex-1">
          <p className="neu-text-body">{item.product_name}</p>
          <p className="neu-text-caption">
            {item.quantity} x {item.price_formatted}
          </p>
        </div>
        <p className="neu-text-body font-semibold">
          {item.subtotal_formatted}
        </p>
      </div>
    ))}
  </NeuCardContent>
</NeuCard>
```

**4. Print Button:**
```tsx
<NeuButton
  onClick={() => handlePrint(sale)}
  variant="convex"
  size="sm"
>
  <Printer className="w-4 h-4" />
  <span>Imprimir</span>
</NeuButton>
```

---

## 🎨 **Padrões Neumorphic para Páginas**

### **Container Padrão:**
```tsx
<div className="min-h-screen bg-[var(--neu-base)] p-4 md:p-6">
  <div className="max-w-[1800px] mx-auto space-y-6">
    {/* Conteúdo */}
  </div>
</div>
```

### **Header Padrão:**
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
>
  <div>
    <h1 className="neu-text-h1">Título da Página</h1>
    <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
      Descrição da página
    </p>
  </div>
  
  <div className="flex items-center gap-3">
    <NeuButton variant="convex" size="icon" onClick={refresh}>
      <RefreshCw className="w-4 h-4" />
    </NeuButton>
    <NeuButton variant="accent" size="md" onClick={add}>
      <Plus className="w-5 h-5" />
      <span>Adicionar</span>
    </NeuButton>
  </div>
</motion.div>
```

### **Stats Grid Padrão:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <NeuCard variant="convex" size="sm">
    <NeuCardContent className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--neu-accent)]" />
        </div>
        <p className="neu-text-label">Label</p>
      </div>
      <p className="neu-text-h2">Valor</p>
      <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
        Subtítulo
      </p>
    </NeuCardContent>
  </NeuCard>
</div>
```

### **Search Bar Padrão:**
```tsx
<NeuInput
  type="text"
  placeholder="Pesquisar..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  icon={<Search className="w-5 h-5" />}
  variant="concave"
  size="md"
  className="max-w-md"
/>
```

### **Table Container Padrão:**
```tsx
<NeuCard variant="concave" size="md">
  <NeuCardContent className="p-0 overflow-x-auto">
    <table className="w-full">
      <thead className="bg-[var(--neu-base-light)]">
        <tr>
          <th className="neu-text-label px-4 py-3 text-left">Coluna</th>
        </tr>
      </thead>
      <tbody>
        <tr className="hover:bg-[var(--neu-surface-hover)] hover:neu-convex-xs transition-all">
          <td className="neu-text-body px-4 py-3">Valor</td>
        </tr>
      </tbody>
    </table>
  </NeuCardContent>
</NeuCard>
```

### **Empty State Padrão:**
```tsx
<NeuCard variant="convex" size="lg">
  <NeuCardContent className="text-center py-12">
    <div className="w-20 h-20 mx-auto mb-6 rounded-full neu-surface neu-convex-md flex items-center justify-center">
      <Icon className="w-10 h-10 text-[var(--neu-accent)]" />
    </div>
    <h3 className="neu-text-h2 mb-3">
      Nenhum item encontrado
    </h3>
    <p className="neu-text-body text-[var(--neu-text-muted)] max-w-md mx-auto mb-6">
      Descrição explicativa do estado vazio.
    </p>
    <NeuButton variant="accent" size="md" onClick={action}>
      <Plus className="w-5 h-5" />
      <span>Adicionar Primeiro Item</span>
    </NeuButton>
  </NeuCardContent>
</NeuCard>
```

---

## 📊 **Checklist de Atualização**

### **Dashboard** ✅
- [x] Container com bg-[var(--neu-base)]
- [x] Header com neu-text-h1
- [x] Stats com NeuKPICard
- [x] Charts com NeuCard
- [x] Empty state Neumorphic
- [x] Loading skeleton
- [x] Refresh button

### **Funcionários** 🔄
- [ ] Container com bg-[var(--neu-base)]
- [ ] Header com neu-text-h1
- [ ] Stats com NeuCard
- [ ] Search com NeuInput
- [ ] Add button com NeuButton
- [ ] Refresh button com NeuButton
- [ ] Table com NeuCard
- [ ] Actions com NeuDropdownMenu
- [ ] Empty state Neumorphic

### **Inventário** 🔄
- [ ] Container com bg-[var(--neu-base)]
- [ ] Header com neu-text-h1
- [ ] Stats (4 cards) com NeuCard
- [ ] Search com NeuInput
- [ ] Filters com NeuSelect
- [ ] Add button com NeuButton accent
- [ ] Table com NeuCard concave
- [ ] Stock badges Neumorphic
- [ ] Empty state Neumorphic

### **Vendas** 🔄
- [ ] Container com bg-[var(--neu-base)]
- [ ] Header com neu-text-h1
- [ ] Stats (3 cards) com NeuCard
- [ ] Table com NeuCard concave
- [ ] Expandable rows Neumorphic
- [ ] Print button com NeuButton
- [ ] Payment badges Neumorphic
- [ ] Empty state Neumorphic

---

## 🚀 **Prioridades de Atualização**

### **Fase 1 (Crítica):**
1. ✅ Dashboard - JÁ COMPLETO
2. 🔄 Funcionários - Header, buttons, search
3. 🔄 Inventário - Header, buttons, filters

### **Fase 2 (Importante):**
4. 🔄 Funcionários - Stats cards, table
5. 🔄 Inventário - Stats cards, table
6. 🔄 Vendas - Header, stats, table

### **Fase 3 (Polish):**
7. Empty states em todas as páginas
8. Loading skeletons
9. Animações de transição
10. Dark mode validation

---

## 📚 **Referências**

- **Componentes:** `src/components/ui/neu-*.tsx`
- **Design System:** `src/app/globals.css`
- **Exemplos:** Dashboard já implementado
- **Guias:** `NEUMORPHIC_*.md` files

---

**Criado:** 28/12/2025  
**Status:** 🔄 Em Progresso  
**Versão:** 1.0.0
