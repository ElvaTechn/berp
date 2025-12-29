# 🎨 Guia de NeuDropdownMenu e NeuAvatar - BizControl 360 ERP

Este documento descreve os componentes **NeuDropdownMenu** e **NeuAvatar** adicionados ao sistema Neumorphic.

---

## 📦 Componentes Criados

### 1. NeuDropdownMenu - Dropdown Menu Neumorphic

#### **Componentes Disponíveis**

```tsx
import {
  NeuDropdownMenu,
  NeuDropdownMenuTrigger,
  NeuDropdownMenuContent,
  NeuDropdownMenuItem,
  NeuDropdownMenuCheckboxItem,
  NeuDropdownMenuRadioItem,
  NeuDropdownMenuLabel,
  NeuDropdownMenuSeparator,
  NeuDropdownMenuShortcut,
  NeuDropdownMenuGroup,
  NeuDropdownMenuSub,
  NeuDropdownMenuSubContent,
  NeuDropdownMenuSubTrigger,
} from "@/components/ui/neu-dropdown-menu";
```

#### **Uso Básico**

```tsx
<NeuDropdownMenu>
  <NeuDropdownMenuTrigger asChild>
    <NeuButton variant="convex">
      Open Menu
    </NeuButton>
  </NeuDropdownMenuTrigger>
  <NeuDropdownMenuContent>
    <NeuDropdownMenuItem>Profile</NeuDropdownMenuItem>
    <NeuDropdownMenuItem>Settings</NeuDropdownMenuItem>
    <NeuDropdownMenuSeparator />
    <NeuDropdownMenuItem>Logout</NeuDropdownMenuItem>
  </NeuDropdownMenuContent>
</NeuDropdownMenu>
```

#### **Com Labels e Grupos**

```tsx
<NeuDropdownMenu>
  <NeuDropdownMenuTrigger asChild>
    <NeuButton>Options</NeuButton>
  </NeuDropdownMenuTrigger>
  <NeuDropdownMenuContent>
    <NeuDropdownMenuLabel>My Account</NeuDropdownMenuLabel>
    <NeuDropdownMenuSeparator />
    <NeuDropdownMenuGroup>
      <NeuDropdownMenuItem>
        Profile
        <NeuDropdownMenuShortcut>⇧⌘P</NeuDropdownMenuShortcut>
      </NeuDropdownMenuItem>
      <NeuDropdownMenuItem>
        Settings
        <NeuDropdownMenuShortcut>⌘S</NeuDropdownMenuShortcut>
      </NeuDropdownMenuItem>
    </NeuDropdownMenuGroup>
  </NeuDropdownMenuContent>
</NeuDropdownMenu>
```

#### **Com Checkbox Items**

```tsx
function StatusMenu() {
  const [showPanel, setShowPanel] = React.useState(true);
  const [showSidebar, setShowSidebar] = React.useState(true);

  return (
    <NeuDropdownMenu>
      <NeuDropdownMenuTrigger asChild>
        <NeuButton>View</NeuButton>
      </NeuDropdownMenuTrigger>
      <NeuDropdownMenuContent>
        <NeuDropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          Show Panel
        </NeuDropdownMenuCheckboxItem>
        <NeuDropdownMenuCheckboxItem
          checked={showSidebar}
          onCheckedChange={setShowSidebar}
        >
          Show Sidebar
        </NeuDropdownMenuCheckboxItem>
      </NeuDropdownMenuContent>
    </NeuDropdownMenu>
  );
}
```

#### **Com Submenu**

```tsx
<NeuDropdownMenu>
  <NeuDropdownMenuTrigger asChild>
    <NeuButton>More Options</NeuButton>
  </NeuDropdownMenuTrigger>
  <NeuDropdownMenuContent>
    <NeuDropdownMenuItem>New File</NeuDropdownMenuItem>
    <NeuDropdownMenuSub>
      <NeuDropdownMenuSubTrigger>Export As</NeuDropdownMenuSubTrigger>
      <NeuDropdownMenuSubContent>
        <NeuDropdownMenuItem>PDF</NeuDropdownMenuItem>
        <NeuDropdownMenuItem>Excel</NeuDropdownMenuItem>
        <NeuDropdownMenuItem>CSV</NeuDropdownMenuItem>
      </NeuDropdownMenuSubContent>
    </NeuDropdownMenuSub>
    <NeuDropdownMenuSeparator />
    <NeuDropdownMenuItem>Close</NeuDropdownMenuItem>
  </NeuDropdownMenuContent>
</NeuDropdownMenu>
```

