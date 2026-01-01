# 🌓 Guia Completo: Dual Theme System

## ✨ Light High-Tech & Dark Maximalist

Sistema de temas implementado com **next-themes** mantendo a estética ousada e maximalist em ambos os modos.

---

## 📦 IMPLEMENTAÇÃO COMPLETA

### Arquivos Criados/Modificados

1. ✅ **package.json** - Adicionado `next-themes@^0.4.4`
2. ✅ **src/app/globals.css** - CSS Variables para ambos os temas
3. ✅ **src/components/theme-provider.tsx** - Provider do next-themes
4. ✅ **src/components/theme-toggle.tsx** - Botão de alternância elegante
5. ✅ **src/app/layout.tsx** - Integração do ThemeProvider
6. ✅ **src/components/layout/Sidebar.tsx** - Atualizada para dual theme

---

## 🎨 PALETA DE CORES

### Light Mode - Clean High-Tech
```css
/* Backgrounds */
--background: #ffffff           /* Branco Puro */
--background-secondary: #f8fafc /* Cinza Cristalino */
--background-tertiary: #f1f5f9  /* Cinza Sutil */

/* Foregrounds */
--foreground: #0f172a           /* Slate 950 - não preto puro */
--foreground-secondary: #1e293b /* Slate 800 */
--foreground-muted: #475569     /* Slate 600 */

/* Primary */
--primary: #2563eb              /* Blue 600 */
--primary-hover: #1d4ed8        /* Blue 700 */

/* Accents - Sombras Coloridas */
--accent-blue: #3b82f6
--accent-purple: #8b5cf6
--accent-green: #10b981
--accent-orange: #f59e0b
--accent-red: #ef4444
```

### Dark Mode - Nave Espacial
```css
/* Backgrounds */
--background: #050505           /* Preto Absoluto */
--background-secondary: #0a0a0a /* Preto Espacial */
--background-tertiary: #141414  /* Cinza Escuro */

/* Foregrounds */
--foreground: #ffffff           /* Branco Puro */
--foreground-secondary: #e2e8f0 /* Slate 200 */
--foreground-muted: #94a3b8     /* Slate 400 */

/* Primary */
--primary: #3b82f6              /* Blue 500 Neon */
--primary-hover: #60a5fa        /* Blue 400 */

/* Accents - Neon */
--accent-blue: #60a5fa
--accent-purple: #a78bfa
--accent-green: #34d399
--accent-orange: #fbbf24
--accent-red: #f87171
```

---

## 🚀 COMO USAR

### 1. Instalar Dependência
```bash
npm install next-themes
```

### 2. Componentes com Dual Theme

#### Exemplo: Card com Background Adaptativo
```tsx
<div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl p-6">
  <h2 className="text-slate-900 dark:text-white font-black text-2xl">
    Título do Card
  </h2>
  <p className="text-slate-600 dark:text-slate-400 mt-2">
    Descrição que funciona em ambos os temas
  </p>
</div>
```

#### Exemplo: Card com Sombra Colorida (Light Only)
```tsx
<div className="card card-blue">
  {/* No light mode: sombra azul suave */}
  {/* No dark mode: sombra padrão */}
  <h3 className="text-slate-900 dark:text-white font-bold">
    Faturação Total
  </h3>
  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
    125.000 MZN
  </p>
</div>
```

### 3. Texto com Cores Adaptativas

```tsx
{/* Título Principal */}
<h1 className="text-slate-950 dark:text-white font-black">

{/* Subtítulo */}
<h2 className="text-slate-800 dark:text-slate-200 font-bold">

{/* Texto Normal */}
<p className="text-slate-600 dark:text-slate-400">

{/* Texto Muted */}
<span className="text-slate-500 dark:text-slate-500">

{/* Link */}
<a className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
```

### 4. Botões Adaptativos

```tsx
{/* Primary Button */}
<button className="
  bg-gradient-to-r from-blue-600 to-indigo-600 
  hover:from-blue-700 hover:to-indigo-700
  text-white
  font-bold px-6 py-3 rounded-xl
  shadow-lg shadow-blue-500/30
">
  Ação Principal
</button>

{/* Secondary Button */}
<button className="
  bg-slate-100 dark:bg-white/10 
  hover:bg-slate-200 dark:hover:bg-white/20
  text-slate-900 dark:text-white
  font-bold px-6 py-3 rounded-xl
  border border-slate-300 dark:border-white/10
">
  Ação Secundária
</button>

{/* Outline Button */}
<button className="
  bg-transparent 
  hover:bg-slate-100 dark:hover:bg-white/5
  text-slate-900 dark:text-white
  font-bold px-6 py-3 rounded-xl
  border-2 border-slate-300 dark:border-white/20
">
  Cancelar
</button>
```

