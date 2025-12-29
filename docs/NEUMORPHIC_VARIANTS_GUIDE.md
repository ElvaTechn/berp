# 🎨 Guia de Variantes Neumorphic - BizControl 360 ERP

Este documento descreve as variantes CVA (Class Variance Authority) adicionadas aos componentes Neumorphic do sistema.

## 📦 Componentes Refatorados

### 1. NeuSelect - Select com Variantes

#### Variantes de Estilo (`variant`)

```tsx
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from "@/components/ui/neu-select";

// Variant: "concave" (default) - Trigger pressionado para dentro
<NeuSelect value={value} onValueChange={setValue}>
  <NeuSelectTrigger variant="concave">
    <NeuSelectValue placeholder="Selecione..." />
  </NeuSelectTrigger>
  <NeuSelectContent>
    <NeuSelectItem value="option1">Opção 1</NeuSelectItem>
    <NeuSelectItem value="option2">Opção 2</NeuSelectItem>
  </NeuSelectContent>
</NeuSelect>

// Variant: "convex" - Trigger levantado (menos comum para selects)
<NeuSelectTrigger variant="convex">
  <NeuSelectValue placeholder="Selecione..." />
</NeuSelectTrigger>

// Variant: "flat" - Estilo minimalista com borda
<NeuSelectTrigger variant="flat">
  <NeuSelectValue placeholder="Selecione..." />
</NeuSelectTrigger>
```

#### Variantes de Tamanho (`size`)

```tsx
// Size: "sm" - Pequeno (h-9, texto small)
<NeuSelectTrigger size="sm">
  <NeuSelectValue placeholder="Pequeno..." />
</NeuSelectTrigger>

// Size: "md" (default) - Médio (h-11, texto base)
<NeuSelectTrigger size="md">
  <NeuSelectValue placeholder="Médio..." />
</NeuSelectTrigger>

// Size: "lg" - Grande (h-13, texto base)
<NeuSelectTrigger size="lg">
  <NeuSelectValue placeholder="Grande..." />
</NeuSelectTrigger>
```

#### Exemplo Completo

```tsx
import { useState } from "react";
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from "@/components/ui/neu-select";

function RoleSelector() {
  const [role, setRole] = useState("");

  return (
    <div className="space-y-2">
      <label className="neu-text-label">Função do Funcionário</label>
      <NeuSelect value={role} onValueChange={setRole}>
        <NeuSelectTrigger variant="concave" size="md">
          <NeuSelectValue placeholder="Selecione a função..." />
        </NeuSelectTrigger>
        <NeuSelectContent>
          <NeuSelectItem value="VENDEDOR">Vendedor</NeuSelectItem>
          <NeuSelectItem value="GESTOR">Gestor</NeuSelectItem>
          <NeuSelectItem value="ADMIN">Administrador</NeuSelectItem>
        </NeuSelectContent>
      </NeuSelect>
    </div>
  );
}
```

---

### 2. NeuDialog - Dialog com Variantes de Tamanho

#### Variantes de Tamanho (`size`)

