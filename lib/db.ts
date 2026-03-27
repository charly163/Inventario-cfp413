import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Ensure WebSocket is available for Node environments
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  console.error('CRITICAL: DATABASE_URL is not defined');
}

// Configurado para bypass_firewall en puerto 443 (HTTP/WS)
const pool = new Pool({
  connectionString: databaseUrl || '',
  ssl: true
});

// A custom wrapper that mimics postgres.js tag API but uses the serverless pool to bypass local firewalls!
export default function sql(strings: TemplateStringsArray | Record<string, any>, ...values: any[]) {
  // If called dynamically like sql(object, 'col1', 'col2')
  if (!Array.isArray(strings)) {
    const payload = strings as Record<string, any>;
    const columns = values.length > 0 ? values : Object.keys(payload);
    return {
      __isDynamic: true,
      columns: columns,
      values: columns.map(c => payload[c])
    };
  }

  // Called as tagged template: sql`SELECT ...`
  let query = strings[0];
  let params: any[] = [];
  let paramIndex = 1;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (value && typeof value === 'object' && value.__isDynamic) {
      if (query.trim().toUpperCase().endsWith('SET')) {
        // UPDATE case
        const setCols = value.columns.map((col: string) => {
          params.push(value.values[value.columns.indexOf(col)]);
          return `"${col}" = $${paramIndex++}`;
        });
        query += setCols.join(', ');
      } else {
        // INSERT case
        const colStr = value.columns.map((c: string) => `"${c}"`).join(', ');
        const placeholders = value.values.map((v: any) => {
          params.push(v);
          return `$${paramIndex++}`;
        }).join(', ');
        query += `(${colStr}) VALUES (${placeholders})`;
      }
    } else {
      params.push(value);
      query += `$${paramIndex++}`;
    }

    query += strings[i + 1];
  }

  // Execute using neondatabase pool
  const promise = pool.query(query, params).then(res => {
    const result: any = res.rows;
    result.count = res.rowCount;
    return result;
  });

  return promise;
}
