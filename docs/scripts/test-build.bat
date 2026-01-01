@echo off
cd /d F:\berp
call npm run build > build-output.txt 2>&1
echo Build completed
type build-output.txt
