@echo off
chcp 65001 >nul
echo 🔍 VERIFICADOR DE DEPLOYMENT
echo ===========================
echo.
echo 📋 CHECKLIST DE VERIFICACIÓN:
echo.
echo ✅ 1. ¿Ejecutaste nuclear-reset-and-deploy.bat?
echo ✅ 2. ¿Cambiaste la rama en Vercel a 'main'?
echo ✅ 3. ¿Hiciste redeploy sin caché en Vercel?
echo ✅ 4. ¿Esperaste 2-3 minutos?
echo.
echo 🌐 PROBANDO CONEXIÓN AL SITIO...
echo.

REM Intentar abrir el sitio
start https://v0-inventario-panol-cfp-413.vercel.app

echo 🔍 Sitio abierto en el navegador
echo.
echo 📊 SI AÚN VES LA VERSIÓN ANTIGUA:
echo.
echo 1. Presiona Ctrl+Shift+R (hard refresh)
echo 2. Abre en ventana incógnita
echo 3. Espera 5 minutos más (propagación DNS)
echo 4. Ve a Vercel y verifica que el último deploy sea exitoso
echo.
echo 🆘 SI SIGUE SIN FUNCIONAR:
echo.
echo 1. Ve a Vercel → Functions → View Function Logs
echo 2. Busca errores en los logs
echo 3. Ve a Vercel → Settings → Domains
echo 4. Verifica que el dominio esté correctamente configurado
echo.
pause
