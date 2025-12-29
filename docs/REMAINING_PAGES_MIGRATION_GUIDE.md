# 📝 Guia de Migração - Páginas Restantes

## Páginas Pendentes

### 1. 📅 **Reservations** (`src/app/reservations/page.tsx`)

**O que precisa:**
- **Stats Cards** → `NeuCard variant="convex" size="sm"`
  - Pending, Confirmed, Expired, Cancelled
  - Ícone em `neu-convex-md`
  
- **Tabela de Reservas** → `NeuCard variant="concave" size="md"`
  - Headers: `neu-text-label`
  - Rows: hover `bg-[var(--neu-surface-hover)]`
  - Client info: `neu-text-body` + `neu-text-caption`
  
- **Status Badges** → `neu-convex-xs` com cores:
  - Pending: `text-[var(--neu-warning)]`
  - Confirmed: `text-[var(--neu-success)]`
  - Expired: `text-[var(--neu-error)]`
  - Cancelled: `text-[var(--neu-text-muted)]`
  
- **Countdown Timer** → `neu-text-h3 text-[var(--neu-warning)]`
  
- **Action Buttons:**
  - Confirm: `NeuButton variant="accent"`
  - Complete: `NeuButton variant="convex"`
  - Cancel: `NeuButton variant="ghost"` com `text-[var(--neu-error)]`
  
- **Add Reservation Modal** → `NeuDialog`
  - Inputs: `NeuInput variant="concave" size="md"`
  - Selects: `NeuSelect`
  - Date/Time pickers: `NeuInput type="datetime-local"`

**Exemplo de implementação:**

```tsx
// Stats Card
<NeuCard variant="convex" size="sm">
  <NeuCardContent className="p-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
        <Clock className="w-5 h-5 text-[var(--neu-warning)]" />
      </div>
      <p className="neu-text-label text-[var(--neu-text-muted)]">Pendentes</p>
    </div>
    <p className="neu-text-h2">{stats.pending}</p>
  </NeuCardContent>
</NeuCard>

// Status Badge
<span className={`px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold ${
  status === 'CONFIRMED' ? 'text-[var(--neu-success)]' :
  status === 'PENDING' ? 'text-[var(--neu-warning)]' :
  status === 'EXPIRED' ? 'text-[var(--neu-error)]' :
  'text-[var(--neu-text-muted)]'
}`}>
  {status}
</span>

// Countdown Timer
<div className="neu-text-h3 text-[var(--neu-warning)]">
  {timeRemaining}
</div>
```

---

### 2. ⚙️ **Setup** (`src/app/setup/page.tsx`)

**O que precisa:**

#### **Multi-Step Form:**

1. **Progress Indicator** (criar componente `NeuSteps`):
```tsx
// src/components/ui/neu-steps.tsx
<div className="flex items-center gap-2">
  {steps.map((step, index) => (
    <div key={index} className="flex items-center gap-2">
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center
        ${currentStep === index 
          ? 'neu-concave-md text-[var(--neu-accent)]' 
          : currentStep > index
          ? 'neu-convex-sm text-[var(--neu-success)]'
          : 'neu-flat text-[var(--neu-text-muted)]'
        }
      `}>
        {currentStep > index ? <Check /> : index + 1}
      </div>
      {index < steps.length - 1 && (
        <div className={`h-1 w-12 rounded-full ${
          currentStep > index 
            ? 'bg-[var(--neu-success)]' 
            : 'bg-[var(--neu-border)]'
        }`} />
      )}
    </div>
  ))}
</div>
```

2. **Step 1: Company Info**
```tsx
<NeuCard variant="convex" size="lg">
  <NeuCardContent className="p-8">
    <h2 className="neu-text-h2 mb-6">Informações da Empresa</h2>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="neu-text-label">Nome da Empresa</label>
        <NeuInput 
          variant="concave" 
          size="md"
          placeholder="Minha Empresa Lda"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="neu-text-label">NUIT</label>
          <NeuInput variant="concave" size="md" />
        </div>
        <div className="space-y-2">
          <label className="neu-text-label">Telefone</label>
          <NeuInput variant="concave" size="md" />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="neu-text-label">Setor</label>
        <NeuSelect>
          <NeuSelectTrigger variant="concave" size="md">
            <NeuSelectValue placeholder="Selecione o setor" />
          </NeuSelectTrigger>
          <NeuSelectContent>
            <NeuSelectItem value="retail">Retalho</NeuSelectItem>
            <NeuSelectItem value="services">Serviços</NeuSelectItem>
          </NeuSelectContent>
        </NeuSelect>
      </div>
    </div>
  </NeuCardContent>
</NeuCard>
```

3. **Step 2: Admin User**
```tsx
<NeuCard variant="convex" size="lg">
  <NeuCardContent className="p-8">
    <h2 className="neu-text-h2 mb-6">Conta de Administrador</h2>
    
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="neu-text-label">Nome Completo</label>
        <NeuInput variant="concave" size="md" />
      </div>
      
      <div className="space-y-2">
        <label className="neu-text-label">Email</label>
        <NeuInput type="email" variant="concave" size="md" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="neu-text-label">Senha</label>
          <NeuInput type="password" variant="concave" size="md" />
        </div>
        <div className="space-y-2">
          <label className="neu-text-label">Confirmar Senha</label>
          <NeuInput type="password" variant="concave" size="md" />
        </div>
      </div>
    </div>
  </NeuCardContent>
