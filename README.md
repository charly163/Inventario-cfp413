# Sistema de Inventario CFP 413

Sistema de inventario para herramientas e insumos del CFP 413, con gestión de préstamos y configuración dinámica.

## 🚀 Características Principales

### ✅ Gestión de Inventario
- **Herramientas**: Gestión específica de herramientas con estados (disponible, prestado, mantenimiento)
- **Insumos**: Control de stock con alertas de nivel bajo
- **Categorización**: Sistema flexible de categorías personalizables
- **Ubicaciones**: Gestión de ubicaciones físicas en el pañol

### ✅ Sistema de Préstamos
- **Préstamos Individuales**: Registro de préstamos con fechas de vencimiento
- **Préstamos Múltiples**: Préstamo de múltiples herramientas a un mismo profesor
- **Historial Completo**: Seguimiento de todos los movimientos
- **Alertas de Vencimiento**: Notificaciones de préstamos vencidos

### ✅ Configuración Dinámica
- **Profesores**: Lista personalizable de profesores
- **Categorías**: Gestión de categorías de artículos
- **Ubicaciones**: Configuración de ubicaciones del pañol
- **Fuentes**: Gestión de fuentes de adquisición
- **Parámetros**: Configuración de umbrales y días de préstamo

### ✅ Reportes y Estadísticas
- **Dashboard**: Vista general con métricas clave
- **Reportes por Categoría**: Análisis detallado del inventario
- **Stock Bajo**: Alertas automáticas de reposición
- **Préstamos Activos**: Seguimiento en tiempo real
- **Exportación**: Funciones de exportación de datos

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI Components
- **Base de Datos**: Supabase (PostgreSQL)
- **Despliegue**: Vercel
- **Autenticación**: Supabase Auth

## 📦 Instalación

### Desarrollo Local
\`\`\`bash
# Clonar repositorio
git clone https://github.com/charly163/Inventario-cfp413.git
cd Inventario-cfp413

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar servidor de desarrollo
npm run dev
\`\`\`

### Configuración de Base de Datos
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar scripts SQL en `/scripts/`
3. Configurar variables de entorno
4. Ejecutar migraciones

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático desde rama `main`

### Variables de Entorno Requeridas
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
\`\`\`

## 📊 Estructura del Proyecto

\`\`\`
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   ├── add-item-form.tsx # Formulario agregar artículo
│   ├── items-list.tsx    # Lista de artículos
│   ├── tools-list.tsx    # Lista de herramientas
│   ├── supplies-list.tsx # Lista de insumos
│   └── ...               # Otros componentes
├── lib/                  # Utilidades y configuración
│   ├── database.ts       # Funciones de base de datos
│   ├── supabase.ts       # Cliente Supabase
│   └── utils.ts          # Utilidades generales
├── scripts/              # Scripts SQL
│   ├── create-tables.sql # Creación de tablas
│   └── insert-sample-data.sql # Datos de ejemplo
└── hooks/                # Custom hooks
    └── use-toast.ts      # Hook para notificaciones
\`\`\`

## 🔧 Funcionalidades Detalladas

### Dashboard Principal
- Métricas en tiempo real
- Alertas de stock bajo
- Préstamos vencidos
- Resumen por categorías

### Gestión de Herramientas
- CRUD completo de herramientas
- Estados: Disponible, Prestado, Mantenimiento, Baja
- Filtros avanzados por categoría, estado, ubicación
- Historial de cada herramienta

### Gestión de Insumos
- Control de stock con alertas automáticas
- Gestión de cantidades mínimas
- Seguimiento de consumo
- Reportes de reposición

### Sistema de Préstamos
- Préstamos individuales y múltiples
- Gestión de fechas de vencimiento
- Notificaciones automáticas
- Historial completo de transacciones

### Configuración
- Gestión de profesores, categorías y ubicaciones
- Configuración de parámetros del sistema
- Personalización de alertas
- Backup y restauración

## 📱 Responsive Design

El sistema está completamente optimizado para:
- **Desktop**: Experiencia completa con todas las funcionalidades
- **Tablet**: Interfaz adaptada para pantallas medianas
- **Mobile**: Versión móvil optimizada para uso en el pañol

## 🔒 Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) en base de datos
- Validación de datos en frontend y backend
- Logs de auditoría para todas las operaciones

## 📈 Versiones

### Versión 36 (Actual)
- ✅ Sistema completo de pestañas (Dashboard, Herramientas, Insumos, Préstamos, Reportes, Configuración)
- ✅ Préstamos múltiples con selección de herramientas
- ✅ Historial completo de transacciones
- ✅ Configuración dinámica de parámetros
- ✅ Integración completa con Supabase
- ✅ Interfaz responsive y moderna

### Próximas Funcionalidades
- 🔄 Códigos QR para herramientas
- 🔄 Notificaciones por email
- 🔄 Exportación a Excel avanzada
- 🔄 Dashboard de métricas avanzadas
- 🔄 Sistema de reservas

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@cfp413.edu.ar
- **GitHub Issues**: [Reportar problema](https://github.com/charly163/Inventario-cfp413/issues)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado para CFP 413** - Sistema de Gestión de Inventario v36
