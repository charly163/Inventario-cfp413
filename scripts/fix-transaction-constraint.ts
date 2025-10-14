import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function fixTransactionConstraint() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing required environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Getting current transaction table structure...');
    
    // 1. Check the current constraint
    const { data: constraintData, error: constraintError } = await supabase
      .rpc('get_constraint_definition', { 
        table_name: 'transactions',
        constraint_name: 'transactions_status_check' 
      });

    if (constraintError) {
      console.error('Error getting constraint:', constraintError);
    } else {
      console.log('Current constraint:', constraintData);
    }

    // 2. Drop the existing constraint if it exists
    console.log('Dropping existing constraint...');
    const { error: dropError } = await supabase.rpc('drop_constraint', {
      table_name: 'transactions',
      constraint_name: 'transactions_status_check'
    });

    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('Error dropping constraint:', dropError);
    } else {
      console.log('Dropped existing constraint');
    }

    // 3. Add the correct constraint
    console.log('Adding new constraint...');
    const { error: addError } = await supabase.rpc('add_check_constraint', {
      table_name: 'transactions',
      constraint_name: 'transactions_status_check',
      check_expression: "status IN ('activo', 'completado', 'vencido')"
    });

    if (addError) {
      console.error('Error adding constraint:', addError);
    } else {
      console.log('Successfully added new constraint');
    }

    // 4. Verify the constraint was added
    const { data: newConstraint, error: verifyError } = await supabase
      .rpc('get_constraint_definition', { 
        table_name: 'transactions',
        constraint_name: 'transactions_status_check' 
      });

    if (verifyError) {
      console.error('Error verifying constraint:', verifyError);
    } else {
      console.log('New constraint definition:', newConstraint);
    }

    console.log('Transaction constraint fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Create the required SQL functions if they don't exist
async function createRequiredFunctions(supabase: any) {
  // Create get_constraint_definition function
  await supabase.rpc('create_or_replace_function', {
    function_name: 'get_constraint_definition',
    function_definition: `
    CREATE OR REPLACE FUNCTION get_constraint_definition(
      table_name text,
      constraint_name text
    )
    RETURNS text AS $$
    DECLARE
      def text;
    BEGIN
      SELECT pg_get_constraintdef(oid) INTO def
      FROM pg_constraint
      WHERE conname = constraint_name
      AND conrelid = ('"' || table_name || '"')::regclass;
      
      RETURN def;
    END;
    $$ LANGUAGE plpgsql;
    `
  });

  // Create drop_constraint function
  await supabase.rpc('create_or_replace_function', {
    function_name: 'drop_constraint',
    function_definition: `
    CREATE OR REPLACE FUNCTION drop_constraint(
      table_name text,
      constraint_name text
    )
    RETURNS void AS $$
    BEGIN
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                    table_name, constraint_name);
    END;
    $$ LANGUAGE plpgsql;
    `
  });

  // Create add_check_constraint function
  await supabase.rpc('create_or_replace_function', {
    function_name: 'add_check_constraint',
    function_definition: `
    CREATE OR REPLACE FUNCTION add_check_constraint(
      table_name text,
      constraint_name text,
      check_expression text
    )
    RETURNS void AS $$
    BEGIN
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (%s)', 
                    table_name, constraint_name, check_expression);
    END;
    $$ LANGUAGE plpgsql;
    `
  });
}

// Run the fix
fixTransactionConstraint();
