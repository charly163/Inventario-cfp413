// pages/api/env.js
export default function handler(req, res) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  // Devolver solo las variables de entorno relevantes
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada',
  };

  res.status(200).json(envVars);
}
