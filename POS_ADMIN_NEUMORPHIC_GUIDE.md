# 🎨 Guia de Atualização POS e Admin para Neumorphic

## 📋 Páginas Restantes para Atualização

### **POS (Point of Sale):**
- `src/app/sales/pos/page.tsx` - Página principal do PDV

### **Admin (10 páginas):**
1. `src/app/admin/page.tsx` - Admin Dashboard
2. `src/app/admin/audit/page.tsx` - Audit Log
3. `src/app/admin/backup/page.tsx` - Backup
4. `src/app/admin/companies/page.tsx` - Companies
5. `src/app/admin/dashboard/page.tsx` - Dashboard Admin
6. `src/app/admin/settings/page.tsx` - Settings
7. `src/app/admin/subscriptions/page.tsx` - Subscriptions
8. `src/app/admin/system/page.tsx` - System Settings
9. `src/app/admin/layout.tsx` - Layout
10. `src/components/admin/ImpersonationBanner.tsx` - Banner

---

## 🛒 **POS (Point of Sale) - Atualização Detalhada**

### **Estrutura Atual vs Nova:**

**Layout:**
```tsx
// ANTES: Grid tradicional
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Products: 2/3 */}
  {/* Cart: 1/3 */}
</div>

// DEPOIS: Grid Neumorphic
<div className="min-h-screen bg-[var(--neu-base)] p-4">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Products */}
    <NeuCard variant="flat" className="lg:col-span-2">
      {/* ... */}
    </NeuCard>
    
    {/* Cart */}
    <NeuCard variant="concave">
      {/* ... */}
    </NeuCard>
  </div>
</div>
```

---

### **1. Product Grid (2/3 width):**

**Search Bar:**
```tsx
<NeuInput
  ref={searchInputRef}
  type="text"
  placeholder="Buscar produtos... (F2)"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  icon={<Search className="w-5 h-5" />}
  variant="concave"
  size="md"
/>
```

**Category Filters (Tabs):**
```tsx
// Opção 1: Usar buttons
<div className="flex gap-2 overflow-x-auto pb-2">
  {categories.map(cat => (
    <NeuButton
      key={cat.id}
      variant={selectedCategory === cat.id ? "concave" : "convex"}
      size="sm"
      onClick={() => setSelectedCategory(cat.id)}
    >
      {cat.name}
    </NeuButton>
  ))}
</div>

// Opção 2: Pills Neumorphic
<div className="flex gap-2 flex-wrap">
  {categories.map(cat => (
    <button
      key={cat.id}
      onClick={() => setSelectedCategory(cat.id)}
      className={cn(
        "px-4 py-2 rounded-xl transition-all",
        selectedCategory === cat.id 
          ? "neu-surface neu-concave-sm text-[var(--neu-accent)]"
          : "neu-surface neu-convex-xs hover:neu-convex-sm"
      )}
    >
      <span className="neu-text-body">{cat.name}</span>
    </button>
  ))}
</div>
```

