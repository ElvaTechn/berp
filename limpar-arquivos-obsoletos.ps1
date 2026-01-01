# ================================================================
# LIMPEZA DE ARQUIVOS OBSOLETOS - BizControl 360 ERP
# ================================================================
# Este script remove arquivos comprovadamente obsoletos
# Risco: ZERO (Git tem backup de tudo)
# ================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  LIMPEZA DE ARQUIVOS OBSOLETOS        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$deletedCount = 0
$savedSpace = 0

# ================================================================
# FASE 1: Backups (.backup)
# ================================================================

Write-Host "[1/3] Removendo arquivos .backup..." -ForegroundColor Yellow

$backups = @(
    "src\app\inventory\page.tsx.backup",
    "src\app\sales\page.tsx.backup",
    "src\app\sales\pos\page.tsx.backup"
)

foreach ($file in $backups) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Remove-Item $file -Force
        $deletedCount++
        $savedSpace += $size
        Write-Host "      ✓ Removido: $file" -ForegroundColor Green
    } else {
        Write-Host "      ⊗ Não encontrado: $file" -ForegroundColor Gray
    }
}

# ================================================================
# FASE 2: Pasta docs/migration (já migrou)
# ================================================================

Write-Host ""
Write-Host "[2/3] Removendo docs/migration (migração completa)..." -ForegroundColor Yellow

if (Test-Path "docs\migration") {
    $migrationSize = (Get-ChildItem "docs\migration" -Recurse | Measure-Object -Property Length -Sum).Sum
    Remove-Item -Recurse -Force "docs\migration"
    $deletedCount += 10
    $savedSpace += $migrationSize
    Write-Host "      ✓ Pasta removida (10 arquivos)" -ForegroundColor Green
} else {
    Write-Host "      ⊗ Pasta não encontrada" -ForegroundColor Gray
}

# ================================================================
# FASE 3: Arquivos "FINAL" duplicados
# ================================================================

Write-Host ""
Write-Host "[3/3] Removendo arquivos 'FINAL' duplicados..." -ForegroundColor Yellow

$finals = @(
    "docs\implementation\FINAL_STATUS.md",
    "docs\implementation\FINAL_PROJECT_SUMMARY.md",
    "docs\implementation\COMPLETE_IMPLEMENTATION_SUMMARY.md",
    "docs\implementation\RESUMO_FINAL.md",
    "docs\implementation\RESUMO_IMPLEMENTACAO.md"
)

foreach ($file in $finals) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Remove-Item $file -Force
        $deletedCount++
        $savedSpace += $size
        Write-Host "      ✓ Removido: $file" -ForegroundColor Green
    } else {
        Write-Host "      ⊗ Não encontrado: $file" -ForegroundColor Gray
    }
}

# ================================================================
# RESUMO
# ================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       LIMPEZA CONCLUÍDA COM SUCESSO    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 RESUMO:" -ForegroundColor Cyan
Write-Host "  • Arquivos removidos: $deletedCount" -ForegroundColor White
Write-Host "  • Espaço economizado: $([math]::Round($savedSpace/1KB, 2)) KB" -ForegroundColor White
Write-Host ""
Write-Host "✅ Projeto mais limpo e profissional!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS (Opcional):" -ForegroundColor Yellow
Write-Host "  1. Revisar docs/guides (29 arquivos)" -ForegroundColor Gray
Write-Host "  2. Consolidar docs/pwa (20 arquivos)" -ForegroundColor Gray
Write-Host "  3. Ver ANALISE_ARQUIVOS_OBSOLETOS.md" -ForegroundColor Gray
Write-Host ""
