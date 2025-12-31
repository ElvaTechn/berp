@echo off
echo ============================================
echo   FIX HMR ERROR - Next.js 16 Turbopack
echo ============================================
echo.

echo [1/4] Parando processos Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/4] Limpando cache do Next.js...
rmdir /s /q .next 2>nul

echo [3/4] Limpando node_modules/.cache...
rmdir /s /q node_modules\.cache 2>nul

echo [4/4] Limpando Turbopack cache...
rmdir /s /q .next\cache 2>nul

echo.
echo ============================================
echo   CACHE LIMPO COM SUCESSO!
echo ============================================
echo.
echo PROXIMO PASSO:
echo   1. Rode: npm run dev
echo   2. Aguarde compilacao completa
echo   3. Recarregue a pagina (Ctrl+Shift+R)
echo.
pause
