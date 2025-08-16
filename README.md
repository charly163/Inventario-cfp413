# Sistema de Inventario CFP 413

Sistema de inventario para herramientas e insumos del CFP 413, con gestión de préstamos y configuración dinámica.

## 🚀 Características

### 📦 Gestión de Inventario
- **Herramientas y Suministros**: Clasificación automática por tipo con pestañas separadas
- **Estados Inteligentes**: Activo, Stock Bajo, Sin Stock
- **Información Detallada**: Marca, modelo, condición, ubicación, costo
- **Búsqueda Avanzada**: Por nombre, categoría, ubicación, etc.

### 🔄 Gestión de Préstamos
- **Préstamos Individuales**: Registro detallado de cada préstamo
- **Préstamos Múltiples**: Prestar varias herramientas a la vez
- **Control de Devoluciones**: Seguimiento automático de fechas
- **Historial Completo**: Seguimiento de todas las transacciones por herramienta
- **Estados**: Activo, Devuelto, Vencido

### 📊 Dashboard y Reportes
- **Métricas en tiempo real**: Total de herramientas, insumos, préstamos activos
- **Alertas de stock bajo**: Notificaciones automáticas para insumos
- **Reportes Detallados**: Por categoría, profesor, fecha
- **Historial de Transacciones**: Registro completo de movimientos

### ⚙️ Configuración Dinámica
- **Categorías Personalizables**: Agregar/editar categorías
- **Profesores**: Gestión de lista de profesores
- **Ubicaciones**: Control de ubicaciones del pañol
- **Fuentes de Adquisición**: Diferentes orígenes de compra
- **Umbral de Stock Bajo**: Configuración personalizable

## 🛠 Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de Vercel (para deployment)

## 🚀 Instalación Local

### 1. Clonar el repositorio
\`\`\`bash
git clone https://github.com/charly163/Inventario-cfp413.git
cd Inventario-cfp413
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
\`\`\`

### 4. Configurar base de datos
Ejecutar en Supabase SQL Editor:
\`\`\`sql
-- Ejecutar scripts/create-tables.sql
-- Ejecutar scripts/insert-sample-data.sql
\`\`\`

### 5. Ejecutar en desarrollo
\`\`\`bash
npm run dev
\`\`\`

## 🌐 Deployment a Producción

### Vercel (Recomendado)

1. **Conectar con GitHub**:
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Importa el proyecto

2. **Configurar Variables de Entorno**:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   \`\`\`

3. **Deploy Automático**:
   - Vercel desplegará automáticamente
   - Cada push a main activará un nuevo deploy

## 📁 Estructura del Proyecto

\`\`\`
Inventario-cfp413/
├── app/                    # App Router de Next.js
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── loading.tsx        # Componente de carga
│   └── page.tsx           # Página principal con dashboard
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (shadcn)
│   ├── add-item-form.tsx # Formulario agregar artículo
│   ├── items-list.tsx    # Lista general de artículos
│   ├── tools-list.tsx    # Lista específica de herramientas
│   ├── supplies-list.tsx # Lista específica de insumos
│   ├── transactions-list.tsx # Lista de préstamos
│   ├── add-multiple-transaction-form.tsx # Préstamos múltiples
│   ├── tool-history-modal.tsx # Historial por herramienta
│   ├── disposals-list.tsx # Lista de bajas
│   ├── reports-section.tsx # Sección de reportes
│   └── settings-panel.tsx # Panel de configuración
├── lib/                   # Utilidades y configuración
│   ├── database.ts       # Funciones de base de datos
│   ├── supabase.ts       # Cliente de Supabase
│   └── utils.ts          # Utilidades generales
├── scripts/              # Scripts SQL
│   ├── create-tables.sql # Creación de tablas
│   └── insert-sample-data.sql # Datos de ejemplo
└── public/               # Archivos estáticos
\`\`\`

## 🗄️ Base de Datos

### Tablas Principales

1. **items**: Artículos del inventario (herramientas e insumos)
2. **transactions**: Préstamos y donaciones
3. **disposals**: Bajas de artículos
4. **settings**: Configuración dinámica del sistema

### Características de la Base de Datos
- **Configuración JSONB**: La tabla settings usa campos JSONB para arrays dinámicos
- **Triggers automáticos**: Actualización automática de timestamps
- **Índices optimizados**: Para mejorar el rendimiento de consultas
- **Restricciones de integridad**: Validación a nivel de base de datos

## 🔧 Configuración de Supabase

### 1. Crear Proyecto
- Ve a [supabase.com](https://supabase.com)
- Crea un nuevo proyecto
- Anota la URL y la clave anónima

### 2. Ejecutar Scripts SQL
En el SQL Editor de Supabase:
\`\`\`sql
-- 1. Ejecutar create-tables.sql
-- 2. Ejecutar insert-sample-data.sql
\`\`\`

### 3. Verificar Tablas
Asegúrate de que se crearon correctamente:
- `items` (artículos)
- `transactions` (transacciones)
- `disposals` (bajas)
- `settings` (configuración)

## 📱 Uso del Sistema

### Dashboard Principal
- **Pestañas organizadas**: Dashboard, Herramientas, Insumos, Todos, Préstamos, Bajas, Reportes, Config
- **Métricas en tiempo real**: Estadísticas separadas para herramientas e insumos
- **Alertas inteligentes**: Notificaciones de stock bajo solo para insumos

### Gestión de Herramientas
- **Vista especializada**: Tabla optimizada para herramientas
- **Historial individual**: Modal con historial completo de cada herramienta
- **Préstamos múltiples**: Selección de múltiples herramientas para un profesor

### Gestión de Insumos
- **Control de stock**: Alertas automáticas de stock bajo
- **Estados visuales**: Indicadores de stock normal, bajo y sin stock
- **Seguimiento de consumo**: Historial de uso y reposición

### Sistema de Préstamos
- **Préstamos individuales**: Un artículo a la vez
- **Préstamos múltiples**: Varios artículos al mismo profesor
- **Edición de fechas**: Modificar fechas de devolución
- **Estados automáticos**: Activo, devuelto, vencido

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. **Issues**: Abre un issue en GitHub
2. **Documentación**: Revisa este README
3. **Logs**: Verifica la consola del navegador para errores

## 🔄 Actualizaciones Recientes

### Versión Actual
- ✅ Pestañas separadas para herramientas e insumos
- ✅ Historial individual de herramientas
- ✅ Préstamos múltiples con selección inteligente
- ✅ Configuración dinámica con tabla settings corregida
- ✅ Dashboard con métricas separadas
- ✅ Sistema de alertas mejorado

---

**Desarrollado para el Centro de Formación Profesional 413**
\`\`\`

Ahora voy a escribir el archivo .gitignore completo:

```plaintext file=".gitignore"
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
.env.development
.env.production

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Local Netlify folder
.netlify

# Sentry Config File
.sentryclirc

# Supabase
.supabase
