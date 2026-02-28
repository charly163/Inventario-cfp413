/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes
  images: {
    unoptimized: true,
    domains: ['placeholder.com', 'via.placeholder.com'],
  },

  // Configuración de TypeScript y ESLint para ignorar errores en build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Habilitar Server Actions (Next.js 14+)
  // Nota: En Next dev, esto suele estar habilitado por defecto, 
  // pero lo aseguramos para producción en Netlify si es necesario.
  experimental: {
    serverActions: true,
  },

  // Variables de entorno para el cliente si fueran necesarias
  // (Actualmente no necesitamos Supabase en el cliente)
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.1.0-neon',
  },

  // Configuración de redirecciones para Netlify (si no se usa netlify.toml)
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
}

export default nextConfig
