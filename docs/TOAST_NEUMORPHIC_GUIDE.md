# 🎨 Toast Neumorphic - Guia Completo

**Data:** 28/12/2025  
**Status:** ✅ COMPLETO  
**Componente:** `src/components/ui/neu-toast.tsx`

---

## 📦 O QUE FOI CRIADO

### **NeuToaster Component**
Wrapper Neumorphic para o Sonner toast notifications com design system consistente.

### **Arquivos:**
1. `src/components/ui/neu-toast.tsx` - Componente principal
2. `src/app/toast-demo/page.tsx` - Página de demonstração
3. `src/app/layout.tsx` - Integração no layout (substituído Toaster padrão)

---

## 🎨 DESIGN SYSTEM

### **Estrutura Neumorphic:**
```tsx
// Toast Container
<div className="neu-surface neu-convex-md backdrop-blur-md" />

// Title
<h3 className="neu-text-body font-bold" />

// Description
<p className="neu-text-caption text-[var(--neu-text-muted)]" />

// Action Button
<button className="neu-surface neu-convex-sm text-[var(--neu-accent)]" />

// Close Button
<button className="neu-surface neu-convex-sm opacity-0 group-hover:opacity-100" />
```

---

## 🎯 VARIANTES

### **1. Success Toast** ✅
```tsx
toast.success('Operação concluída!', {
  description: 'Os dados foram salvos.',
});

// Visual:
// - Border left: 4px verde (--neu-success)
// - Ícone: CheckCircle verde em card Neumorphic
// - Texto: Bold com cor success
```

### **2. Error Toast** ❌
```tsx
toast.error('Erro ao processar', {
  description: 'Tente novamente.',
});

// Visual:
// - Border left: 4px vermelho (--neu-error)
// - Ícone: XCircle vermelho
// - Texto: Bold com cor error
```

### **3. Warning Toast** ⚠️
```tsx
toast.warning('Atenção: Stock baixo', {
  description: 'Apenas 5 unidades restantes.',
});

// Visual:
// - Border left: 4px laranja (--neu-warning)
// - Ícone: AlertTriangle laranja
// - Texto: Bold com cor warning
```

### **4. Info Toast** ℹ️
```tsx
toast.info('Nova atualização disponível', {
  description: 'Versão 2.0.0 pronta.',
});

// Visual:
// - Border left: 4px azul/accent (--neu-accent)
// - Ícone: Info azul
// - Texto: Bold com cor accent
```

---

## 🚀 USO AVANÇADO

### **Com Action Button:**
```tsx
toast.success('Arquivo enviado!', {
  description: 'Deseja visualizar agora?',
  action: {
    label: 'Visualizar',
    onClick: () => window.open('/files'),
  },
});
```

### **Com Action + Cancel:**
```tsx
toast.success('Alterações salvas', {
  description: 'Publicar as mudanças?',
  action: {
    label: 'Publicar',
    onClick: () => publish(),
  },
  cancel: {
    label: 'Cancelar',
    onClick: () => console.log('Cancelado'),
  },
});
```

### **Promise Toast:**
```tsx
const uploadPromise = uploadFile(file);

toast.promise(uploadPromise, {
  loading: 'A enviar arquivo...',
  success: 'Arquivo enviado com sucesso!',
  error: 'Erro ao enviar arquivo',
});
```

### **Toast Persistente:**
```tsx
toast.info('Mensagem importante', {
  duration: Infinity, // Não fecha automaticamente
  description: 'Clique no X para fechar',
});
```

### **Fechar Toasts:**
```tsx
// Fechar toast específico
const toastId = toast.success('Mensagem');
toast.dismiss(toastId);

// Fechar todos os toasts
toast.dismiss();
```

---

## ⚙️ CONFIGURAÇÃO

### **Posições Disponíveis:**
```tsx
<NeuToaster position="top-right" />    // Padrão
<NeuToaster position="top-left" />
<NeuToaster position="bottom-right" />
<NeuToaster position="bottom-left" />
<NeuToaster position="top-center" />
<NeuToaster position="bottom-center" />
```

### **Opções Globais:**
```tsx
<NeuToaster
  position="top-right"
  expand={false}           // Toasts empilhados
  richColors={false}       // Cores customizadas
  closeButton={true}       // Botão X
  duration={4000}          // 4 segundos padrão
  gap={12}                 // Espaço entre toasts
/>
```

---

## 📱 RESPONSIVIDADE

### **Desktop:**
- Width: `max-w-md` (448px)
- Padding: `p-4` (16px)
- Gap: `12px` entre toasts

### **Mobile:**
- Width: `w-full` adaptativo
- Padding mantido
- Swipe to dismiss habilitado