#### **Actions Menu (Table)**

```tsx
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

function ProductActions({ product }) {
  return (
    <NeuDropdownMenu>
      <NeuDropdownMenuTrigger asChild>
        <NeuButton variant="ghost" size="icon">
          <MoreHorizontal className="w-4 h-4" />
        </NeuButton>
      </NeuDropdownMenuTrigger>
      <NeuDropdownMenuContent align="end">
        <NeuDropdownMenuLabel>Ações</NeuDropdownMenuLabel>
        <NeuDropdownMenuSeparator />
        <NeuDropdownMenuItem onClick={() => handleView(product)}>
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalhes
        </NeuDropdownMenuItem>
        <NeuDropdownMenuItem onClick={() => handleEdit(product)}>
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </NeuDropdownMenuItem>
        <NeuDropdownMenuSeparator />
        <NeuDropdownMenuItem
          onClick={() => handleDelete(product)}
          className="text-[var(--neu-error)]"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </NeuDropdownMenuItem>
      </NeuDropdownMenuContent>
    </NeuDropdownMenu>
  );
}
```

---

### 2. NeuAvatar - Avatar Neumorphic

#### **Tamanhos Disponíveis**

```tsx
import { NeuAvatar, NeuAvatarImage, NeuAvatarFallback } from "@/components/ui/neu-avatar";

// Extra Small
<NeuAvatar size="xs">
  <NeuAvatarImage src="/avatar.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// Small
<NeuAvatar size="sm">
  <NeuAvatarImage src="/avatar.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// Medium (default)
<NeuAvatar size="md">
  <NeuAvatarImage src="/avatar.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// Large
<NeuAvatar size="lg">
  <NeuAvatarImage src="/avatar.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// Extra Large
<NeuAvatar size="xl">
  <NeuAvatarImage src="/avatar.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// 2X Large
<NeuAvatar size="2xl">
  <NeuAvatarImage src="/avatar.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// 3X Large
<NeuAvatar size="3xl">
  <NeuAvatarImage src="/avatar.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>
```

#### **Com Status Indicator**

```tsx
// Online (green)
<NeuAvatar size="md" status="online" showStatus>
  <NeuAvatarImage src="/user.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// Offline (gray)
<NeuAvatar size="md" status="offline" showStatus>
  <NeuAvatarImage src="/user.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// Busy (red)
<NeuAvatar size="md" status="busy" showStatus>
  <NeuAvatarImage src="/user.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>

// Away (yellow)
<NeuAvatar size="md" status="away" showStatus>
  <NeuAvatarImage src="/user.jpg" alt="User" />
  <NeuAvatarFallback>JD</NeuAvatarFallback>
</NeuAvatar>
```

#### **Avatar Group (Overlapping)**

```tsx
import { NeuAvatarGroup } from "@/components/ui/neu-avatar";

<NeuAvatarGroup max={4} size="md">
  <NeuAvatar>
    <NeuAvatarImage src="/user1.jpg" alt="User 1" />
    <NeuAvatarFallback>JD</NeuAvatarFallback>
  </NeuAvatar>
  <NeuAvatar>
    <NeuAvatarImage src="/user2.jpg" alt="User 2" />
    <NeuAvatarFallback>AS</NeuAvatarFallback>
  </NeuAvatar>
  <NeuAvatar>
    <NeuAvatarImage src="/user3.jpg" alt="User 3" />
    <NeuAvatarFallback>MK</NeuAvatarFallback>
  </NeuAvatar>
  <NeuAvatar>
    <NeuAvatarImage src="/user4.jpg" alt="User 4" />
    <NeuAvatarFallback>LR</NeuAvatarFallback>
  </NeuAvatar>
  <NeuAvatar>
    <NeuAvatarImage src="/user5.jpg" alt="User 5" />
    <NeuAvatarFallback>TR</NeuAvatarFallback>
  </NeuAvatar>
</NeuAvatarGroup>
// Exibe primeiros 4 + "+1" para o resto
```

#### **Avatar com Dropdown (User Menu)**

