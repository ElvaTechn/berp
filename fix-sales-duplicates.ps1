# Fix duplicate classes in sales page
$file = "src/app/sales/page.tsx"

Write-Host "Limpando classes duplicadas em $file..." -ForegroundColor Cyan

$content = Get-Content $file -Raw

# Remove duplicates
$content = $content -replace 'text-slate-900 dark:text-slate-900 dark:text-white', 'text-slate-900 dark:text-white'
$content = $content -replace 'text-slate-600 dark:text-slate-600 dark:text-slate-400', 'text-slate-600 dark:text-slate-400'
$content = $content -replace 'border-slate-200 dark:border-slate-200 dark:border-white/10', 'border-slate-200 dark:border-white/10'
$content = $content -replace 'border-slate-200 dark:border-slate-200 dark:border-white/5', 'border-slate-200 dark:border-white/5'

# Save
$content | Set-Content $file -NoNewline

Write-Host "✓ Arquivo corrigido!" -ForegroundColor Green
Write-Host ""
Write-Host "Execute: npm run dev" -ForegroundColor Yellow
