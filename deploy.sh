#!/bin/bash

# Script para hacer push completo al repositorio GitHub
# Sistema de Inventario CFP 413

echo "🚀 Iniciando deployment del Sistema de Inventario CFP 413..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que git está inicializado
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
fi

# Agregar remote si no existe
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Agregando remote origin..."
    git remote add origin https://github.com/charly163/Inventario-cfp413.git
fi

# Verificar conexión con el repositorio
echo "🔍 Verificando conexión con GitHub..."
if ! git ls-remote origin > /dev/null 2>&1; then
    echo "❌ Error: No se puede conectar con el repositorio. Verifica la URL y tus credenciales."
    exit 1
fi

# Agregar todos los archivos
echo "📁 Agregando archivos al staging..."
git add .

# Verificar que hay cambios para commitear
if git diff --staged --quiet; then
    echo "ℹ️  No hay cambios para commitear."
    exit 0
fi

# Crear commit con mensaje descriptivo
echo "💾 Creando commit..."
git commit -m "feat: Sistema completo de inventario CFP 413

- ✅ Pestañas separadas para herramientas e insumos
- ✅ Historial individual de herramientas con modal
- ✅ Préstamos múltiples con selección inteligente
- ✅ Configuración dinámica con tabla settings corregida
- ✅ Dashboard con métricas separadas por tipo
- ✅ Sistema de alertas mejorado para stock bajo
- ✅ Base de datos Supabase con estructura optimizada
- ✅ UI/UX mejorada con shadcn/ui y Tailwind CSS
- ✅ Funcionalidades CRUD completas
- ✅ Manejo robusto de errores y fallbacks
- ✅ Preparado para producción con Vercel

Incluye:
- app/layout.tsx: Layout principal con metadatos SEO
- app/globals.css: Estilos completos con variables CSS
- package.json: Dependencias actualizadas para producción
- tsconfig.json: Configuración TypeScript optimizada
- tailwind.config.ts: Configuración Tailwind con tema personalizado
- next.config.mjs: Configuración Next.js para producción
- lib/database.ts: Funciones completas de base de datos
- lib/supabase.ts: Cliente Supabase con manejo de errores
- components/: Todos los componentes con funcionalidad completa
- scripts/: Scripts SQL para creación de tablas y datos de ejemplo
- README.md: Documentación completa del proyecto"

# Hacer push a la rama main
echo "🚀 Haciendo push a GitHub..."
git push -u origin main --force

# Verificar que el push fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ ¡Push exitoso! El código está ahora en GitHub."
    echo "🌐 Repositorio: https://github.com/charly163/Inventario-cfp413"
    echo "📋 Próximos pasos:"
    echo "   1. Ve a Vercel.com y conecta el repositorio"
    echo "   2. Configura las variables de entorno de Supabase"
    echo "   3. Ejecuta los scripts SQL en Supabase"
    echo "   4. ¡Tu aplicación estará lista en producción!"
else
    echo "❌ Error durante el push. Verifica tus credenciales y conexión."
    exit 1
fi

echo "🎉 Deployment completado exitosamente!"
