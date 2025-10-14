-- 1. First, drop the existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name = 'transactions_status_check'
    ) THEN
        EXECUTE 'ALTER TABLE transactions DROP CONSTRAINT transactions_status_check;';
        RAISE NOTICE 'Dropped existing transactions_status_check constraint';
    ELSE
        RAISE NOTICE 'No existing transactions_status_check constraint found';
    END IF;

    -- 2. Add the correct constraint
    EXECUTE 'ALTER TABLE transactions 
             ADD CONSTRAINT transactions_status_check 
             CHECK (status IN (''activo'', ''completado'', ''vencido''))';
             
    RAISE NOTICE 'Added new transactions_status_check constraint';
    
    -- 3. Verify the constraint was added
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name = 'transactions_status_check'
    ) THEN
        RAISE NOTICE 'Successfully verified the new constraint exists';
    ELSE
        RAISE WARNING 'Failed to verify the new constraint was added';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error fixing transaction status constraint: %', SQLERRM;
END $$;