```tsx
function UserMenu({ user }) {
  return (
    <NeuDropdownMenu>
      <NeuDropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <NeuAvatar size="md" status="online" showStatus>
            <NeuAvatarImage src={user.avatar} alt={user.name} />
            <NeuAvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('')}
            </NeuAvatarFallback>
          </NeuAvatar>
        </button>
      </NeuDropdownMenuTrigger>
      <NeuDropdownMenuContent align="end">
        <NeuDropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="neu-text-body font-medium">{user.name}</p>
            <p className="neu-text-caption text-[var(--neu-text-muted)]">
              {user.email}
            </p>
          </div>
        </NeuDropdownMenuLabel>
        <NeuDropdownMenuSeparator />
        <NeuDropdownMenuItem>Profile</NeuDropdownMenuItem>
        <NeuDropdownMenuItem>Settings</NeuDropdownMenuItem>
        <NeuDropdownMenuSeparator />
        <NeuDropdownMenuItem>Logout</NeuDropdownMenuItem>
      </NeuDropdownMenuContent>
    </NeuDropdownMenu>
  );
}
```

#### **Employee Table com Avatar**

```tsx
function EmployeeRow({ employee }) {
  return (
    <tr>
      <td className="flex items-center gap-3 py-3">
        <NeuAvatar size="sm" status={employee.is_active ? "online" : "offline"} showStatus>
          <NeuAvatarImage src={employee.avatar} alt={employee.name} />
          <NeuAvatarFallback>
            {employee.name.split(' ').map(n => n[0]).join('')}
          </NeuAvatarFallback>
        </NeuAvatar>
        <div>
          <p className="neu-text-body font-medium">{employee.name}</p>
          <p className="neu-text-caption text-[var(--neu-text-muted)]">
            {employee.role}
          </p>
        </div>
      </td>
      {/* ... outras colunas */}
    </tr>
  );
}
```

---

## 🎨 **Design Neumorphic Details**

### **NeuDropdownMenu:**

**Content:**
```
Background: neu-surface
Effect: neu-convex-lg (popup raised)
Border: neu-border
Backdrop: backdrop-blur-sm
Rounded: rounded-2xl
Padding: p-1
```

**Items:**
```
Default: neu-text-body
Hover: bg-[neu-surface-hover] + neu-convex-xs
Focus: bg-[neu-surface-hover]
Disabled: opacity-50
Rounded: rounded-xl
Padding: px-3 py-2
```

**Shortcuts:**
```
Background: neu-surface
Effect: neu-convex-xs
Rounded: rounded
Padding: px-2 py-0.5
Color: neu-text-muted
```

**Animations:**
```
Enter: fade-in + zoom-in (95% → 100%)
Exit: fade-out + zoom-out (100% → 95%)
Duration: 150ms
```

---

### **NeuAvatar:**

**Container:**
```
Background: neu-surface
Effect: neu-convex-sm
Border: 2px solid neu-border
Rounded: rounded-full
Hover: neu-convex-md + scale-105
```

**Status Indicator:**
```
Position: absolute bottom-0 right-0
Effect: neu-convex-xs
Border: 2px solid neu-surface
Rounded: rounded-full
Colors:
  - online: neu-success
  - offline: neu-text-muted
  - busy: neu-error
  - away: neu-warning
```

**Fallback:**
```
Background: neu-surface
Text: neu-text-body font-semibold
Color: neu-text-primary
Centered: flex items-center justify-center
```

---

## 📊 **Tamanhos e Proporções**

### **NeuAvatar Sizes:**

| Size | Dimensão | Font Size | Status Indicator |
|------|----------|-----------|------------------|
| xs   | 32px (w-8 h-8) | text-xs | 8px (w-2 h-2) |
| sm   | 40px (w-10 h-10) | text-sm | 10px (w-2.5 h-2.5) |
| md   | 48px (w-12 h-12) | text-base | 12px (w-3 h-3) |
| lg   | 64px (w-16 h-16) | text-lg | 16px (w-4 h-4) |
| xl   | 80px (w-20 h-20) | text-xl | 20px (w-5 h-5) |
| 2xl  | 96px (w-24 h-24) | text-2xl | 24px (w-6 h-6) |
| 3xl  | 128px (w-32 h-32) | text-3xl | 32px (w-8 h-8) |

---

## ✨ **Features Avançadas**

### **NeuDropdownMenu:**
- ✅ Submenu support (nested menus)
- ✅ Checkbox items (toggle options)
- ✅ Radio items (single selection)
- ✅ Keyboard shortcuts display
- ✅ Icons support
- ✅ Disabled items
- ✅ Custom alignment (start, center, end)
- ✅ Side positioning (top, right, bottom, left)

