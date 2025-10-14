const { supabase } = require('./src/lib/supabase');

async function testSupabaseConnection() {
  try {
    console.log('Probando conexión con Supabase...');
    
    // Verificar si las variables de entorno están configuradas
    console.log('Variables de entorno:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('\n❌ Error: Faltan variables de entorno necesarias');
      return;
    }
    
    // Intentar una consulta simple
    console.log('\nRealizando consulta de prueba...');
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Error en la consulta:', error);
    } else {
      console.log('✅ Conexión exitosa!');
      console.log('Datos de prueba:', data);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

testSupabaseConnection();
