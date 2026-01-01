@echo off
title CORRIGIR ERRO HMR - Next.js
color 0A

echo.
echo ╔════════════════════════════════════════╗
echo ║   FIX HMR ERROR - Next.js 16          ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/5] Parando Node.js...
taskkill /F /IM node.exe >nul 2>&1
echo      ✓ Processos parados

timeout /t 1 >nul

echo.
echo [2/5] Limpando .next...
if exist .next rmdir /s /q .next >nul 2>&1
echo      ✓ Cache limpo

echo.
echo [3/5] Limpando node_modules cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1
echo      ✓ Cache node_modules limpo

echo.
echo [4/5] Aguardando 2 segundos...
timeout /t 2 >nul
echo      ✓ Pronto

echo.
echo [5/5] Iniciando servidor...
echo.
echo ════════════════════════════════════════
echo   SERVIDOR INICIANDO...
echo ════════════════════════════════════════
echo.

start cmd /k "npm run dev"

echo.
echo ╔════════════════════════════════════════╗
echo ║         CORRECAO CONCLUIDA!           ║
echo ╚════════════════════════════════════════╝
echo.
echo PROXIMOS PASSOS:
echo   1. Aguarde compilacao completa no terminal
echo   2. Acesse: http://localhost:3000
echo   3. Pressione Ctrl+Shift+R para recarregar
echo.
pause
