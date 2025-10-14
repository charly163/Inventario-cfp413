import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for migrations

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFix() {
  try {
    console.log('Running transaction constraint fix...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-transactions-constraint.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL in batches (some SQL clients don't support multiple statements in one call)
    const statements = sql.split(';').filter(statement => statement.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim() === '') continue;
      console.log('Executing:', statement.trim().substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec', { query: statement });
      
      if (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
        process.exit(1);
      }
      
      console.log('Statement executed successfully');
    }
    
    console.log('Transaction constraint fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

runFix();