```tsx
import { NeuDialog, NeuDialogTrigger, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription } from "@/components/ui/neu-dialog";

// Size: "sm" - Pequeno (~400px)
<NeuDialog>
  <NeuDialogTrigger>Abrir Small</NeuDialogTrigger>
  <NeuDialogContent size="sm">
    <NeuDialogHeader>
      <NeuDialogTitle>Modal Pequeno</NeuDialogTitle>
      <NeuDialogDescription>Ideal para confirmações simples</NeuDialogDescription>
    </NeuDialogHeader>
    <p>Conteúdo do modal pequeno...</p>
  </NeuDialogContent>
</NeuDialog>

// Size: "md" (default) - Médio (~500px)
<NeuDialogContent size="md">
  <NeuDialogHeader>
    <NeuDialogTitle>Modal Médio</NeuDialogTitle>
    <NeuDialogDescription>Tamanho padrão para formulários</NeuDialogDescription>
  </NeuDialogHeader>
</NeuDialogContent>

// Size: "lg" - Grande (~700px)
<NeuDialogContent size="lg">
  <NeuDialogHeader>
    <NeuDialogTitle>Modal Grande</NeuDialogTitle>
    <NeuDialogDescription>Para formulários complexos</NeuDialogDescription>
  </NeuDialogHeader>
</NeuDialogContent>

// Size: "xl" - Extra Grande (~900px)
<NeuDialogContent size="xl">
  <NeuDialogHeader>
    <NeuDialogTitle>Modal Extra Grande</NeuDialogTitle>
    <NeuDialogDescription>Para dashboards e relatórios</NeuDialogDescription>
  </NeuDialogHeader>
</NeuDialogContent>

// Size: "full" - Quase tela inteira (95vw)
<NeuDialogContent size="full">
  <NeuDialogHeader>
    <NeuDialogTitle>Modal Full Width</NeuDialogTitle>
    <NeuDialogDescription>Para visualização completa</NeuDialogDescription>
  </NeuDialogHeader>
</NeuDialogContent>
```

#### Exemplo Completo - Modal de Adição de Produto

```tsx
import { useState } from "react";
import { NeuDialog, NeuDialogTrigger, NeuDialogContent, NeuDialogHeader, NeuDialogTitle, NeuDialogDescription, NeuDialogFooter } from "@/components/ui/neu-dialog";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuSelect, NeuSelectTrigger, NeuSelectValue, NeuSelectContent, NeuSelectItem } from "@/components/ui/neu-select";

function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de submissão...
    setOpen(false);
  };

  return (
    <NeuDialog open={open} onOpenChange={setOpen}>
      <NeuDialogTrigger asChild>
        <NeuButton variant="accent" size="md">
          Adicionar Produto
        </NeuButton>
      </NeuDialogTrigger>
      
      <NeuDialogContent size="lg">
        <NeuDialogHeader>
          <NeuDialogTitle>Novo Produto</NeuDialogTitle>
          <NeuDialogDescription>
            Preencha os dados do produto abaixo
          </NeuDialogDescription>
        </NeuDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeuInput
            label="Nome do Produto"
            placeholder="Ex: Coca-Cola 350ml"
            required
          />

          <NeuSelect value={category} onValueChange={setCategory}>
            <NeuSelectTrigger variant="concave" size="md">
              <NeuSelectValue placeholder="Selecione a categoria..." />
            </NeuSelectTrigger>
            <NeuSelectContent>
              <NeuSelectItem value="bebidas">Bebidas</NeuSelectItem>
              <NeuSelectItem value="alimentos">Alimentos</NeuSelectItem>
              <NeuSelectItem value="limpeza">Limpeza</NeuSelectItem>
            </NeuSelectContent>
          </NeuSelect>

          <div className="grid grid-cols-2 gap-4">
            <NeuInput
              label="Preço"
              type="number"
              placeholder="0.00"
              required
            />
            <NeuInput
              label="Quantidade"
              type="number"
              placeholder="0"
              required
            />
          </div>

          <NeuDialogFooter>
            <NeuButton
              type="button"
              variant="convex"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </NeuButton>
            <NeuButton type="submit" variant="accent">
              Adicionar
            </NeuButton>
          </NeuDialogFooter>
        </form>
      </NeuDialogContent>
    </NeuDialog>
  );
}
```

---

## 🎯 Benefícios das Variantes CVA

### 1. **Type Safety**
```tsx
// TypeScript garante que você só use variantes válidas
<NeuSelectTrigger variant="concave" size="md" /> // ✅ Válido
<NeuSelectTrigger variant="invalid" size="huge" /> // ❌ Erro de tipo
```

### 2. **Consistência**
- Estilos centralizados em um lugar
- Fácil manutenção
- Padrão consistente em toda aplicação

