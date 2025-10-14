-- This script will fix the transaction status constraint to match the application's expected values

-- First, check if the constraint exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name = 'transactions_status_check'
    ) THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_status_check;
        RAISE NOTICE 'Dropped existing transactions_status_check constraint';
    END IF;

    -- Add the correct constraint with the allowed status values
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_status_check 
    CHECK (status IN ('activo', 'completado', 'vencido'));
    
    RAISE NOTICE 'Added new transactions_status_check constraint with values: activo, completado, vencido';
    
    -- Verify the constraint was added
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
    
    -- Show the current status values in the transactions table
    RAISE NOTICE 'Current status values in transactions table:';
    RAISE NOTICE '-----------------------------------------';
    
    -- This will show the count of each status value
    FOR status_rec IN 
        SELECT status, COUNT(*) as count 
        FROM transactions 
        GROUP BY status 
        ORDER BY status
    LOOP
        RAISE NOTICE 'Status: %, Count: %', status_rec.status, status_rec.count;
    END LOOP;
    
    -- Show any rows with invalid status values
    IF EXISTS (
        SELECT 1 
        FROM transactions 
        WHERE status NOT IN ('activo', 'completado', 'vencido')
    ) THEN
        RAISE WARNING 'Found rows with invalid status values. These will need to be updated manually.';
        RAISE NOTICE 'Invalid status values and their counts:';
        
        FOR invalid_rec IN 
            SELECT status, COUNT(*) as count 
            FROM transactions 
            WHERE status NOT IN ('activo', 'completado', 'vencido')
            GROUP BY status
        LOOP
            RAISE NOTICE 'Invalid Status: %, Count: %', invalid_rec.status, invalid_rec.count;
        END LOOP;
    ELSE
        RAISE NOTICE 'All transaction status values are valid';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error fixing transaction status constraint: %', SQLERRM;
END $$;