**Product Cards:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
  {filteredProducts.map(product => (
    <NeuCard
      key={product.id}
      variant="convex"
      size="sm"
      className="cursor-pointer hover:scale-105 transition-transform"
      onClick={() => addToCart(product)}
    >
      <NeuCardContent className="p-3 space-y-2">
        {/* Product Image/Avatar */}
        <div className="w-full aspect-square rounded-xl neu-surface neu-convex-md flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-[var(--neu-text-muted)]" />
          )}
        </div>
        
        {/* Product Name */}
        <p className="neu-text-body font-medium truncate" title={product.name}>
          {product.name}
        </p>
        
        {/* Price */}
        <p className="neu-text-h3 font-bold text-[var(--neu-accent)]">
          {product.price.toLocaleString('pt-MZ', {
            minimumFractionDigits: 2
          })} MT
        </p>
        
        {/* Stock Badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-1 rounded-lg text-xs font-bold neu-convex-xs",
              product.quantity > product.min_stock 
                ? "text-[var(--neu-success)]"
                : "text-[var(--neu-warning)]"
            )}
          >
            Stock: {product.quantity}
          </span>
        </div>
      </NeuCardContent>
    </NeuCard>
  ))}
</div>
```

**Empty State:**
```tsx
{filteredProducts.length === 0 && (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="w-20 h-20 rounded-full neu-surface neu-convex-md flex items-center justify-center mb-6">
      <Package className="w-10 h-10 text-[var(--neu-accent)]" />
    </div>
    <h3 className="neu-text-h2 mb-3">Nenhum produto encontrado</h3>
    <p className="neu-text-body text-[var(--neu-text-muted)] text-center">
      Tente ajustar sua busca ou filtros
    </p>
  </div>
)}
```

---

### **2. Cart Sidebar (1/3 width):**

**Cart Header:**
```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="neu-text-h2">Carrinho</h2>
  <div className="px-3 py-1 rounded-xl neu-surface neu-convex-xs">
    <span className="neu-text-body font-bold">{cart.length} items</span>
  </div>
</div>
```

**Cart Items:**
```tsx
<div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
  {cart.map(item => (
    <NeuCard key={item.product.id} variant="convex" size="sm">
      <NeuCardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <p className="neu-text-body font-medium truncate">
              {item.product.name}
            </p>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">
              {item.product.price.toLocaleString('pt-MZ')} MT
            </p>
          </div>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <NeuButton
              variant="convex"
              size="icon"
              onClick={() => decrementQuantity(item.product.id)}
            >
              <Minus className="w-4 h-4" />
            </NeuButton>
            
            <span className="neu-text-body font-bold min-w-[2rem] text-center">
              {item.quantity}
            </span>
            
            <NeuButton
              variant="convex"
              size="icon"
              onClick={() => incrementQuantity(item.product.id)}
            >
              <Plus className="w-4 h-4" />
            </NeuButton>
          </div>
          
          {/* Remove Button */}
          <NeuButton
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.product.id)}
          >
            <X className="w-4 h-4" />
          </NeuButton>
        </div>
        
        {/* Subtotal */}
        <div className="mt-2 pt-2 border-t border-[var(--neu-border)]">
          <div className="flex justify-between items-center">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">
              Subtotal:
            </span>
            <span className="neu-text-body font-bold">
              {(item.product.price * item.quantity).toLocaleString('pt-MZ', {
                minimumFractionDigits: 2
              })} MT
            </span>
          </div>
        </div>
      </NeuCardContent>
    </NeuCard>
  ))}
