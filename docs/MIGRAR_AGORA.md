# 🚀 MIGRAÇÃO RÁPIDA - Execute Agora!

## ⚡ SCRIPT AUTOMÁTICO DE MIGRAÇÃO

Cole este script no terminal do VS Code ou execute manualmente:

### Para Windows (PowerShell):

```powershell
# Navegar para o diretório do projeto
cd F:\berp

# Fazer backup primeiro
git add .
git commit -m "backup: antes da migração automática dual theme"

# Arquivos para migrar
$files = @(
    "src/components/dashboard/TrendChart.tsx",
    "src/components/dashboard/TopProductsRanking.tsx",
    "src/components/dashboard/PaymentDistribution.tsx",
    "src/components/dashboard/InventoryAlerts.tsx",
    "src/components/dashboard/DashboardSkeleton.tsx"
)

foreach ($file in $files) {
    Write-Host "Migrando: $file"
    
    # Ler conteúdo
    $content = Get-Content $file -Raw
    
    # Substituições
    $content = $content -replace 'bg-slate-900/95', 'bg-white/95 dark:bg-slate-900/95'
    $content = $content -replace 'bg-slate-900/50', 'bg-white/80 dark:bg-slate-900/50'
    $content = $content -replace 'bg-slate-900/20', 'bg-white/20 dark:bg-slate-900/20'
    $content = $content -replace 'border-slate-800', 'border-slate-300 dark:border-slate-800'
    $content = $content -replace 'border-slate-700', 'border-slate-300 dark:border-slate-700'
    $content = $content -replace '([^-])text-white([^-])', '$1text-slate-900 dark:text-white$2'
    $content = $content -replace 'text-slate-400', 'text-slate-600 dark:text-slate-400'
    $content = $content -replace 'text-slate-300', 'text-slate-700 dark:text-slate-300'
    
    # Salvar
    $content | Set-Content $file -NoNewline
    Write-Host "  ✓ Migrado!" -ForegroundColor Green
}

Write-Host "`n✅ Migração completa!" -ForegroundColor Green
Write-Host "📝 Execute: git diff para ver as mudanças"
```

---

## 🎯 OU USE VS CODE FIND & REPLACE

**Mais confiável e seguro!**

### Passo a passo:

1. **Abra VS Code**
2. **Ctrl + Shift + H** (Find & Replace in Files)
3. **Configure**:
   - Files to include: `src/components/dashboard/**/*.tsx, src/app/inventory/**/*.tsx, src/app/sales/**/*.tsx`
   - Use Regular Expression: ✅ (ícone `.*`)

4. **Execute estas substituições UMA POR VEZ**:

#### Substituição 1: Backgrounds dark
```
Find: bg-slate-900/95
Replace: bg-white/95 dark:bg-slate-900/95
```
**Preview** → **Replace All**

#### Substituição 2: Backgrounds medium
```
Find: bg-slate-900/50
Replace: bg-white/80 dark:bg-slate-900/50
```
**Replace All**

#### Substituição 3: Backgrounds light
```
Find: bg-slate-900/20
Replace: bg-white/20 dark:bg-slate-900/20
```
**Replace All**

#### Substituição 4: Backgrounds solid
```
Find: bg-slate-900([^/])
Replace: bg-white dark:bg-slate-900$1
Use Regex: ✅
```
**Replace All**

#### Substituição 5: Borders dark
```
Find: border-slate-800
Replace: border-slate-300 dark:border-slate-800
```
**Replace All**

#### Substituição 6: Borders medium
```
Find: border-slate-700
Replace: border-slate-300 dark:border-slate-700
```
**Replace All**

#### Substituição 7: Text white (CUIDADO - usar regex)
```
Find: ([^-])text-white([^-])
Replace: $1text-slate-900 dark:text-white$2
Use Regex: ✅
```
**Replace All**

#### Substituição 8: Text slate-400
```
Find: text-slate-400
Replace: text-slate-600 dark:text-slate-400
```
**Replace All**

#### Substituição 9: Text slate-300
```
Find: text-slate-300
Replace: text-slate-700 dark:text-slate-300
```
**Replace All**

#### Substituição 10: Hover states
```
Find: hover:bg-slate-800
Replace: hover:bg-slate-200 dark:hover:bg-slate-800
```
**Replace All**

---

## ✅ VALIDAÇÃO

Após executar as substituições:

1. **Verificar compilação**:
```bash
npm run dev
# Deve compilar sem erros
```

2. **Testar visualmente**:
- Abrir http://localhost:3000/dashboard
- Clicar no toggle (sol/lua) na Sidebar
- Alternar entre Light e Dark
- Verificar se todos os componentes mudam de cor

3. **Verificar contraste**:
- No Light Mode: Textos devem ser escuros e legíveis
- No Dark Mode: Textos devem ser claros e brilhantes
- Nenhum "fantasma" (texto invisível)

---

## 🐛 SE ALGO DER ERRADO

### Reverter mudanças:
```bash
git reset --hard HEAD
```

### Ver o que mudou:
```bash
git diff
```

### Commitar progresso:
```bash
git add .
git commit -m "feat: migrar componentes dashboard para dual theme"
```

---

## 📊 PROGRESSO ESPERADO

Após executar todas as substituições:

```
Dashboard Components:
✅ TrendChart.tsx
✅ TopProductsRanking.tsx
✅ PaymentDistribution.tsx
✅ InventoryAlerts.tsx
✅ DashboardSkeleton.tsx

Progresso: 30% → 60% 🎯
```

---

## 🎯 PRÓXIMOS ARQUIVOS

Depois de completar os componentes do Dashboard, aplicar as MESMAS substituições em:

1. `src/app/inventory/page.tsx`
2. `src/app/sales/page.tsx`
3. `src/app/sales/pos/page.tsx`

**Use o mesmo processo** de Find & Replace!

---

## 💡 DICAS

1. **Faça um arquivo por vez** se preferir controle
2. **Use Preview** antes de Replace All
3. **Teste após cada substituição** importante
4. **Comite frequentemente** para poder reverter

---

## 🚀 COMEÇAR AGORA

Escolha seu método:

- [ ] **Método 1**: PowerShell Script (rápido, automático)
- [ ] **Método 2**: VS Code Find & Replace (recomendado, seguro)
- [ ] **Método 3**: Manual (arquivo por arquivo, lento mas seguro)

**RECOMENDAÇÃO**: Use **Método 2** (VS Code Find & Replace)

---

🌓 **Vamos completar essa migração! Você está a 10 substituições de ter 60% do sistema pronto!**

*Data: 19/12/2025*  
*Status: Pronto para executar*