### 3. **Flexibilidade**
```tsx
// Combine variantes conforme necessário
<NeuSelectTrigger variant="flat" size="sm" />
<NeuSelectTrigger variant="convex" size="lg" />
<NeuDialogContent size="xl" />
```

### 4. **Defaults Inteligentes**
```tsx
// Sem props = usa defaults (concave + md)
<NeuSelectTrigger>
  <NeuSelectValue />
</NeuSelectTrigger>

// Sem size = usa default (md)
<NeuDialogContent>
  ...
</NeuDialogContent>
```

---

## 🔄 Migrando Componentes Existentes

### Substituir Select Nativo por NeuSelect

**Antes:**
```tsx
<select
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
  className="w-full px-4 py-3 rounded-xl neu-surface neu-concave-sm..."
>
  <option value="VENDEDOR">Vendedor</option>
  <option value="GESTOR">Gestor</option>
</select>
```

**Depois:**
```tsx
<NeuSelect 
  value={formData.role} 
  onValueChange={(value) => setFormData({ ...formData, role: value })}
>
  <NeuSelectTrigger variant="concave" size="md">
    <NeuSelectValue placeholder="Selecione a função..." />
  </NeuSelectTrigger>
  <NeuSelectContent>
    <NeuSelectItem value="VENDEDOR">Vendedor</NeuSelectItem>
    <NeuSelectItem value="GESTOR">Gestor</NeuSelectItem>
  </NeuSelectContent>
</NeuSelect>
```

### Substituir Modal Customizado por NeuDialog

**Antes:**
```tsx
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className="relative w-full max-w-md">
      <NeuCard>
        {/* Conteúdo */}
      </NeuCard>
    </div>
  </div>
)}
```

**Depois:**
```tsx
<NeuDialog open={showModal} onOpenChange={setShowModal}>
  <NeuDialogContent size="md">
    <NeuDialogHeader>
      <NeuDialogTitle>Título</NeuDialogTitle>
      <NeuDialogDescription>Descrição</NeuDialogDescription>
    </NeuDialogHeader>
    {/* Conteúdo */}
    <NeuDialogFooter>
      {/* Botões */}
    </NeuDialogFooter>
  </NeuDialogContent>
</NeuDialog>
```

---

## 📝 Próximos Passos

1. ✅ **Componentes Base Refatorados**
   - neu-select.tsx com variantes CVA
   - neu-dialog.tsx com variantes de tamanho

2. 🔄 **Migração Progressiva**
   - Substituir selects nativos por NeuSelect
   - Substituir modais customizados por NeuDialog
   - Testar em todos os módulos (Inventory, Employees, Sales, etc.)

3. 🎨 **Componentes Futuros**
   - neu-dropdown-menu.tsx com variantes
   - neu-popover.tsx com variantes
   - neu-combobox.tsx com variantes

---

## 🛠️ Troubleshooting

### Problema: Variantes não aparecem no autocomplete

**Solução:** Certifique-se que o arquivo está importando os tipos corretamente:
```tsx
import type { NeuSelectTriggerProps } from "@/components/ui/neu-select";
import type { NeuDialogContentProps } from "@/components/ui/neu-dialog";
```

### Problema: Estilos não aplicam corretamente

**Solução:** Verifique se as classes CSS Neumorphic estão no `globals.css`:
- `.neu-convex-sm`, `.neu-convex-md`, `.neu-convex-lg`
- `.neu-concave-sm`, `.neu-concave-md`, `.neu-concave-lg`
- `--neu-accent`, `--neu-surface`, etc.

---

## 📚 Referências

- [Class Variance Authority (CVA)](https://cva.style/docs)
- [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select)
- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- Design System: `F:\berp\src\app\globals.css`

---

**Autor:** Letta Code  
**Data:** 28/12/2025  
**Versão:** 1.0.0
