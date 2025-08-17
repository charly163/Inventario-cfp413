@echo off
echo ========================================
echo FORZANDO SINCRONIZACION CON REPOSITORIO
echo ========================================

REM Configurar Git
git config --global user.email "cfp413@inventario.com"
git config --global user.name "CFP413 Inventario"

REM Eliminar .git si existe
if exist .git rmdir /s /q .git

REM Inicializar repositorio
git init
git branch -M master

REM Agregar remote
git remote add origin https://github.com/charly163/Inventario-cfp413.git

REM Crear .gitignore
echo node_modules/ > .gitignore
echo .next/ >> .gitignore
echo .env.local >> .gitignore
echo .DS_Store >> .gitignore
echo *.log >> .gitignore

REM Agregar todos los archivos
git add .

REM Commit con mensaje descriptivo
git commit -m "VERSIÓN 36: Sistema completo de inventario CFP 413 - Herramientas e Insumos"

REM Push forzado al repositorio
git push -f origin master

echo.
echo ========================================
echo SINCRONIZACIÓN COMPLETADA
echo ========================================
echo.
echo El repositorio ha sido actualizado con la VERSIÓN 36
echo Vercel se actualizará automáticamente
echo.
pause
