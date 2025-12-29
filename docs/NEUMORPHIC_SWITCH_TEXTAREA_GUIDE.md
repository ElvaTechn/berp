# 🎨 Guia de NeuSwitch e NeuTextarea - BizControl 360 ERP

Este documento descreve os componentes **NeuSwitch** e **NeuTextarea** adicionados ao sistema Neumorphic.

---

## 📦 Componentes Criados

### 1. NeuSwitch - Switch/Toggle Neumorphic

#### **Variantes de Cor (`variant`)**

```tsx
import { NeuSwitch } from "@/components/ui/neu-switch";

// Variant: "default" - Track cinza, thumb accent
<NeuSwitch
  checked={enabled}
  onCheckedChange={setEnabled}
  variant="default"
/>

// Variant: "success" - Track verde quando checked
<NeuSwitch
  checked={enabled}
  onCheckedChange={setEnabled}
  variant="success"
/>

// Variant: "warning" - Track laranja quando checked
<NeuSwitch
  checked={enabled}
  onCheckedChange={setEnabled}
  variant="warning"
/>

// Variant: "error" - Track vermelho quando checked
<NeuSwitch
  checked={enabled}
  onCheckedChange={setEnabled}
  variant="error"
/>
```

#### **Variantes de Tamanho (`size`)**

```tsx
// Size: "sm" - Pequeno (w-9 h-5, thumb w-4 h-4)
<NeuSwitch size="sm" checked={enabled} onCheckedChange={setEnabled} />

// Size: "md" (default) - Médio (w-11 h-6, thumb w-5 h-5)
<NeuSwitch size="md" checked={enabled} onCheckedChange={setEnabled} />

// Size: "lg" - Grande (w-13 h-7, thumb w-6 h-6)
<NeuSwitch size="lg" checked={enabled} onCheckedChange={setEnabled} />
```

#### **Com Label**

```tsx
// Label à direita (padrão)
<NeuSwitch
  checked={enabled}
  onCheckedChange={setEnabled}
  label="Funcionário ativo"
  labelPosition="right"
/>

// Label à esquerda
<NeuSwitch
  checked={enabled}
  onCheckedChange={setEnabled}
  label="Enable notifications"
  labelPosition="left"
/>

// Sem label (controle manual)
<div className="flex items-center gap-2">
  <NeuSwitch checked={enabled} onCheckedChange={setEnabled} />
  <label className="neu-text-body">Custom label</label>
</div>
```

#### **Exemplo Completo - Employee Status**

```tsx
import { useState } from "react";
import { NeuSwitch } from "@/components/ui/neu-switch";

function EmployeeForm() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-4">
      <h3 className="neu-text-h3">Status do Funcionário</h3>
      
      <div className="flex items-center gap-3">
        <NeuSwitch
          id="is_active"
          checked={isActive}
          onCheckedChange={setIsActive}
          variant="success"
          size="md"
        />
        <label htmlFor="is_active" className="neu-text-body cursor-pointer">
          {isActive ? "Funcionário Ativo" : "Funcionário Inativo"}
        </label>
      </div>
    </div>
  );
}
```

---

### 2. NeuTextarea - Textarea Neumorphic

#### **Variantes de Estilo (`variant`)**

```tsx
import { NeuTextarea } from "@/components/ui/neu-textarea";

// Variant: "concave" (default) - Efeito pressionado
<NeuTextarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  variant="concave"
  placeholder="Digite aqui..."
/>

// Variant: "flat" - Estilo minimalista com borda
<NeuTextarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  variant="flat"
  placeholder="Digite aqui..."
/>
```

#### **Variantes de Tamanho (`size`)**

```tsx
// Size: "sm" - Pequeno (text-sm, py-2, px-3, min-h-80px)
<NeuTextarea size="sm" placeholder="Small textarea" />

// Size: "md" (default) - Médio (text-base, py-3, px-4, min-h-100px)
<NeuTextarea size="md" placeholder="Medium textarea" />

// Size: "lg" - Grande (text-lg, py-4, px-5, min-h-120px)
<NeuTextarea size="lg" placeholder="Large textarea" />
```

#### **Com Label e Validação**

```tsx
<NeuTextarea
  label="Descrição do Produto *"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Digite a descrição..."
  required
  error={errors.description}
/>
```

#### **Com Contador de Caracteres**

```tsx
<NeuTextarea
  label="Comentário"
  value={comment}
  onChange={(e) => setComment(e.target.value)}
  placeholder="Escreva seu comentário..."
  maxLength={500}
  showCounter
/>
```

#### **Com Redimensionamento**

```tsx
// Sem redimensionamento (padrão)
<NeuTextarea resizable={false} />

// Redimensionamento vertical
<NeuTextarea resizable="vertical" />

// Redimensionamento horizontal
<NeuTextarea resizable="horizontal" />

// Redimensionamento livre
<NeuTextarea resizable="both" />
```

#### **Exemplo Completo - Product Description**

```tsx
import { useState } from "react";
import { NeuTextarea } from "@/components/ui/neu-textarea";

function ProductForm() {
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateDescription = (value: string) => {
    if (!value.trim()) {
      setErrors({ description: "Descrição é obrigatória" });
      return false;
    }
    if (value.length < 10) {
      setErrors({ description: "Descrição muito curta (mínimo 10 caracteres)" });
      return false;
    }
    setErrors({});
    return true;
  };

  return (
    <div className="space-y-4">
      <NeuTextarea
        label="Descrição do Produto *"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          validateDescription(e.target.value);
        }}
        onBlur={(e) => validateDescription(e.target.value)}
        placeholder="Descreva o produto em detalhes..."
        variant="concave"
        size="md"
        maxLength={1000}
        showCounter
        rows={5}
        error={errors.description}
        required
      />
    </div>
  );
}
```

