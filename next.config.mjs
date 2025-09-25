/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para exportación estática (compatible con Netlify)
  output: 'export',
  
  // Deshabilitar la generación de mapas de fuente para reducir el tamaño del build
  productionBrowserSourceMaps: false,
  
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
  
  // Redirecciones para Netlify
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Encabezados de seguridad
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
    ]
  },
  
  // Variables de entorno
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

export default nextConfig
