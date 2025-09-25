/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para exportación estática
  output: 'export',
  
  // Configuración de imágenes
  images: {
    unoptimized: true, // Necesario para exportaciones estáticas
    domains: ['placeholder.com', 'via.placeholder.com'],
  },
  
  // Configuración de TypeScript y ESLint
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Deshabilitar la generación de mapas de fuente
  productionBrowserSourceMaps: false,
  
  // Configuración de logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Variables de entorno
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Configuración de redirecciones (solo para rutas estáticas)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.inventario-cfp413.netlify.app',
          },
        ],
        destination: 'https://inventario-cfp413.netlify.app/:path*',
        permanent: true,
      },
    ];
  },
  
  // Configuración de encabezados (solo para rutas estáticas)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

// Solo incluir configuraciones de redirecciones y encabezados si no es una exportación estática
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  delete nextConfig.redirects;
  delete nextConfig.headers;
}

export default nextConfig
