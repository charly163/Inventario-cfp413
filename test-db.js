const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function check() {
  try {
    const result = await sql`SELECT COUNT(*) FROM items`;
    console.log("Total items:", result[0].count);
    const result2 = await sql`SELECT COUNT(*) FROM categories`;
    console.log("Total categories:", result2[0].count);
    const items = await sql`SELECT * FROM items LIMIT 2`;
    console.log("Items:", items);
  } catch(e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
check();
