import postgres from 'postgres';

// Soporte para prefijos automáticos de Netlify o nombres estándar
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  console.error('CRITICAL: DATABASE_URL or NETLIFY_DATABASE_URL is not defined');
}

// En serverless (Netlify Functions), es mejor mantener el pool pequeño (max: 1)
// para evitar saturar las conexiones de la base de datos durante picos de tráfico.
const sql = postgres(databaseUrl || '', {
  ssl: 'require',
  max: 1,
  idle_timeout: 10,
  connect_timeout: 30,
});

export default sql;