</div>
```

**Cart Empty State:**
```tsx
{cart.length === 0 && (
  <div className="flex flex-col items-center justify-center h-48">
    <div className="w-16 h-16 rounded-full neu-surface neu-convex-md flex items-center justify-center mb-4">
      <ShoppingCart className="w-8 h-8 text-[var(--neu-accent)]" />
    </div>
    <p className="neu-text-body text-[var(--neu-text-muted)] text-center">
      Carrinho vazio
    </p>
    <p className="neu-text-caption text-[var(--neu-text-muted)] text-center mt-1">
      Adicione produtos para começar
    </p>
  </div>
)}
```

**Cart Summary:**
```tsx
<div className="space-y-3 mt-4 pt-4 border-t border-[var(--neu-border)]">
  {/* Discount Input */}
  <div className="flex items-center gap-2">
    <NeuInput
      type="number"
      placeholder="Desconto %"
      value={discount}
      onChange={(e) => setDiscount(e.target.value)}
      icon={<Percent className="w-4 h-4" />}
      variant="concave"
      size="sm"
    />
  </div>
  
  {/* Subtotal */}
  <div className="flex justify-between items-center">
    <span className="neu-text-body">Subtotal:</span>
    <span className="neu-text-body font-bold">
      {subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
    </span>
  </div>
  
  {/* Discount */}
  {discount > 0 && (
    <div className="flex justify-between items-center">
      <span className="neu-text-body text-[var(--neu-warning)]">
        Desconto ({discount}%):
      </span>
      <span className="neu-text-body font-bold text-[var(--neu-warning)]">
        -{discountAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
      </span>
    </div>
  )}
  
  {/* IVA */}
  <div className="flex justify-between items-center">
    <span className="neu-text-body">IVA (17%):</span>
    <span className="neu-text-body font-bold">
      {iva.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
    </span>
  </div>
  
  {/* Total */}
  <div className="flex justify-between items-center pt-3 border-t border-[var(--neu-border)]">
    <span className="neu-text-h2">Total:</span>
    <span className="neu-text-h2 text-[var(--neu-success)]">
      {total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
    </span>
  </div>
</div>
```

---

### **3. Payment Method Selector:**

```tsx
<div className="mt-4">
  <p className="neu-text-label mb-3">Método de Pagamento:</p>
  <div className="grid grid-cols-2 gap-2">
    {paymentMethods.map(method => (
      <NeuButton
        key={method.id}
        variant={selectedPayment === method.id ? "concave" : "convex"}
        size="md"
        onClick={() => setSelectedPayment(method.id)}
        className="flex flex-col items-center gap-2 p-4"
      >
        <method.icon className="w-6 h-6" />
        <span className="neu-text-caption">{method.label}</span>
      </NeuButton>
    ))}
  </div>
</div>

// Payment Methods:
const paymentMethods = [
  { id: 'DINHEIRO', label: 'Dinheiro', icon: DollarSign },
  { id: 'MPESA', label: 'M-Pesa', icon: CreditCard },
  { id: 'EMOLA', label: 'e-Mola', icon: CreditCard },
  { id: 'CARTAO', label: 'Cartão', icon: CreditCard },
  { id: 'MULTICAIXA', label: 'Multicaixa', icon: CreditCard },
  { id: 'TRANSFERENCIA', label: 'Transferência', icon: CreditCard },
];
```

---

### **4. Finalizar Venda Button:**

```tsx
<NeuButton
  variant="accent"
  size="lg"
  onClick={handleCheckout}
  disabled={cart.length === 0 || !selectedPayment || isCheckingOut}
  loading={isCheckingOut}
  className={cn(
    "w-full mt-4",
    cart.length > 0 && "animate-pulse"
  )}
>
  <CheckCircle className="w-6 h-6" />
  <span>FINALIZAR VENDA (F9)</span>
  <span className="ml-auto font-bold">
    {total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
  </span>
</NeuButton>
```

---

### **5. Keyboard Shortcuts Display:**

```tsx
<div className="mt-4 p-3 rounded-xl neu-surface neu-concave-sm">
  <p className="neu-text-label mb-2">Atalhos:</p>
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="neu-text-caption text-[var(--neu-text-muted)]">
        Buscar
      </span>
      <kbd className="px-2 py-1 rounded neu-surface neu-convex-xs neu-text-caption">
        F2
      </kbd>
    </div>
    <div className="flex justify-between items-center">
      <span className="neu-text-caption text-[var(--neu-text-muted)]">
        Finalizar
      </span>
      <kbd className="px-2 py-1 rounded neu-surface neu-convex-xs neu-text-caption">
        F9
      </kbd>
    </div>
  </div>
</div>
```

---

### **6. Success Modal:**

```tsx
<NeuDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
  <NeuDialogContent size="md">
    <NeuDialogHeader>
      <div className="w-16 h-16 rounded-full neu-surface neu-convex-md flex items-center justify-center mx-auto mb-4 bg-[var(--neu-success)]">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <NeuDialogTitle className="text-center">
        Venda Finalizada!
      </NeuDialogTitle>
      <NeuDialogDescription className="text-center">
        Venda #{lastSaleId?.slice(0, 8)} registrada com sucesso
      </NeuDialogDescription>
    </NeuDialogHeader>
    
    <div className="space-y-3">
      <NeuButton
        variant="accent"
        size="lg"
        onClick={() => {
          window.open(`/api/sales/${lastSaleId}/receipt`, '_blank');
          setShowSuccessModal(false);
        }}
        className="w-full"
      >
        Imprimir Recibo
      </NeuButton>
      
      <NeuButton
        variant="convex"
        size="md"
        onClick={() => setShowSuccessModal(false)}
        className="w-full"
      >
        Nova Venda
      </NeuButton>
    </div>
  </NeuDialogContent>
</NeuDialog>
```

---

## 🔐 **Admin Pages - Atualização Detalhada**

### **Padrão Geral para Todas as Páginas Admin:**

**Container:**
```tsx
<div className="min-h-screen bg-[var(--neu-base)] p-4 md:p-6">
  <div className="max-w-[1800px] mx-auto space-y-6">
    {/* Content */}
  </div>
</div>
```

**Header:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="neu-text-h1">Página Admin</h1>
    <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
      Descrição
    </p>
  </div>
  
  <div className="flex items-center gap-3">
    {/* Action buttons */}
  </div>
</div>
```

---

### **1. Admin Dashboard (`/admin/page.tsx`):**

**Stats Cards:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Total Empresas */}
  <NeuCard variant="convex" size="sm">
    <NeuCardContent className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
          <Building className="w-5 h-5 text-[var(--neu-accent)]" />
        </div>
        <p className="neu-text-label">Empresas</p>
      </div>
      <p className="neu-text-h2">{stats.companies}</p>
    </NeuCardContent>
  </NeuCard>
  
  {/* Usuários, Vendas, Produtos... */}
</div>
```

**Companies Table:**
```tsx
<NeuCard variant="concave" size="md">
  <NeuCardContent className="p-0 overflow-x-auto">
    <table className="w-full">
      <thead className="bg-[var(--neu-base)]">
        <tr className="border-b border-[var(--neu-border)]">
          <th className="px-6 py-4 text-left neu-text-label">Nome</th>
          <th className="px-6 py-4 text-left neu-text-label">NUIT</th>
          <th className="px-6 py-4 text-left neu-text-label">Contato</th>
          <th className="px-6 py-4 text-right neu-text-label">Ações</th>
        </tr>
      </thead>
      <tbody>
        {companies.map(company => (
          <tr
            key={company.id}
            className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)] transition-all"
          >
            <td className="px-6 py-4 neu-text-body">{company.name}</td>
            <td className="px-6 py-4 neu-text-body">{company.nuit}</td>
            <td className="px-6 py-4 neu-text-body">{company.contact}</td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <NeuButton variant="convex" size="icon">
                  <Eye className="w-4 h-4" />
                </NeuButton>
                <NeuButton variant="convex" size="icon">
                  <Edit className="w-4 h-4" />
                </NeuButton>
                <NeuButton variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-[var(--neu-error)]" />
                </NeuButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </NeuCardContent>
</NeuCard>
```

---

### **2. Audit Log (`/admin/audit/page.tsx`):**

**Filters:**
```tsx
<div className="flex flex-col sm:flex-row gap-3">
  {/* Date Range */}
  <div className="flex gap-2 flex-1">
    <NeuInput
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      variant="concave"
      size="sm"
    />
    <NeuInput
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      variant="concave"
      size="sm"
    />
  </div>
  
  {/* Action Type */}
  <NeuSelect value={actionType} onValueChange={setActionType}>
    <NeuSelectTrigger variant="concave" size="sm" className="w-[180px]">
      <NeuSelectValue placeholder="Tipo de ação" />
    </NeuSelectTrigger>
    <NeuSelectContent>
      <NeuSelectItem value="all">Todas</NeuSelectItem>
      <NeuSelectItem value="CREATE">Criar</NeuSelectItem>
      <NeuSelectItem value="UPDATE">Atualizar</NeuSelectItem>
      <NeuSelectItem value="DELETE">Excluir</NeuSelectItem>
    </NeuSelectContent>
  </NeuSelect>
  
  {/* User Filter */}
  <NeuSelect value={userId} onValueChange={setUserId}>
    <NeuSelectTrigger variant="concave" size="sm" className="w-[180px]">
      <NeuSelectValue placeholder="Usuário" />
    </NeuSelectTrigger>
    <NeuSelectContent>
      <NeuSelectItem value="all">Todos</NeuSelectItem>
      {/* ... users */}
    </NeuSelectContent>
  </NeuSelect>
</div>
```

**Audit Table:**
```tsx
<NeuCard variant="concave" size="md">
  <NeuCardContent className="p-0 overflow-x-auto">
    <table className="w-full">
      <thead className="bg-[var(--neu-base)]">
        <tr className="border-b border-[var(--neu-border)]">
          <th className="px-6 py-4 text-left neu-text-label">Timestamp</th>
          <th className="px-6 py-4 text-left neu-text-label">Usuário</th>
          <th className="px-6 py-4 text-left neu-text-label">Ação</th>
          <th className="px-6 py-4 text-left neu-text-label">Recurso</th>
          <th className="px-6 py-4 text-left neu-text-label">Status</th>
          <th className="px-6 py-4 text-center neu-text-label">Detalhes</th>
        </tr>
      </thead>
      <tbody>
        {auditLogs.map(log => (
          <React.Fragment key={log.id}>
            <tr className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)]">
              <td className="px-6 py-4">
                <span className="neu-text-caption font-mono">
                  {formatDate(log.created_at)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <p className="neu-text-body">{log.user.name}</p>
                  <p className="neu-text-caption text-[var(--neu-text-muted)] font-mono">
                    {log.ip_address}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold",
                    log.action === 'CREATE' && "text-[var(--neu-success)]",
                    log.action === 'UPDATE' && "text-[var(--neu-accent)]",
                    log.action === 'DELETE' && "text-[var(--neu-error)]"
                  )}
                >
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 neu-text-body">{log.resource}</td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold",
                    log.status === 'SUCCESS' && "text-[var(--neu-success)]",
                    log.status === 'ERROR' && "text-[var(--neu-error)]"
                  )}
                >
                  {log.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <NeuButton
                  variant="convex"
                  size="icon"
                  onClick={() => toggleDetails(log.id)}
                >
                  <ChevronDown className="w-4 h-4" />
                </NeuButton>
              </td>
            </tr>
            
            {/* Expanded Details */}
            {expandedLogId === log.id && (
              <tr>
                <td colSpan={6} className="px-6 py-4 bg-[var(--neu-base)]">
                  <div className="p-3 rounded-xl neu-surface neu-concave-sm">
                    <pre className="neu-text-caption font-mono text-[var(--neu-text-muted)] overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </NeuCardContent>
</NeuCard>
```

---

### **3. Subscriptions (`/admin/subscriptions/page.tsx`):**

**Filter:**
```tsx
<div className="flex gap-3">
  <NeuSelect value={statusFilter} onValueChange={setStatusFilter}>
    <NeuSelectTrigger variant="concave" size="md">
      <NeuSelectValue placeholder="Status" />
    </NeuSelectTrigger>
    <NeuSelectContent>
      <NeuSelectItem value="all">Todos</NeuSelectItem>
      <NeuSelectItem value="ACTIVE">Ativo</NeuSelectItem>
      <NeuSelectItem value="EXPIRED">Expirado</NeuSelectItem>
      <NeuSelectItem value="CANCELLED">Cancelado</NeuSelectItem>
    </NeuSelectContent>
  </NeuSelect>
  
  <NeuSelect value={planFilter} onValueChange={setPlanFilter}>
    <NeuSelectTrigger variant="concave" size="md">
      <NeuSelectValue placeholder="Plano" />
    </NeuSelectTrigger>
    <NeuSelectContent>
      <NeuSelectItem value="all">Todos</NeuSelectItem>
      <NeuSelectItem value="BASIC">Básico</NeuSelectItem>
      <NeuSelectItem value="PRO">Pro</NeuSelectItem>
      <NeuSelectItem value="ENTERPRISE">Enterprise</NeuSelectItem>
    </NeuSelectContent>
  </NeuSelect>
</div>
```

**Subscription Cards:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {subscriptions.map(sub => (
    <NeuCard key={sub.id} variant="convex" size="md">
      <NeuCardContent className="p-4 space-y-3">
        {/* Company Info */}
        <div>
          <h3 className="neu-text-h3">{sub.company.name}</h3>
          <p className="neu-text-caption text-[var(--neu-text-muted)]">
            {sub.company.email}
          </p>
        </div>
        
        {/* Plan Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold text-[var(--neu-accent)]">
            {sub.plan}
          </span>
          <span
            className={cn(
              "px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold",
              sub.status === 'ACTIVE' && "text-[var(--neu-success)]",
              sub.status === 'EXPIRED' && "text-[var(--neu-error)]",
              sub.status === 'CANCELLED' && "text-[var(--neu-text-muted)]"
            )}
          >
            {sub.status}
          </span>
        </div>
        
        {/* Dates */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">
              Início:
            </span>
            <span className="neu-text-caption">
              {formatDate(sub.start_date)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="neu-text-caption text-[var(--neu-text-muted)]">
              Término:
            </span>
            <span className="neu-text-caption">
              {formatDate(sub.end_date)}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-[var(--neu-border)]">
          <NeuButton
            variant="convex"
            size="sm"
            onClick={() => handleRenew(sub.id)}
            className="flex-1"
          >
            Renovar
          </NeuButton>
          <NeuButton
            variant="convex"
            size="sm"
            onClick={() => handleExtend(sub.id)}
            className="flex-1"
          >
            Estender
          </NeuButton>
          <NeuButton
            variant="ghost"
            size="icon"
            onClick={() => handleCancel(sub.id)}
          >
            <X className="w-4 h-4 text-[var(--neu-error)]" />
          </NeuButton>
        </div>
      </NeuCardContent>
    </NeuCard>
  ))}
</div>
```

---

### **4. Backup (`/admin/backup/page.tsx`):**

**Manual Backup:**
```tsx
<NeuCard variant="convex" size="lg">
  <NeuCardContent className="p-6 text-center space-y-4">
    <div className="w-20 h-20 rounded-full neu-surface neu-convex-lg flex items-center justify-center mx-auto">
      <Database className="w-10 h-10 text-[var(--neu-accent)]" />
    </div>
    
    <div>
      <h2 className="neu-text-h2 mb-2">Backup Manual</h2>
      <p className="neu-text-body text-[var(--neu-text-muted)]">
        Criar backup completo do sistema agora
      </p>
    </div>
    
    <NeuButton
      variant="accent"
      size="lg"
      onClick={handleManualBackup}
      loading={isBackingUp}
    >
      <Download className="w-6 h-6" />
      Criar Backup Agora
    </NeuButton>
  </NeuCardContent>
</NeuCard>
```

**Backup History:**
```tsx
<NeuCard variant="concave" size="md">
  <NeuCardHeader>
    <NeuCardTitle>Histórico de Backups</NeuCardTitle>
  </NeuCardHeader>
  <NeuCardContent className="p-0 overflow-x-auto">
    <table className="w-full">
      <thead className="bg-[var(--neu-base)]">
        <tr className="border-b border-[var(--neu-border)]">
          <th className="px-6 py-4 text-left neu-text-label">Data/Hora</th>
          <th className="px-6 py-4 text-left neu-text-label">Tamanho</th>
          <th className="px-6 py-4 text-left neu-text-label">Status</th>
          <th className="px-6 py-4 text-right neu-text-label">Ações</th>
        </tr>
      </thead>
      <tbody>
        {backups.map(backup => (
          <tr
            key={backup.id}
            className="border-b border-[var(--neu-border)] hover:bg-[var(--neu-surface-hover)]"
          >
            <td className="px-6 py-4 neu-text-body">
              {formatDate(backup.created_at)}
            </td>
            <td className="px-6 py-4 neu-text-body">
              {formatFileSize(backup.size)}
            </td>
            <td className="px-6 py-4">
              <span
                className={cn(
                  "px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold",
                  backup.status === 'SUCCESS' && "text-[var(--neu-success)]",
                  backup.status === 'ERROR' && "text-[var(--neu-error)]"
                )}
              >
                {backup.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <NeuButton
                  variant="convex"
                  size="icon"
                  onClick={() => handleDownload(backup.id)}
                >
                  <Download className="w-4 h-4" />
                </NeuButton>
                <NeuButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(backup.id)}
                >
                  <Trash2 className="w-4 h-4 text-[var(--neu-error)]" />
                </NeuButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </NeuCardContent>
</NeuCard>
```

**Auto-backup Toggle:**
```tsx
<NeuCard variant="convex" size="md">
  <NeuCardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="neu-text-body font-medium">Backup Automático</p>
        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
          Backup diário às 02:00
        </p>
      </div>
      <NeuSwitch
        checked={autoBackupEnabled}
        onCheckedChange={setAutoBackupEnabled}
        variant="success"
        size="md"
      />
    </div>
  </NeuCardContent>
</NeuCard>
```

---

### **5. System Settings (`/admin/system/page.tsx`):**

**Settings Cards:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Email Config */}
  <NeuCard variant="convex" size="md">
    <NeuCardHeader>
      <NeuCardTitle>Configurações de Email</NeuCardTitle>
    </NeuCardHeader>
    <NeuCardContent className="space-y-4">
      <NeuInput
        label="SMTP Host"
        value={emailConfig.host}
        onChange={(e) => setEmailConfig({...emailConfig, host: e.target.value})}
        variant="concave"
        size="md"
      />
      <NeuInput
        label="SMTP Port"
        type="number"
        value={emailConfig.port}
        onChange={(e) => setEmailConfig({...emailConfig, port: e.target.value})}
        variant="concave"
        size="md"
      />
      <NeuInput
        label="Username"
        value={emailConfig.username}
        onChange={(e) => setEmailConfig({...emailConfig, username: e.target.value})}
        variant="concave"
        size="md"
      />
      <NeuInput
        label="Password"
        type="password"
        value={emailConfig.password}
        onChange={(e) => setEmailConfig({...emailConfig, password: e.target.value})}
        variant="concave"
        size="md"
      />
      
      <NeuButton
        variant="accent"
        size="md"
        onClick={handleSaveEmailConfig}
        className="w-full"
      >
        Salvar Configurações
      </NeuButton>
    </NeuCardContent>
  </NeuCard>
  
  {/* Maintenance Mode */}
  <NeuCard variant="convex" size="md">
    <NeuCardHeader>
      <NeuCardTitle>Modo de Manutenção</NeuCardTitle>
    </NeuCardHeader>
    <NeuCardContent className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl neu-surface neu-concave-sm">
        <div>
          <p className="neu-text-body font-medium">Modo de Manutenção</p>
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
            Desabilitar acesso temporariamente
          </p>
        </div>
        <NeuSwitch
          checked={maintenanceMode}
          onCheckedChange={setMaintenanceMode}
          variant="warning"
          size="lg"
        />
      </div>
      
      {maintenanceMode && (
        <NeuTextarea
          label="Mensagem de Manutenção"
          value={maintenanceMessage}
          onChange={(e) => setMaintenanceMessage(e.target.value)}
          placeholder="Sistema em manutenção..."
          variant="concave"
          size="md"
          rows={4}
        />
      )}
    </NeuCardContent>
  </NeuCard>
</div>
```

---

### **6. Impersonation Banner (`ImpersonationBanner.tsx`):**

```tsx
<NeuCard variant="concave" size="sm" className="bg-[var(--neu-warning)]/10 border-[var(--neu-warning)]">
  <NeuCardContent className="p-3">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--neu-warning)]" />
        <div>
          <p className="neu-text-body font-bold text-[var(--neu-warning)]">
            Modo de Personificação Ativo
          </p>
          <p className="neu-text-caption text-[var(--neu-text-muted)]">
            Você está acessando como: <strong>{impersonatedUser.name}</strong>
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <NeuButton
          variant="ghost"
          size="sm"
          onClick={handleStopImpersonation}
        >
          <X className="w-4 h-4" />
          Sair
        </NeuButton>
      </div>
    </div>
  </NeuCardContent>
</NeuCard>
```

---

## 📋 **Checklist de Atualização**

### **POS:**
- [ ] Container → `bg-[var(--neu-base)]`
- [ ] Product Grid → `NeuCard variant="flat"`
- [ ] Cart Sidebar → `NeuCard variant="concave"`
- [ ] Search → `NeuInput variant="concave"`
- [ ] Product Cards → `NeuCard variant="convex"`
- [ ] Cart Items → `NeuCard variant="convex"`
- [ ] Payment Method → `NeuButton` grid
- [ ] Finalizar Button → `NeuButton variant="accent" size="lg"`
- [ ] Empty States → Neumorphic
- [ ] Success Modal → `NeuDialog`

### **Admin Pages:**
- [ ] All pages → Container `bg-[var(--neu-base)]`
- [ ] All pages → Header `neu-text-h1`
- [ ] All tables → `NeuCard variant="concave"`
- [ ] All filters → `NeuInput`, `NeuSelect`
- [ ] All action buttons → `NeuButton`
- [ ] Stats cards → `NeuCard variant="convex"`
- [ ] Badges → Neumorphic styles
- [ ] Impersonation Banner → Updated

---

## 🎯 **Resultado Esperado**

Após aplicar todas as mudanças:
- ✅ POS 100% Neumorphic
- ✅ 10 páginas Admin 100% Neumorphic
- ✅ Design consistente em todo o sistema
- ✅ Dark/Light mode funcional
- ✅ Acessibilidade garantida
- ✅ **Sistema 100% COMPLETO**

---

**Criado:** 28/12/2025  
**Status:** 📋 Guia de Implementação  
**Páginas:** POS + 10 Admin = 11 páginas
