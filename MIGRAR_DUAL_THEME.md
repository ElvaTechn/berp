# 🔧 Guia de Migração Manual - Dual Theme

## ✅ JÁ MIGRADOS

1. ✅ **Sidebar** - 100% completo
2. ✅ **Dashboard page** - Backgrounds e textos principais
3. ✅ **KPICard** - Textos adaptativos
4. ✅ **ThemeToggle** - Funcionando perfeitamente

## 🚧 FALTAM MIGRAR

### Componentes do Dashboard
- `src/components/dashboard/TrendChart.tsx`
- `src/components/dashboard/TopProductsRanking.tsx`
- `src/components/dashboard/PaymentDistribution.tsx`
- `src/components/dashboard/InventoryAlerts.tsx`
- `src/components/dashboard/DashboardSkeleton.tsx`

### Páginas Principais
- `src/app/inventory/page.tsx`
- `src/app/sales/pos/page.tsx`
- `src/app/sales/page.tsx`

---

## 📋 SUBSTITUIÇÕES NECESSÁRIAS

Execute as seguintes substituições em TODOS os arquivos listados acima:

### 1. Backgrounds
```typescript
// Fundo principal
bg-[#050505] → bg-slate-50 dark:bg-[#050505]
bg-black → bg-slate-50 dark:bg-black

// Fundo secundário
bg-[#0a0a0a] → bg-white dark:bg-[#0a0a0a]

// Cards e containers
bg-slate-900/50 → bg-white/50 dark:bg-slate-900/50
bg-slate-900/95 → bg-white/95 dark:bg-slate-900/95
```

### 2. Textos
```typescript
// Títulos principais
text-white → text-slate-900 dark:text-white

// Textos secundários
text-slate-400 → text-slate-600 dark:text-slate-400
text-slate-300 → text-slate-700 dark:text-slate-300

// Textos muted (mantém em ambos)
text-slate-500 → text-slate-500 dark:text-slate-500
text-slate-600 → text-slate-500 dark:text-slate-600
```

### 3. Bordas
```typescript
border-white/5 → border-slate-200 dark:border-white/5
border-white/10 → border-slate-200 dark:border-white/10
border-slate-800 → border-slate-300 dark:border-slate-800
border-slate-700 → border-slate-300 dark:border-slate-700
```

### 4. Hovers
```typescript
hover:bg-white/5 → hover:bg-slate-100 dark:hover:bg-white/5
hover:bg-white/10 → hover:bg-slate-200 dark:hover:bg-white/10
hover:bg-slate-800 → hover:bg-slate-200 dark:hover:bg-slate-800
```

---

## 🎨 CASOS ESPECIAIS

### Gráficos Recharts

NO ARQUIVO `TrendChart.tsx`, atualizar o CustomTooltip:

```typescript
// ANTES
className="bg-slate-900/95 backdrop-blur-xl border border-slate-700"

// DEPOIS
className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-300 dark:border-slate-700"
```

E os textos dentro:
```typescript
text-slate-400 → text-slate-600 dark:text-slate-400
text-slate-300 → text-slate-700 dark:text-slate-300
text-white → text-slate-900 dark:text-white
```

### Tabelas (Inventory, Sales)

```typescript
// Header da tabela
className="bg-slate-800 → bg-slate-100 dark:bg-slate-800"

// Linhas
className="even:bg-slate-900/50 → even:bg-slate-50 dark:even:bg-slate-900/50"

// Hover
className="hover:bg-slate-800 → hover:bg-slate-100 dark:hover:bg-slate-800"
```

### Modais e Slide-overs

```typescript
// Background do modal
className="bg-[#0a0a0a] → bg-white dark:bg-[#0a0a0a]"

// Backdrop
className="bg-black/80 → bg-black/60 dark:bg-black/80"

// Header do modal
className="border-b border-white/10 → border-b border-slate-200 dark:border-white/10"
```

---

## 🚀 SCRIPT DE MIGRAÇÃO RÁPIDA

Para VS Code, use Find & Replace (Ctrl+H) com estas regex:

### 1. Backgrounds principais
```
Find: className="([^"]*?)bg-\[#050505\]([^"]*?)"
Replace: className="$1bg-slate-50 dark:bg-[#050505]$2"
```

### 2. Text white
```
Find: text-white([^-])
Replace: text-slate-900 dark:text-white$1
```

### 3. Borders
```
Find: border-white/10
Replace: border-slate-200 dark:border-white/10
```

**ATENÇÃO**: Teste cada substituição antes de aplicar em todos os arquivos!

---

## ✅ COMO TESTAR

Após fazer as substituições:

1. **Salve todos os arquivos**
2. **Verifique se não há erros de compilação**
3. **Acesse cada página:**
   - `/dashboard` - Dashboard principal
   - `/inventory` - Gestão de stock
   - `/sales/pos` - PDV
   - `/sales` - Histórico de vendas

4. **Teste o toggle de tema** na Sidebar:
   - Light mode: Tudo deve ser claro, texto escuro
   - Dark mode: Tudo deve ser escuro, texto claro

5. **Verifique contraste:**
   - ✅ Textos devem ser legíveis
   - ✅ Não deve haver "fantasmas" (texto invisível)
   - ✅ Cards devem ter sombras suaves no light mode

---

## 🐛 PROBLEMAS COMUNS

### Texto invisível no light mode?
- Procure por `text-white` sem `dark:` prefix
- Adicione: `text-slate-900 dark:text-white`

### Fundo branco demais?
- Troque `bg-white` por `bg-slate-50`
- Mantém o aspecto premium

### Bordas invisíveis no light?
- Procure por `border-white/10` sem `dark:` prefix
- Use: `border-slate-200 dark:border-white/10`

### Cards sem sombra no light?
- Use a classe `.card` do globals.css
- Ou adicione: `shadow-sm hover:shadow-md`

---

## 📊 PRIORIDADE DE MIGRAÇÃO

1. **Alta Prioridade** (fazer primeiro):
   - ✅ Sidebar (FEITO)
   - ✅ Dashboard page (FEITO)
   - ✅ KPICard (FEITO)
   - 🔄 TrendChart (componente visual principal)
   - 🔄 TopProductsRanking (muito visual)

2. **Média Prioridade**:
   - InventoryAlerts
   - PaymentDistribution
   - Inventory page
   - Sales page

3. **Baixa Prioridade** (funcionam ok mesmo sem migração):
   - DashboardSkeleton (loading state)
   - Componentes de settings
   - Páginas secundárias

---

## 💡 DICAS FINAIS

1. **Use Find & Replace com cuidado** - Teste em um arquivo primeiro
2. **Sempre adicione `dark:` prefix** - É melhor ter redundância
3. **Mantenha gradientes** - Eles funcionam em ambos os temas
4. **Teste em ambos os temas** - Sempre alterne e verifique
5. **Use as classes do globals.css** - `.card`, `.card-blue`, `.glass`

---

## 📞 SUPORTE

Se algo não funcionar:
1. Verifique o console do navegador (F12)
2. Confira se todos os arquivos foram salvos
3. Recarregue a página (Ctrl+F5)
4. Verifique o tema no toggle da Sidebar

---

**Status da Migração**: 30% completo  
**Próximo passo**: Migrar componentes do Dashboard  
**Tempo estimado**: 30-60 minutos para migração completa  

🌓 **Dual Theme System** - Light High-Tech & Dark Maximalist
