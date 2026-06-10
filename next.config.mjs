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


  // Variables de entorno para el cliente si fueran necesarias
  // (Actualmente no necesitamos Supabase en el cliente)
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.1.0-neon',
  },

}

export default nextConfig
