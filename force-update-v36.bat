@echo off
echo ========================================
echo FORZANDO ACTUALIZACION A VERSION 36
echo ========================================
echo.

echo 📁 Agregando todos los archivos...
git add .

echo 💾 Creando commit VERSIÓN 36...
git commit -m "VERSION 36 - Actualizacion forzada del link publico"

echo 🚀 Enviando a GitHub (rama master)...
git push origin master --force

echo.
echo ✅ ¡COMPLETADO! 
echo Ahora ve a Vercel y haz Redeploy
echo ========================================
pause
