// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('=== Verificación de configuración de Supabase ===\n');

// Mostrar variables de entorno
console.log('Variables de entorno:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');

// Verificar si las variables están configuradas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('\n❌ Error: Faltan variables de entorno necesarias');
  process.exit(1);
}

// Importar Supabase dinámicamente
import('@supabase/supabase-js').then(({ createClient }) => {
  console.log('\n=== Probando conexión con Supabase ===\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  // Probar conexión con una consulta simple
  supabase
    .from('items')
    .select('*')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Error en la conexión con Supabase:');
        console.error(error);
        process.exit(1);
      } else {
        console.log('✅ Conexión exitosa con Supabase!');
        console.log('Datos de prueba:', data);
      }
    })
    .catch(error => {
      console.error('❌ Error inesperado al conectar con Supabase:');
      console.error(error);
      process.exit(1);
    });
}).catch(error => {
  console.error('❌ Error al importar el módulo de Supabase:');
  console.error(error);
  process.exit(1);
});
