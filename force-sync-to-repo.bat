@echo off
echo ========================================
echo FORZANDO SINCRONIZACION VERSION 36
echo ========================================
echo.

echo 📁 Inicializando git...
git init

echo 🔗 Conectando con el repositorio...
git remote add origin https://github.com/charly163/Inventario-cfp413.git

echo 📁 Agregando todos los archivos...
git add .

echo 💾 Creando commit VERSION 36...
git commit -m "VERSION 36 - Sistema completo CFP 413 - Sincronizacion forzada"

echo 🚀 FORZANDO envio a GitHub (rama master)...
git push -f origin master

echo.
echo ✅ ¡SINCRONIZACION FORZADA COMPLETADA!
echo El repositorio ahora tiene la VERSION 36
echo Ve a Vercel para verificar el deployment
echo ========================================
pause
