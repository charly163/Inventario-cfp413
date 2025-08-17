#!/bin/bash

echo "🚨 REDEPLOY DE EMERGENCIA - VERSIÓN 36"
echo "====================================="

# Crear un cambio mínimo para forzar redeploy
echo "// Forzar redeploy $(date)" >> app/globals.css

# Commit de emergencia
git add .
git commit -m "🚨 Emergency redeploy - VERSIÓN 36 - $(date)

Forzando actualización del deployment público
Link: http://v0-inventario-panol-cfp-413.vercel.app/"

# Push forzado
git push origin master --force

echo ""
echo "✅ REDEPLOY DE EMERGENCIA ENVIADO"
echo "🌐 Vercel debería detectar el cambio ahora"
echo "⏱️  Espera 3-5 minutos y revisa el link"
echo ""
echo "🔗 Link: http://v0-inventario-panol-cfp-413.vercel.app/"