</NeuCard>
```

4. **Step 3: Configuration**
```tsx
<NeuCard variant="convex" size="lg">
  <NeuCardContent className="p-8">
    <h2 className="neu-text-h2 mb-6">Configurações Iniciais</h2>
    
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="neu-text-label">Moeda</label>
        <NeuSelect defaultValue="mzn">
          <NeuSelectTrigger variant="concave" size="md">
            <NeuSelectValue />
          </NeuSelectTrigger>
          <NeuSelectContent>
            <NeuSelectItem value="mzn">MZN - Metical</NeuSelectItem>
            <NeuSelectItem value="usd">USD - Dólar</NeuSelectItem>
          </NeuSelectContent>
        </NeuSelect>
      </div>
      
      <div className="space-y-2">
        <label className="neu-text-label">Fuso Horário</label>
        <NeuSelect defaultValue="africa/maputo">
          <NeuSelectTrigger variant="concave" size="md">
            <NeuSelectValue />
          </NeuSelectTrigger>
          <NeuSelectContent>
            <NeuSelectItem value="africa/maputo">África/Maputo (GMT+2)</NeuSelectItem>
          </NeuSelectContent>
        </NeuSelect>
      </div>
      
      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl neu-convex-sm">
          <div>
            <p className="neu-text-body font-semibold">Modo Offline</p>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">
              Permitir vendas sem internet
            </p>
          </div>
          <NeuSwitch variant="success" size="md" />
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-xl neu-convex-sm">
          <div>
            <p className="neu-text-body font-semibold">Notificações Email</p>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">
              Receber alertas por email
            </p>
          </div>
          <NeuSwitch variant="success" size="md" defaultChecked />
        </div>
      </div>
    </div>
  </NeuCardContent>
</NeuCard>
```

5. **Navigation Buttons:**
```tsx
<div className="flex justify-between mt-8">
  <NeuButton 
    variant="convex" 
    size="lg"
    onClick={handlePrevious}
    disabled={currentStep === 0}
  >
    <ChevronLeft className="w-5 h-5" />
    <span>Voltar</span>
  </NeuButton>
  
  <NeuButton 
    variant="accent" 
    size="lg"
    onClick={currentStep === steps.length - 1 ? handleFinish : handleNext}
  >
    <span>{currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}</span>
    <ChevronRight className="w-5 h-5" />
  </NeuButton>
</div>
```

---

## 🎨 **Padrões Gerais para Ambas as Páginas**

### **Header:**
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
>
  <h1 className="neu-text-h1">Título</h1>
  <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
    Descrição
  </p>
</motion.div>
```

### **Loading State:**
```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--neu-accent)]" />
    </div>
  );
}
```

### **Empty State:**
```tsx
<NeuCard variant="concave" size="lg">
  <NeuCardContent className="flex flex-col items-center justify-center py-12">
    <div className="w-20 h-20 rounded-full neu-surface neu-convex-lg flex items-center justify-center mb-4">
      <Icon className="h-10 w-10 text-[var(--neu-accent)]" />
    </div>
    <h3 className="neu-text-h2 mb-2">Título</h3>
    <p className="neu-text-body text-[var(--neu-text-muted)] mb-4">Descrição</p>
    <NeuButton variant="accent" size="md">
      <Plus className="w-4 w-4" />
      <span>Ação</span>
    </NeuButton>
  </NeuCardContent>
</NeuCard>
```

### **Grid de Cards:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <NeuCard variant="convex" size="md" className="group">
        <NeuCardContent className="p-4">
          {/* Content */}
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  ))}
</div>
```

---

## 📦 **Imports Necessários**

```tsx
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuTextarea } from '@/components/ui/neu-textarea';
import { NeuSwitch } from '@/components/ui/neu-switch';
import { NeuSelect, NeuSelectContent, NeuSelectItem, NeuSelectTrigger, NeuSelectValue } from '@/components/ui/neu-select';
import { NeuDialog, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogFooter } from '@/components/ui/neu-dialog';
import { toast } from 'sonner';
```

---

## ✅ **Checklist de Migração**

**Para cada página:**
- [ ] Substituir `Card` por `NeuCard`
- [ ] Substituir `Button` por `NeuButton`
- [ ] Substituir `Input` por `NeuInput`
- [ ] Substituir `Textarea` por `NeuTextarea`
- [ ] Substituir `Select` por `NeuSelect`
- [ ] Substituir `Dialog` por `NeuDialog`
- [ ] Adicionar `motion` para animações
- [ ] Usar classes de texto: `neu-text-h1/h2/h3`, `neu-text-body`, `neu-text-caption`, `neu-text-label`
- [ ] Usar cores CSS vars: `--neu-accent`, `--neu-success`, `--neu-error`, `--neu-warning`
- [ ] Adicionar hover states: `bg-[var(--neu-surface-hover)]`
- [ ] Testar dark/light mode
- [ ] Testar responsividade mobile

---

**Criado:** 28/12/2025  
**Status:** Guia completo para migração das 2 páginas restantes  
**Tempo estimado:** 2-3 horas para completar ambas
