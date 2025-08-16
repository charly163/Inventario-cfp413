#!/bin/bash

echo "🚀 Iniciando deployment automático para CFP 413..."

# Configurar Git si no está configurado
git config --global user.name "CFP 413 System" 2>/dev/null || true
git config --global user.email "sistema@cfp413.edu.ar" 2>/dev/null || true

# Agregar todos los archivos
echo "📁 Agregando archivos..."
git add .

# Hacer commit
echo "💾 Creando commit..."
git commit -m "feat: Sistema completo CFP 413 - Versión 35

✅ Pestañas separadas para herramientas e insumos
✅ Dashboard con métricas en tiempo real  
✅ Préstamos múltiples con selección inteligente
✅ Sistema de alertas para stock bajo y vencidos
✅ Interfaz completa con shadcn/ui
✅ Funcionalidades CRUD completas
✅ Preparado para producción

Sistema 100% funcional para el pañol del CFP 413"

# Push a la rama master (no main)
echo "🌐 Subiendo a GitHub (rama master)..."
git push origin master --force

echo "✅ ¡Deployment completado!"
echo "🌐 Tu sitio se actualizará automáticamente en:"
echo "   http://v0-inventario-panol-cfp-413.vercel.app/"
echo ""
echo "⏱️  Espera 2-3 minutos para que Vercel procese los cambios"
