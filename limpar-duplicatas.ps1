# Script de Limpeza de Duplicatas - Dual Theme
# Pode ser executado multiplas vezes sem problemas

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA DE DUPLICATAS - DUAL THEME" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$files = @(
    "src/app/sales/page.tsx",
    "src/app/sales/pos/page.tsx",
    "src/app/inventory/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Limpando: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Backup
        $backup = $file + ".backup"
        $content | Set-Content $backup -NoNewline
        Write-Host "  [OK] Backup criado: $backup" -ForegroundColor Gray
        
        # LIMPEZA DE DUPLICATAS
        
        # 1. Limpar text-white duplicado
        while ($content -match 'dark:text-slate-900\s+dark:text-white') {
            $content = $content -replace 'dark:text-slate-900\s+dark:text-white', 'dark:text-white'
        }
        
        # 2. Limpar text-slate-400 duplicado
        while ($content -match 'dark:text-slate-600\s+dark:text-slate-400') {
            $content = $content -replace 'dark:text-slate-600\s+dark:text-slate-400', 'dark:text-slate-400'
        }
        
        # 3. Limpar text-slate-300 duplicado
        while ($content -match 'dark:text-slate-700\s+dark:text-slate-300') {
            $content = $content -replace 'dark:text-slate-700\s+dark:text-slate-300', 'dark:text-slate-300'
        }
        
        # 4. Limpar borders duplicados
        while ($content -match 'dark:border-slate-200\s+dark:border-white/10') {
            $content = $content -replace 'dark:border-slate-200\s+dark:border-white/10', 'dark:border-white/10'
        }
        
        while ($content -match 'dark:border-slate-200\s+dark:border-white/5') {
            $content = $content -replace 'dark:border-slate-200\s+dark:border-white/5', 'dark:border-white/5'
        }
        
        # 5. Limpar backgrounds duplicados
        while ($content -match 'dark:bg-slate-900\s+dark:bg-slate-900') {
            $content = $content -replace 'dark:bg-slate-900\s+dark:bg-slate-900', 'dark:bg-slate-900'
        }
        
        while ($content -match 'dark:bg-slate-800\s+dark:bg-slate-800') {
            $content = $content -replace 'dark:bg-slate-800\s+dark:bg-slate-800', 'dark:bg-slate-800'
        }
        
        # 6. Limpar hover duplicados
        while ($content -match 'dark:hover:bg-slate-800\s+dark:hover:bg-slate-800') {
            $content = $content -replace 'dark:hover:bg-slate-800\s+dark:hover:bg-slate-800', 'dark:hover:bg-slate-800'
        }
        
        # CASOS ESPECIAIS
        
        # 7. Remover "text-slate-900 dark:" duplicado no inicio
        $content = $content -replace 'text-slate-900\s+dark:text-slate-900\s+dark:text-white', 'text-slate-900 dark:text-white'
        
        # 8. Remover "text-slate-600 dark:" duplicado no inicio
        $content = $content -replace 'text-slate-600\s+dark:text-slate-600\s+dark:text-slate-400', 'text-slate-600 dark:text-slate-400'
        
        # 9. Remover "border-slate-200 dark:" duplicado no inicio
        $content = $content -replace 'border-slate-200\s+dark:border-slate-200\s+dark:border-white/10', 'border-slate-200 dark:border-white/10'
        
        # LIMPEZA GERAL (multiplos "dark:" seguidos)
        
        # 10. Qualquer "dark: dark:" duplicado
        while ($content -match 'dark:(\S+)\s+dark:\1') {
            $content = $content -replace 'dark:(\S+)\s+dark:\1', 'dark:$1'
        }
        
        # Salvar arquivo limpo
        $content | Set-Content $file -NoNewline
        
        Write-Host "  [OK] Arquivo limpo!" -ForegroundColor Green
        Write-Host ""
        
    } else {
        Write-Host "  [AVISO] Arquivo nao encontrado: $file" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  LIMPEZA COMPLETA!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backups criados com extensao .backup" -ForegroundColor Gray
Write-Host ""
Write-Host "Proximo passo:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Se algo der errado, restaure os backups:" -ForegroundColor Gray
Write-Host "  Copy-Item src/app/sales/page.tsx.backup src/app/sales/page.tsx" -ForegroundColor Gray
Write-Host ""
