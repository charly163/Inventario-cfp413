@echo off
echo ========================================
echo RESET NUCLEAR Y DEPLOY - CFP 413
echo ========================================
echo.
echo Este script va a:
echo 1. Limpiar completamente el repositorio
echo 2. Subir TODA la version 36 a la rama main
echo 3. Forzar redeploy en Vercel
echo.
set /p confirm="Continuar? (S/N): "
if /i "%confirm%" NEQ "S" (
    echo Operacion cancelada.
    pause
    exit /b
)

echo.
echo [1/8] Inicializando repositorio Git...
git init
if %errorlevel% neq 0 (
    echo ERROR: No se pudo inicializar Git
    pause
    exit /b 1
)

echo [2/8] Configurando repositorio remoto...
git remote remove origin 2>nul
git remote add origin https://github.com/charly163/Inventario-cfp413.git
if %errorlevel% neq 0 (
    echo ERROR: No se pudo configurar el repositorio remoto
    pause
    exit /b 1
)

echo [3/8] Limpiando ramas remotas...
git fetch origin
git branch -D main 2>nul
git branch -D master 2>nul

echo [4/8] Creando rama main limpia...
git checkout -b main
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear la rama main
    pause
    exit /b 1
)

echo [5/8] Agregando todos los archivos...
git add .
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron agregar los archivos
    pause
    exit /b 1
)

echo [6/8] Creando commit con VERSION 36...
git commit -m "VERSION 36: Sistema completo con pestanas herramientas/insumos, prestamos multiples, historial y configuracion dinamica"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear el commit
    pause
    exit /b 1
)

echo [7/8] Forzando push a rama main...
git push -f origin main
if %errorlevel% neq 0 (
    echo ERROR: FALLO EL PUSH AL REPOSITORIO
    echo Verifica tu conexion a internet y permisos de GitHub
    pause
    exit /b 1
)

echo [8/8] Limpiando cache local...
git gc --aggressive --prune=now

echo.
echo ========================================
echo EXITO! VERSION 36 SUBIDA A RAMA MAIN
echo ========================================
echo.
echo AHORA DEBES:
echo 1. Ir a https://vercel.com/dashboard
echo 2. Buscar tu proyecto CFP 413
echo 3. Settings - Git - Cambiar a rama 'main'
echo 4. Deployments - Redeploy SIN cache
echo 5. Esperar 3-5 minutos
echo 6. Verificar en: v0-inventario-panol-cfp-413.vercel.app
echo.
pause
