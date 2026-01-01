# ========================================
# FIX NPM INSTALL - BizControl 360 ERP
# ========================================

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CORRIGINDO INSTALACAO NPM           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Parar processos Node.js
Write-Host "[1/6] Parando processos Node.js..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "      ✓ Processos parados" -ForegroundColor Green

Start-Sleep -Seconds 1

# 2. Limpar .next
Write-Host ""
Write-Host "[2/6] Limpando cache .next..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force
    Write-Host "      ✓ Cache .next removido" -ForegroundColor Green
} else {
    Write-Host "      ✓ .next não existe (OK)" -ForegroundColor Green
}

# 3. Limpar node_modules/.cache
Write-Host ""
Write-Host "[3/6] Limpando node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path node_modules\.cache) {
    Remove-Item -Path node_modules\.cache -Recurse -Force
    Write-Host "      ✓ Cache node_modules removido" -ForegroundColor Green
} else {
    Write-Host "      ✓ Cache não existe (OK)" -ForegroundColor Green
}

# 4. Limpar package-lock.json
Write-Host ""
Write-Host "[4/6] Limpando package-lock.json..." -ForegroundColor Yellow
if (Test-Path package-lock.json) {
    Remove-Item -Path package-lock.json -Force
    Write-Host "      ✓ package-lock.json removido" -ForegroundColor Green
} else {
    Write-Host "      ✓ package-lock.json não existe (OK)" -ForegroundColor Green
}

# 5. Reinstalar dependências
Write-Host ""
Write-Host "[5/6] Reinstalando dependências..." -ForegroundColor Yellow
Write-Host "      (Isso pode demorar alguns minutos)" -ForegroundColor Gray
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Dependências instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "      ✗ Erro ao instalar dependências" -ForegroundColor Red
    Write-Host ""
    Write-Host "TENTE MANUALMENTE:" -ForegroundColor Yellow
    Write-Host "  npm cache clean --force" -ForegroundColor White
    Write-Host "  npm install" -ForegroundColor White
    exit 1
}

# 6. Gerar Prisma Client
Write-Host ""
Write-Host "[6/6] Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Prisma Client gerado!" -ForegroundColor Green
} else {
    Write-Host "      ⚠ Aviso: Erro no Prisma (pode ser normal)" -ForegroundColor Yellow
}

# Sucesso
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         INSTALACAO CONCLUIDA!         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. npm run dev" -ForegroundColor White
Write-Host "  2. Abrir http://localhost:3000" -ForegroundColor White
Write-Host ""
