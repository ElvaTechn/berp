@echo off
cd /d F:\berp
echo Verificando erros TypeScript...
echo.
npx tsc --noEmit --pretty false 2>&1 | findstr /C:"error TS" /C:"src/"
echo.
echo Concluido!
