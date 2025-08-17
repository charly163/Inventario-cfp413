@echo off
chcp 65001 >nul
echo 🚀 SINCRONIZANDO CON RAMA MASTER - VERSIÓN 36
echo ================================================

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo    Asegúrate de estar en el directorio raíz del proyecto
    pause
    exit /b 1
)

REM Verificar que git está inicializado
if not exist ".git" (
    echo 📦 Inicializando repositorio Git...
    git init
)

REM Configurar rama principal como master
echo 🔧 Configurando rama principal como master...
git config init.defaultBranch master
git branch -M master

REM Agregar remote si no existe
git remote remove origin 2>nul
echo 🔗 Agregando remote origin para rama master...
git remote add origin https://github.com/charly163/Inventario-cfp413.git

REM Verificar conexión
echo 🔍 Verificando conexión con GitHub...
git ls-remote origin >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: No se puede conectar con el repositorio
    echo    Verifica la URL y tus credenciales de GitHub
    pause
    exit /b 1
)

REM Limpiar staging area
git reset HEAD . 2>nul

REM Agregar todos los archivos
echo 📁 Agregando archivos al staging...
git add .

REM Verificar que hay cambios
git diff --staged --quiet
if errorlevel 1 (
    echo 💾 Creando commit para VERSIÓN 36...
    git commit -m "feat: VERSIÓN 36 - Sistema completo inventario CFP 413

✅ Tabs separados para herramientas e insumos
✅ Formularios específicos por tipo de artículo  
✅ Gestión completa de préstamos
✅ Dashboard con métricas separadas
✅ Sistema de alertas mejorado
✅ Base de datos Supabase optimizada
✅ UI/UX con shadcn/ui completa
✅ Preparado para producción

RAMA: master (corregida)
DEPLOY: Vercel automático"
) else (
    echo ℹ️ No hay cambios nuevos para commitear
)

REM Hacer push FORZADO a la rama master
echo 🚀 Haciendo push FORZADO a rama MASTER...
git push -u origin master --force

if errorlevel 1 (
    echo ❌ Error durante el push
    echo    Verifica tus credenciales de GitHub
    pause
    exit /b 1
)

echo ✅ ¡PUSH EXITOSO A RAMA MASTER!
echo 🌐 Repositorio: https://github.com/charly163/Inventario-cfp413
echo 📋 PRÓXIMOS PASOS:
echo    1. Ve a Vercel.com
echo    2. Verifica que esté conectado a la rama MASTER
echo    3. Si no, cambia la configuración a rama master
echo    4. Fuerza un nuevo deploy desde Vercel
echo.
echo 🎉 VERSIÓN 36 subida a rama MASTER correctamente
pause
