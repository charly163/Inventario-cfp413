@echo off
echo ========================================
echo CORRIGIENDO GIT Y SUBIENDO VERSION 36
echo ========================================
echo.

echo 🔧 Configurando repositorio...
git init
git remote remove origin
git remote add origin https://github.com/charly163/Inventario-cfp413.git

echo 📁 Agregando archivos...
git add .

echo 💾 Creando commit VERSION 36...
git commit -m "VERSION 36 - Sistema completo CFP 413"

echo 🚀 Subiendo a GitHub...
git branch -M master
git push -f origin master

echo.
echo ✅ ¡COMPLETADO! 
echo Ahora ve a Vercel y haz Redeploy
echo ========================================
pause
