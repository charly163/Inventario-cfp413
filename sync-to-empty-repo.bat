@echo off
echo ========================================
echo SINCRONIZANDO VERSION 36 CON REPO VACIO
echo ========================================
echo.

echo 📁 Inicializando git...
git init

echo 🔗 Conectando con el repositorio...
git remote add origin https://github.com/charly163/Inventario-cfp413.git

echo 📁 Agregando todos los archivos...
git add .

echo 💾 Creando commit VERSION 36...
git commit -m "VERSION 36 - Sistema completo CFP 413 - Sincronizacion inicial"

echo 🚀 Enviando a GitHub (rama master)...
git push -u origin master

echo.
echo ✅ ¡SINCRONIZACION COMPLETADA!
echo El repositorio ahora tiene la VERSION 36
echo Ve a Vercel para verificar el deployment
echo ========================================
pause
