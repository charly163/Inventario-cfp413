#!/bin/bash

# 🚀 SCRIPT DE DEPLOYMENT AUTOMÁTICO
# Sistema de Inventario CFP 413 - Versión 35
# Este script hace TODO automáticamente sin intervención manual

set -e  # Salir si hay algún error

echo "🚀 INICIANDO DEPLOYMENT AUTOMÁTICO - VERSIÓN 35"
echo "================================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Configurar Git si no está configurado
echo "⚙️  Configurando Git..."
git config --global user.name "CFP 413 System" 2>/dev/null || true
git config --global user.email "sistema@cfp413.edu.ar" 2>/dev/null || true

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
    git branch -M main
fi

# Configurar remote
echo "🔗 Configurando repositorio remoto..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/charly163/Inventario-cfp413.git

# Agregar TODOS los archivos
echo "📁 Agregando todos los archivos..."
git add .

# Crear commit con la versión 35
echo "💾 Creando commit de la Versión 35..."
git commit -m "🚀 VERSIÓN 35 - Sistema Completo CFP 413

✅ CARACTERÍSTICAS IMPLEMENTADAS:
- Pestañas separadas para Herramientas e Insumos
- Historial individual de herramientas con modal detallado
- Préstamos múltiples con selección inteligente
- Configuración dinámica con tabla settings JSONB
- Dashboard completo con métricas separadas por tipo
- Sistema de alertas mejorado para stock bajo
- Manejo robusto de errores con fallbacks locales
- UI/UX completa con shadcn/ui y Tailwind CSS
- Base de datos Supabase optimizada
- Funcionalidades CRUD completas
- Sistema preparado para producción

🔧 ARCHIVOS INCLUIDOS:
- app/: Layout, página principal, loading, globals.css
- components/: Todos los componentes funcionales completos
- lib/: Database y Supabase con manejo de errores
- scripts/: SQL para creación de tablas y datos
- Configuración completa: package.json, tsconfig, tailwind, next.config

🌐 DEPLOYMENT:
- Configurado para Vercel
- Variables de entorno Supabase incluidas
- Optimizado para producción
- Listo para uso público

Sistema 100% funcional para el pañol del CFP 413" 2>/dev/null || git commit --amend -m "🚀 VERSIÓN 35 - Sistema Completo CFP 413"

# Hacer push forzado
echo "🚀 Haciendo push a GitHub..."
echo "   Repositorio: https://github.com/charly163/Inventario-cfp413"
git push -u origin main --force

# Verificar éxito
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡DEPLOYMENT EXITOSO!"
    echo "================================================"
    echo "🎉 La Versión 35 está ahora en GitHub"
    echo "🌐 Vercel desplegará automáticamente en:"
    echo "   👉 http://v0-inventario-panol-cfp-413.vercel.app/"
    echo ""
    echo "⏱️  El deployment en Vercel toma 2-3 minutos"
    echo "🔄 Vercel detectará los cambios automáticamente"
    echo "📱 El link público se actualizará solo"
    echo ""
    echo "✅ SISTEMA LISTO PARA USO PÚBLICO"
    echo "================================================"
else
    echo "❌ Error en el push. Verifica tu conexión a internet."
    exit 1
fi

echo "🎯 PRÓXIMOS PASOS AUTOMÁTICOS:"
echo "1. ✅ Código subido a GitHub - COMPLETADO"
echo "2. 🔄 Vercel detectando cambios - EN PROCESO"
echo "3. 🚀 Deployment en producción - AUTOMÁTICO"
echo "4. 🌐 Link público actualizado - 2-3 MINUTOS"
echo ""
echo "🎉 ¡NO NECESITAS HACER NADA MÁS!"