---

## 🎯 **Design Neumorphic**

### **NeuSwitch Design**

**Track (Root):**
- Efeito: `neu-concave-sm` (trilho pressionado)
- Shape: `rounded-full`
- Unchecked: Cor da superfície base
- Checked: Cor da variante (success, warning, error, accent)

**Thumb:**
- Efeito: `neu-convex-sm` (botão saltado)
- Shape: `rounded-full`
- Unchecked: Cinza (`text-[var(--neu-text-muted)]`)
- Checked: Branco
- Transição: Suave com `ease-in-out` (300ms)

**Estados:**
- Focus: `ring-2 ring-[var(--neu-accent)]`
- Disabled: `opacity-50 cursor-not-allowed`

---

### **NeuTextarea Design**

**Container:**
- Efeito: `neu-concave-sm` (pressionado)
- Shape: `rounded-xl`
- Focus: `neu-concave-md` (mais pressionado)

**Texto:**
- Tipografia: `neu-text-body`
- Placeholder: `text-[var(--neu-text-muted)]`
- Background: Transparente (efeito neumorphic no container)

**Counter:**
- Posição: `absolute bottom-2 right-3`
- Cores dinâmicas:
  - < 75%: Cinza muted
  - 75-90%: Texto secundário
  - 90-100%: Warning
  - 100%: Error (bold)

---

## ✅ **Componentes Migrados**

### **Switches Migrados (2)**

#### 1. **AddEmployeeModal.tsx** ✅
- **Antes:** `<input type="checkbox" />` para is_active
- **Depois:** `<NeuSwitch variant="success" size="md" />`
- **Arquivo:** `src/components/employees/AddEmployeeModal.tsx`

#### 2. **EditEmployeeModal.tsx** ✅
- **Antes:** `<input type="checkbox" />` para is_active
- **Depois:** `<NeuSwitch variant="success" size="md" />`
- **Arquivo:** `src/components/employees/EditEmployeeModal.tsx`

---

### **Textareas Migrados (2)**

#### 1. **AddProductModal.tsx** ✅
- **Antes:** `<textarea>` nativo para descrição
- **Depois:** `<NeuTextarea variant="concave" size="md" />`
- **Arquivo:** `src/components/inventory/AddProductModal.tsx`

#### 2. **EditProductModal.tsx** ✅
- **Antes:** `<textarea>` nativo para descrição
- **Depois:** `<NeuTextarea variant="concave" size="md" />`
- **Arquivo:** `src/components/inventory/EditProductModal.tsx`

---

## 📊 **Estatísticas**

| Componente | Criado | Migrado | Variantes | Tamanhos |
|------------|--------|---------|-----------|----------|
| **NeuSwitch** | ✅ | 2 | 4 (default, success, warning, error) | 3 (sm, md, lg) |
| **NeuTextarea** | ✅ | 2 | 2 (concave, flat) | 3 (sm, md, lg) |

---

## 🚀 **Benefícios**

### **Consistência de Design**
- ✅ Todos os switches seguem o mesmo padrão Neumorphic
- ✅ Textareas com estilo uniforme
- ✅ Variantes CVA type-safe

### **Acessibilidade**
- ✅ Radix UI Switch garante ARIA completo
- ✅ Keyboard navigation (Space, Tab)
- ✅ Screen reader friendly
- ✅ `aria-checked`, `aria-invalid`, `aria-describedby`

### **UX Melhorada**
- ✅ Animações suaves
- ✅ Feedback visual claro (cores de variantes)
- ✅ Contador de caracteres em tempo real
- ✅ Validação visual inline

---

## 🎓 **API Comparison**

### **Switch**

**Antes (Checkbox):**
```tsx
<input
  type="checkbox"
  checked={value}
  onChange={(e) => setValue(e.target.checked)}
  className="..."
/>
```

**Depois (NeuSwitch):**
```tsx
<NeuSwitch
  checked={value}
  onCheckedChange={setValue}
  variant="success"
  size="md"
/>
```

**Mudanças:**
- `onChange` → `onCheckedChange`
- `e.target.checked` → valor direto
- Classes inline → Variantes CVA

---

### **Textarea**

**Antes (Nativo):**
```tsx
<div>
  <label>Label</label>
  <textarea
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="..."
  />
</div>
```

**Depois (NeuTextarea):**
```tsx
<NeuTextarea
  label="Label"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  variant="concave"
  size="md"
  showCounter
  maxLength={500}
/>
```

**Benefícios:**
- Label integrado
- Counter automático
- Validação visual
- Error handling
- Variantes type-safe

---

## 📝 **Próximos Passos**

### **Teste a Aplicação:**
1. Testar switches em modais de funcionários
2. Testar textareas em modais de produtos
3. Verificar dark/light mode
4. Testar keyboard navigation
5. Validar acessibilidade (screen readers)

### **Oportunidades de Melhoria:**
- Adicionar mais variantes se necessário
- Criar componente de campo de formulário completo (label + input/textarea + error)
- Adicionar suporte a autogrow para textareas
- Implementar rich text editor Neumorphic

---

## 🔗 **Referências**

- **Radix UI Switch:** https://www.radix-ui.com/primitives/docs/components/switch
- **CVA Documentation:** https://cva.style/docs
- **Design System:** `F:\berp\src\app\globals.css`
- **Componentes:** `F:\berp\src\components\ui\neu-*.tsx`

---

**Criado:** 28/12/2025  
**Autor:** Letta Code  
**Status:** ✅ Completo  
**Versão:** 1.0.0