---

## 🎬 ANIMAÇÕES

### **Entrada (Entry):**
```css
/* Slide + Fade in */
animate-in slide-in-from-top-full
```

### **Saída (Exit):**
```css
/* Slide + Fade out */
animate-out slide-out-to-right-full
```

### **Swipe Gesture:**
- Swipe para direita = Dismiss
- `data-[swipe=move]:transition-none` = Sem delay

---

## 🎨 CLASSES NEUMORPHIC APLICADAS

| Elemento | Classes |
|----------|---------|
| **Container** | `neu-surface neu-convex-md backdrop-blur-md` |
| **Icon Container** | `neu-surface neu-convex-md w-10 h-10 rounded-xl` |
| **Title** | `neu-text-body font-bold text-[var(--neu-text-primary)]` |
| **Description** | `neu-text-caption text-[var(--neu-text-muted)]` |
| **Action Button** | `neu-surface neu-convex-sm hover:neu-convex-md` |
| **Cancel Button** | `neu-surface neu-concave-sm` |
| **Close Button** | `neu-surface neu-convex-sm opacity-0 group-hover:opacity-100` |

---

## 🧪 TESTAR

### **1. Página de Demo:**
```bash
npm run dev
```

Acesse: http://localhost:3000/toast-demo

### **2. Testar em Páginas Reais:**
```tsx
// Qualquer página do sistema já usa os toasts Neumorphic
// Exemplos:

// Categories - Ao criar categoria
toast.success('Categoria criada!');

// Products - Ao adicionar produto
toast.success('Produto adicionado!');

// Reservations - Ao completar reserva
toast.success('Reserva convertida em venda!');

// Admin - Ao suspender empresa
toast.warning('Empresa suspensa');
```

---

## 📋 EXEMPLOS PRÁTICOS

### **E-commerce:**
```tsx
// Adicionar ao carrinho
toast.success('Produto adicionado ao carrinho!', {
  description: '1x Laptop HP - 45,000 MT',
  action: {
    label: 'Ver Carrinho',
    onClick: () => router.push('/cart'),
  },
});

// Stock baixo
toast.warning('Stock crítico', {
  description: 'Produto: Arroz 5kg - Apenas 3 unidades',
  action: {
    label: 'Encomendar',
    onClick: () => reorder(),
  },
});
```

### **Autenticação:**
```tsx
// Login success
toast.success('Bem-vindo!', {
  description: 'Login efetuado com sucesso',
});

// Login error
toast.error('Falha na autenticação', {
  description: 'Email ou senha incorretos',
});
```

### **Upload de Arquivos:**
```tsx
const uploadPromise = uploadFile(file);

toast.promise(uploadPromise, {
  loading: 'A enviar arquivo...',
  success: (data) => `${data.name} enviado com sucesso!`,
  error: (err) => `Erro: ${err.message}`,
});
```

### **Sincronização:**
```tsx
toast.info('Sincronização completa', {
  description: '150 produtos atualizados',
  duration: 3000,
});
```

---

## 🎯 CHECKLIST DE INTEGRAÇÃO

- [x] Componente `NeuToaster` criado
- [x] Integrado em `layout.tsx`
- [x] Substituído `Toaster` padrão
- [x] Classes Neumorphic aplicadas
- [x] Variantes (success, error, warning, info)
- [x] Action buttons Neumorphic
- [x] Close button com hover
- [x] Animações configuradas
- [x] Responsividade mobile
- [x] Dark/Light mode suportado
- [x] Página de demo criada
- [x] Documentação completa

---

## 🎨 CORES CSS VARIABLES

```css
/* Success */
--neu-success: #10b981;

/* Error */
--neu-error: #ef4444;

/* Warning */
--neu-warning: #f59e0b;

/* Info/Accent */
--neu-accent: #6366f1;

/* Text */
--neu-text-primary: (depende do tema)
--neu-text-muted: (depende do tema)

/* Border */
--neu-border: (depende do tema)
```

---

## 📊 RESULTADO FINAL

✅ **Toast Notifications 100% Neumorphic**
- Design consistente com o resto do sistema
- Todas as variantes implementadas
- Action buttons funcionais
- Animações suaves
- Responsivo e acessível
- Dark/Light mode perfeito

---

## 🚀 DEPLOY

**Pronto para produção!**

Todos os toasts do sistema agora usam o design Neumorphic automaticamente. Nenhuma alteração necessária nas páginas existentes - apenas continue usando `toast.success()`, `toast.error()`, etc.

---

**Criado:** 28/12/2025  
**Versão:** 1.0.0  
**Status:** ✅ COMPLETO E TESTADO
