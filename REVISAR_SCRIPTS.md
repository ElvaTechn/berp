# ⚠️ PROBLEMA COM SCRIPTS POWERSHELL

## 🚨 ISSUE CRÍTICO

Os scripts PowerShell criaram **classes CSS duplicadas** que quebram o código:

### Exemplo do Problema:
```tsx
// ANTES (correto):
className="text-white"

// DEPOIS DO SCRIPT (incorreto):
className="text-slate-900 dark:text-slate-900 dark:text-white"
//                                    ^^^^^^^^^^^^^^^^^^^^
//                                    DUPLICADO!
```

## 🔧 CAUSA

O regex pattern do script:
```powershell
$content = $content -replace '([^-])text-white([^-])', '$1text-slate-900 dark:text-white$2'
```

Aplicou a substituição MÚLTIPLAS VEZES no mesmo texto, criando duplicatas.

## ✅ SOLUÇÃO

### NÃO USE OS SCRIPTS AUTOMÁTICOS!

Em vez disso:

1. **Opção 1: Reverter e Refazer Manual**
```bash
git checkout src/app/sales/page.tsx
# Depois migre manualmente ou use VS Code Find & Replace
```

2. **Opção 2: Limpar Duplicatas**

Execute no PowerShell:
```powershell
cd F:\berp

$file = "src/app/sales/page.tsx"
$content = Get-Content $file -Raw

# Limpar duplicatas específicas
$content = $content -replace 'text-slate-900 dark:text-slate-900 dark:text-white', 'text-slate-900 dark:text-white'
$content = $content -replace 'text-slate-600 dark:text-slate-600 dark:text-slate-400', 'text-slate-600 dark:text-slate-400'
$content = $content -replace 'text-slate-900 dark:text-slate-900 dark:text-white', 'text-white'
$content = $content -replace 'border-slate-200 dark:border-slate-200 dark:border-white/10', 'border-slate-200 dark:border-white/10'

$content | Set-Content $file -NoNewline

Write-Host "✓ Duplicatas removidas!"
```

3. **Opção 3: Editar Manualmente**

Abra `src/app/sales/page.tsx` no VS Code:
- Ctrl+H (Find & Replace)
- Find: `text-slate-900 dark:text-slate-900 dark:text-white`
- Replace: `text-slate-900 dark:text-white`
- Replace All

Repita para:
- `text-slate-600 dark:text-slate-600 dark:text-slate-400`
- `border-slate-200 dark:border-slate-200 dark:border-white/10`

## 📊 ARQUIVOS AFETADOS

- ✅ `src/app/sales/page.tsx` - Precisa limpeza
- ⚠️ `src/app/sales/pos/page.tsx` - Verificar se tem problema
- ✅ Componentes do Dashboard - Já foram limpos manualmente

## 💡 LIÇÃO APRENDIDA

**Scripts automáticos** são rápidos mas arriscados.

**VS Code Find & Replace** é mais seguro porque:
1. Você vê preview antes de aplicar
2. Não aplica múltiplas vezes
3. Permite reverter facilmente

## 🎯 RECOMENDAÇÃO FINAL

**PARE de usar scripts PowerShell para migração!**

Use apenas:
1. VS Code Find & Replace (seguro)
2. Edit tool manual (mais lento mas 100% seguro)

---

**Status**: Arquivo sales/page.tsx precisa limpeza manual  
**Prioridade**: Alta (bloqueia compilação)  
**Tempo**: 5-10 minutos para limpar