### **NeuAvatar:**
- ✅ Status indicators (4 states)
- ✅ Hover scale effect
- ✅ Focus ring
- ✅ Fallback with initials
- ✅ Avatar groups with overlap
- ✅ Remaining count display (+N)
- ✅ 7 size options

---

## 🚀 **Casos de Uso**

### **NeuDropdownMenu:**
1. **User Menu** - Sidebar avatar dropdown
2. **Table Actions** - Edit/Delete/View actions em tabelas
3. **Context Menu** - Right-click menus
4. **Settings Menu** - Opções de configuração
5. **Export Options** - Formatos de exportação

### **NeuAvatar:**
1. **User Profile** - Avatar do usuário logado
2. **Employee Table** - Listagem de funcionários
3. **Team Display** - Grupo de membros da equipe
4. **Comments** - Avatar em comentários
5. **Company Logo** - Logo da empresa (sizes maiores)

---

## 📝 **Exemplos Práticos**

### **Sidebar User Menu:**
```tsx
function SidebarUserMenu() {
  const user = useUser();

  return (
    <div className="p-4 border-t border-[var(--neu-border)]">
      <NeuDropdownMenu>
        <NeuDropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full hover:bg-[var(--neu-surface-hover)] p-2 rounded-xl transition-colors">
            <NeuAvatar size="md" status="online" showStatus>
              <NeuAvatarImage src={user.avatar} alt={user.name} />
              <NeuAvatarFallback>{user.initials}</NeuAvatarFallback>
            </NeuAvatar>
            <div className="flex-1 text-left">
              <p className="neu-text-body font-medium">{user.name}</p>
              <p className="neu-text-caption text-[var(--neu-text-muted)]">
                {user.role}
              </p>
            </div>
          </button>
        </NeuDropdownMenuTrigger>
        <NeuDropdownMenuContent align="end" className="w-56">
          <NeuDropdownMenuLabel>Minha Conta</NeuDropdownMenuLabel>
          <NeuDropdownMenuSeparator />
          <NeuDropdownMenuItem>
            Perfil
            <NeuDropdownMenuShortcut>⇧⌘P</NeuDropdownMenuShortcut>
          </NeuDropdownMenuItem>
          <NeuDropdownMenuItem>
            Configurações
            <NeuDropdownMenuShortcut>⌘S</NeuDropdownMenuShortcut>
          </NeuDropdownMenuItem>
          <NeuDropdownMenuSeparator />
          <NeuDropdownMenuItem className="text-[var(--neu-error)]">
            Sair
          </NeuDropdownMenuItem>
        </NeuDropdownMenuContent>
      </NeuDropdownMenu>
    </div>
  );
}
```

### **Team Members Display:**
```tsx
function TeamMembers({ members }) {
  return (
    <div className="space-y-4">
      <h3 className="neu-text-h3">Equipe</h3>
      <NeuAvatarGroup max={5} size="md">
        {members.map((member) => (
          <NeuAvatar key={member.id} status={member.status} showStatus>
            <NeuAvatarImage src={member.avatar} alt={member.name} />
            <NeuAvatarFallback>{member.initials}</NeuAvatarFallback>
          </NeuAvatar>
        ))}
      </NeuAvatarGroup>
      <p className="neu-text-caption text-[var(--neu-text-muted)]">
        {members.length} membros ativos
      </p>
    </div>
  );
}
```

---

## 🎯 **Resultado Final**

Seu ERP agora possui:
- ✅ **9 Componentes Neumorphic completos:** Button, Card, Input, Select, Dialog, Switch, Textarea, DropdownMenu, Avatar
- ✅ Menu suspenso profissional com shortcuts
- ✅ Avatares com status indicators
- ✅ Avatar groups com overlap
- ✅ Design system 100% consistente
- ✅ Acessibilidade garantida
- ✅ Type-safe com CVA

---

## 🔗 **Referências**

- **Radix UI DropdownMenu:** https://www.radix-ui.com/primitives/docs/components/dropdown-menu
- **Radix UI Avatar:** https://www.radix-ui.com/primitives/docs/components/avatar
- **CVA Documentation:** https://cva.style/docs
- **Design System:** `F:\berp\src\app\globals.css`

---

**Criado:** 28/12/2025  
**Autor:** Letta Code  
**Status:** ✅ Completo  
**Versão:** 1.0.0
