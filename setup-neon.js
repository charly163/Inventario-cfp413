const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está definida en .env.local');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});

async function setupNeon() {
  console.log('=== Iniciando configuración de Neon ===');

  try {
    // 1. Probar conexión
    console.log('Probando conexión...');
    const result = await sql`SELECT 1 as connected`;
    console.log('✅ Conectado a Neon:', result[0].connected);

    // 2. Leer y ejecutar el esquema SQL
    console.log('Aplicando esquema SQL...');
    const schemaPath = path.join(__dirname, 'scripts', 'neon_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`No se encontró el archivo de esquema en ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el esquema
    await sql.unsafe(schemaSql);
    console.log('✅ Esquema aplicado correctamente.');

    // 3. Verificar tablas creadas
    console.log('Verificando tablas...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tablas detectadas:', tables.map(t => t.table_name).join(', '));

    // 4. Insertar configuración inicial
    console.log('Insertando configuración inicial...');
    await sql`
      INSERT INTO settings (key, categories, locations, low_stock_threshold)
      VALUES (
        'configuracion_principal', 
        ARRAY['EQUIPAMIENTO', 'HERRAMIENTA', 'INSUMO', 'MOBILIARIO', 'OTROS', 'UTENSILIO DE COCINA'], 
        ARRAY['ALMACEN', 'AULA', 'OFICINA', 'TALLER'], 
        5
      )
      ON CONFLICT (key) DO NOTHING
    `;
    console.log('✅ Configuración inicial de prueba lista.');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando Neon:');
    console.error(error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

setupNeon();
