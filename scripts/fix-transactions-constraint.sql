-- Drop the existing check constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'transactions' 
        AND constraint_name = 'transactions_status_check'
    ) THEN
        EXECUTE 'ALTER TABLE transactions DROP CONSTRAINT transactions_status_check;';
    END IF;
END $$;

-- Add the correct check constraint
ALTER TABLE transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('activo', 'completado', 'vencido'));

-- If you need to update any existing data to match the new constraint, uncomment and modify this:
-- UPDATE transactions 
-- SET status = 'completado' 
-- WHERE status NOT IN ('activo', 'completado', 'vencido');

-- Verify the constraint
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM   pg_constraint
WHERE  conname = 'transactions_status_check';