### 5. Inputs e Forms

```tsx
<input 
  type="text"
  className="
    w-full px-4 py-3 rounded-xl
    bg-white dark:bg-[#0a0a0a]
    border border-slate-300 dark:border-white/10
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:outline-none focus:ring-2 focus:ring-blue-500
    focus:border-transparent
  "
  placeholder="Digite aqui..."
/>
```

### 6. Cards com Variantes de Sombra

```tsx
{/* Blue Shadow */}
<div className="card card-blue">
  <h3>Vendas</h3>
</div>

{/* Purple Shadow */}
<div className="card card-purple">
  <h3>Produtos</h3>
</div>

{/* Green Shadow */}
<div className="card card-green">
  <h3>Lucro</h3>
</div>

{/* Orange Shadow */}
<div className="card card-orange">
  <h3>Alertas</h3>
</div>
```

### 7. Glass Effect

```tsx
<div className="glass p-6 rounded-xl">
  {/* Efeito de vidro com backdrop blur */}
  <p className="text-slate-900 dark:text-white">
    Conteúdo com efeito de vidro
  </p>
</div>
```

---

## 🎯 PADRÕES DE USO

### ✅ FAÇA

1. **Use `text-slate-900` no light mode** ao invés de `text-black`
   - Mantém o aspecto premium sem cansar a vista

2. **Use sombras coloridas nos cards** (light mode)
   ```tsx
   className="card card-blue"
   ```

3. **Adicione `dark:` prefix em todas as cores**
   ```tsx
   className="bg-white dark:bg-[#0a0a0a]"
   ```

4. **Mantenha a tipografia bold/black/italic**
   ```tsx
   className="font-black italic text-slate-900 dark:text-white"
   ```

5. **Use gradientes em botões primários**
   ```tsx
   className="bg-gradient-to-r from-blue-600 to-indigo-600"
   ```

### ❌ NÃO FAÇA

1. **Não use preto puro `#000000`** no light mode
   - Use `text-slate-900` ou `text-slate-950`

2. **Não use bordas cinzas simples** no light mode
   - Use sombras coloridas para manter o visual ousado

3. **Não esqueça o `dark:` prefix**
   ```tsx
   ❌ className="bg-white"
   ✅ className="bg-white dark:bg-[#0a0a0a]"
   ```

4. **Não use `bg-gray-100`** genérico
   - Use cores específicas da paleta

5. **Não perca a estética maximalist**
   - Mantenha sombras, gradientes e tipografia ousada

---

## 🎨 COMPONENTES COMUNS

### Card Estatística
```tsx
<div className="card card-blue">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
      Faturação Total
    </h3>
    <DollarSign className="w-5 h-5 text-blue-500" />
  </div>
  <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">
    125.000
  </p>
  <p className="text-xs text-slate-500 dark:text-slate-500">
    MZN este mês
  </p>
  <div className="mt-4 flex items-center gap-2">
    <span className="text-green-600 dark:text-green-400 text-sm font-bold">
      +12%
    </span>
    <span className="text-slate-500 dark:text-slate-500 text-xs">
      vs. mês passado
    </span>
  </div>
</div>
```

### Lista com Hover
```tsx
<div className="space-y-2">
  {items.map(item => (
    <div key={item.id} className="
      p-4 rounded-xl
      bg-white dark:bg-[#0a0a0a]
      border border-slate-200 dark:border-white/5
      hover:border-blue-500 dark:hover:border-blue-500/50
      hover:shadow-lg hover:shadow-blue-500/10
      transition-all duration-300
      cursor-pointer
    ">
      <h4 className="font-bold text-slate-900 dark:text-white">
        {item.title}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        {item.description}
      </p>
    </div>
  ))}
</div>
```

