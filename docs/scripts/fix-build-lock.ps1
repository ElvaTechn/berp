# Build Lock Fix Script
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   CORRIGINDO LOCK DO NEXT.JS    " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Parar Node.js
Write-Host "[1/3] Parando processos Node.js..." -ForegroundColor Yellow
$processes = Get-Process -Name node -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "      OK - Processos parados" -ForegroundColor Green
} else {
    Write-Host "      OK - Nenhum processo rodando" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

# 2. Remover lock
Write-Host ""
Write-Host "[2/3] Removendo arquivo de lock..." -ForegroundColor Yellow
if (Test-Path ".next\lock") {
    Remove-Item ".next\lock" -Force
    Write-Host "      OK - Lock removido" -ForegroundColor Green
} else {
    Write-Host "      OK - Lock nao encontrado" -ForegroundColor Gray
}

# 3. Limpar cache
Write-Host ""
Write-Host "[3/3] Limpando cache .next..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "      OK - Cache limpo" -ForegroundColor Green
} else {
    Write-Host "      OK - .next nao encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "   CORRECAO CONCLUIDA!          " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host ""
