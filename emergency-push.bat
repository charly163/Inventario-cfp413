@echo off
echo ========================================
echo PUSH DE EMERGENCIA - VERSION 36
echo ========================================
echo.

echo Verificando estado de git...
git status

echo.
echo Agregando cambios...
git add --all

echo.
echo Commit con timestamp...
git commit -m "VERSION 36 - Emergency push %date% %time%"

echo.
echo Push forzado a master...
git push origin master --force

echo.
echo Intentando push a main tambien...
git push origin main --force

echo.
echo ========================================
echo PUSH COMPLETADO!
echo Ve a Vercel dashboard y haz REDEPLOY
echo SIN CACHE para forzar actualizacion
echo ========================================
pause