### Badge de Status
```tsx
{/* Success */}
<span className="
  px-3 py-1 rounded-full text-xs font-bold
  bg-green-100 dark:bg-green-500/20
  text-green-700 dark:text-green-400
  border border-green-200 dark:border-green-500/30
">
  Ativo
</span>

{/* Warning */}
<span className="
  px-3 py-1 rounded-full text-xs font-bold
  bg-orange-100 dark:bg-orange-500/20
  text-orange-700 dark:text-orange-400
  border border-orange-200 dark:border-orange-500/30
">
  Pendente
</span>

{/* Error */}
<span className="
  px-3 py-1 rounded-full text-xs font-bold
  bg-red-100 dark:bg-red-500/20
  text-red-700 dark:text-red-400
  border border-red-200 dark:border-red-500/30
">
  Inativo
</span>
```

---

## 🔧 USAR O THEME NO CÓDIGO

### Hook useTheme
```tsx
'use client';

import { useTheme } from 'next-themes';

export function MyComponent() {
  const { theme, setTheme, systemTheme } = useTheme();

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div>
      <p>Tema atual: {currentTheme}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Renderização Condicional por Tema
```tsx
import { useTheme } from 'next-themes';

export function Logo() {
  const { theme } = useTheme();

  return (
    <>
      {theme === 'light' ? (
        <img src="/logo-dark.svg" alt="Logo" />
      ) : (
        <img src="/logo-light.svg" alt="Logo" />
      )}
    </>
  );
}
```

---

## 📊 GRÁFICOS (Recharts)

### Atualizar cores dos gráficos
```tsx
import { useTheme } from 'next-themes';

export function MyChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <LineChart data={data}>
      <XAxis 
        stroke={isDark ? '#94a3b8' : '#475569'} 
        tick={{ fill: isDark ? '#94a3b8' : '#475569' }}
      />
      <YAxis 
        stroke={isDark ? '#94a3b8' : '#475569'}
        tick={{ fill: isDark ? '#94a3b8' : '#475569' }}
      />
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke={isDark ? '#60a5fa' : '#2563eb'}
        strokeWidth={3}
      />
    </LineChart>
  );
}
```

---

## 🎭 TRANSIÇÕES SUAVES

As transições entre temas são automáticas! O CSS já tem:

```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
```

Para desabilitar em elementos específicos:
```tsx
className="transition-none"
```

---

## 🧪 TESTAR

### 1. Verificar Temas
- Abra a aplicação
- Clique no toggle de tema na Sidebar
- Verifique se todas as cores mudam suavemente

### 2. Verificar Persistência
- Troque de tema
- Recarregue a página (F5)
- O tema deve permanecer

### 3. Verificar System
- Selecione "System" no toggle
- Mude o tema do seu sistema operacional
- A aplicação deve seguir automaticamente

### 4. Verificar Hydration
- Não deve haver "flash" de tema ao carregar
- O `suppressHydrationWarning` previne avisos

---

## 📝 CHECKLIST DE MIGRAÇÃO

Ao atualizar componentes existentes:

- [ ] Trocar `bg-[#050505]` por `bg-white dark:bg-[#050505]`
- [ ] Trocar `text-white` por `text-slate-900 dark:text-white`
- [ ] Trocar `text-gray-*` por `text-slate-* dark:text-slate-*`
- [ ] Trocar `border-white/10` por `border-slate-200 dark:border-white/10`
- [ ] Adicionar `hover:` states para ambos os temas
- [ ] Testar cards com classe `.card` e variantes de sombra
- [ ] Verificar inputs e formulários
- [ ] Atualizar gráficos com cores dinâmicas
- [ ] Testar badges e status indicators

---

## 🎉 RESULTADO FINAL

**Light Mode**: Parece um software médico de elite ou interface científica moderna. Branco cristalino, sombras coloridas vibrantes, tipografia ousada.

**Dark Mode**: Mantém a estética de "Nave Espacial". Preto profundo, acentos neon, efeitos de brilho.

**Ambos**: Maximalist, ousados, premium, profissionais.

---

## 💡 DICAS FINAIS

1. **Sempre teste ambos os temas** ao criar novos componentes
2. **Use as classes CSS customizadas** (`.card`, `.glass`, etc)
3. **Mantenha a consistência** na tipografia (font-bold, font-black, italic)
4. **Abuse de sombras** no light mode para dar profundidade
5. **Use os accents** nas sombras para manter o visual vibrante

---

**🌓 Implementado com perfeição! Dual Theme Maximalist pronto para produção!**

*Data: 19/12/2025*  
*Status: ✅ COMPLETO*
