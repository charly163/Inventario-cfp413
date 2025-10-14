-- Create or update the settings table with the correct structure
DO $$
BEGIN
    -- Check if the settings table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
        -- Check if we need to migrate from old structure
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'settings' 
            AND column_name = 'data'
        ) THEN
            -- Migrate from old structure (single JSONB data column)
            CREATE TEMP TABLE temp_settings AS
            SELECT 
                (data->>'low_stock_threshold')::integer as low_stock_threshold,
                COALESCE((data->>'default_loan_days')::integer, 14) as default_loan_days,
                COALESCE((data->>'auto_backup')::boolean, false) as auto_backup,
                COALESCE((data->>'notifications')::boolean, true) as notifications,
                COALESCE(data->>'currency', 'USD') as currency,
                COALESCE(data->>'language', 'es') as language,
                COALESCE((data->'categories')::text[]::text[], ARRAY['EQUIPAMIENTO', 'HERRAMIENTA', 'INSUMO', 'MOBILIARIO', 'OTROS', 'UTENSILIO DE COCINA']) as categories,
                COALESCE((data->'sources')::text[]::text[], ARRAY['COMPRA', 'DONACION', 'TRASLADO', 'OTRO']) as sources,
                COALESCE((data->'teachers')::text[]::text[], ARRAY[]::text[]) as teachers,
                COALESCE((data->'locations')::text[]::text[], ARRAY['ALMACEN', 'AULA', 'OFICINA', 'TALLER']) as locations
            FROM settings
            LIMIT 1;
            
            -- Drop the old table
            DROP TABLE settings;
            
            -- Create the new table
            CREATE TABLE settings (
                id INTEGER PRIMARY KEY DEFAULT 1,
                low_stock_threshold INTEGER NOT NULL DEFAULT 10,
                default_loan_days INTEGER NOT NULL DEFAULT 14,
                auto_backup BOOLEAN NOT NULL DEFAULT false,
                notifications BOOLEAN NOT NULL DEFAULT true,
                currency TEXT NOT NULL DEFAULT 'USD',
                language TEXT NOT NULL DEFAULT 'es',
                categories TEXT[] NOT NULL DEFAULT '{"EQUIPAMIENTO", "HERRAMIENTA", "INSUMO", "MOBILIARIO", "OTROS", "UTENSILIO DE COCINA"}',
                sources TEXT[] NOT NULL DEFAULT '{"COMPRA", "DONACION", "TRASLADO", "OTRO"}',
                teachers TEXT[] NOT NULL DEFAULT '{}',
                locations TEXT[] NOT NULL DEFAULT '{"ALMACEN", "AULA", "OFICINA", "TALLER"}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Insert the migrated data
            INSERT INTO settings (
                low_stock_threshold,
                default_loan_days,
                auto_backup,
                notifications,
                currency,
                language,
                categories,
                sources,
                teachers,
                locations
            ) SELECT * FROM temp_settings;
            
            -- Drop the temp table
            DROP TABLE temp_settings;
        ELSE
            -- Table exists but doesn't need migration, ensure all columns exist
            -- Add any missing columns with default values
            DO $$
            DECLARE
                col_exists BOOLEAN;
            BEGIN
                -- Check and add default_loan_days if it doesn't exist
                SELECT COUNT(*) = 0 INTO col_exists 
                FROM information_schema.columns 
                WHERE table_name = 'settings' AND column_name = 'default_loan_days';
                
                IF col_exists THEN
                    ALTER TABLE settings ADD COLUMN default_loan_days INTEGER NOT NULL DEFAULT 14;
                END IF;
                
                -- Add other columns as needed
                -- ...
            END $$;
        END IF;
    ELSE
        -- Create the settings table if it doesn't exist
        CREATE TABLE settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            low_stock_threshold INTEGER NOT NULL DEFAULT 10,
            default_loan_days INTEGER NOT NULL DEFAULT 14,
            auto_backup BOOLEAN NOT NULL DEFAULT false,
            notifications BOOLEAN NOT NULL DEFAULT true,
            currency TEXT NOT NULL DEFAULT 'USD',
            language TEXT NOT NULL DEFAULT 'es',
            categories TEXT[] NOT NULL DEFAULT '{"EQUIPAMIENTO", "HERRAMIENTA", "INSUMO", "MOBILIARIO", "OTROS", "UTENSILIO DE COCINA"}',
            sources TEXT[] NOT NULL DEFAULT '{"COMPRA", "DONACION", "TRASLADO", "OTRO"}',
            teachers TEXT[] NOT NULL DEFAULT '{}',
            locations TEXT[] NOT NULL DEFAULT '{"ALMACEN", "AULA", "OFICINA", "TALLER"}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert default settings
        INSERT INTO settings (id) VALUES (1);
    END IF;
END $$;
