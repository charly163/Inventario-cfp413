-- Script para migrar la tabla settings a la nueva estructura con campos JSONB
-- Ejecutar este script si ya tienes una tabla settings con estructura antigua

-- Verificar si la tabla settings existe
DO $$
BEGIN
    -- Si la tabla existe pero no tiene la estructura correcta, la recreamos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'settings') THEN
        -- Verificar si tiene la estructura antigua (sin campos JSONB)
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'settings' AND column_name = 'categories' AND data_type = 'jsonb'
        ) THEN
            -- Hacer backup de datos existentes si los hay
            CREATE TEMP TABLE settings_backup AS SELECT * FROM settings;
            
            -- Eliminar tabla antigua
            DROP TABLE settings CASCADE;
            
            -- Crear nueva tabla con estructura correcta
            CREATE TABLE settings (
                id INTEGER PRIMARY KEY DEFAULT 1,
                low_stock_threshold INTEGER NOT NULL DEFAULT 10,
                categories JSONB NOT NULL DEFAULT '["EQUIPAMIENTO", "HERRAMIENTA", "INSUMO", "MOBILIARIO", "OTROS", "UTENSILIO DE COCINA"]'::jsonb,
                sources JSONB NOT NULL DEFAULT '["CREDITO FISCAL", "DONACIONES", "MOBILIARIO ADIF", "MOBILIARIO UMUPLA", "PLAN DE MEJORAS", "SIN CLASIFICAR", "SITRARED", "UMUPLA"]'::jsonb,
                teachers JSONB NOT NULL DEFAULT '["Profesor Martínez", "Profesora Rodríguez", "Profesor García", "Profesora López", "Profesor Fernández", "Profesora Pérez", "Profesor González", "Profesora Sánchez", "Profesor Ramírez", "Profesora Torres", "Charly"]'::jsonb,
                locations JSONB NOT NULL DEFAULT '["Estante A-1", "Estante A-2", "Estante B-1", "Estante B-2", "Armario C-1", "Armario C-2", "Laboratorio Mesa 1", "Laboratorio Mesa 2", "Depósito Principal", "Depósito Secundario"]'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT settings_single_row CHECK (id = 1)
            );
            
            -- Restaurar datos si existían (solo el threshold)
            IF EXISTS (SELECT 1 FROM settings_backup) THEN
                INSERT INTO settings (id, low_stock_threshold)
                SELECT 1, COALESCE(low_stock_threshold, 10)
                FROM settings_backup
                LIMIT 1
                ON CONFLICT (id) DO UPDATE SET
                    low_stock_threshold = EXCLUDED.low_stock_threshold;
            ELSE
                -- Insertar configuración por defecto
                INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
            END IF;
            
            RAISE NOTICE 'Tabla settings migrada exitosamente con estructura JSONB';
        ELSE
            RAISE NOTICE 'La tabla settings ya tiene la estructura correcta';
        END IF;
    ELSE
        -- La tabla no existe, crearla
        CREATE TABLE settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            low_stock_threshold INTEGER NOT NULL DEFAULT 10,
            categories JSONB NOT NULL DEFAULT '["EQUIPAMIENTO", "HERRAMIENTA", "INSUMO", "MOBILIARIO", "OTROS", "UTENSILIO DE COCINA"]'::jsonb,
            sources JSONB NOT NULL DEFAULT '["CREDITO FISCAL", "DONACIONES", "MOBILIARIO ADIF", "MOBILIARIO UMUPLA", "PLAN DE MEJORAS", "SIN CLASIFICAR", "SITRARED", "UMUPLA"]'::jsonb,
            teachers JSONB NOT NULL DEFAULT '["Profesor Martínez", "Profesora Rodríguez", "Profesor García", "Profesora López", "Profesor Fernández", "Profesora Pérez", "Profesor González", "Profesora Sánchez", "Profesor Ramírez", "Profesora Torres", "Charly"]'::jsonb,
            locations JSONB NOT NULL DEFAULT '["Estante A-1", "Estante A-2", "Estante B-1", "Estante B-2", "Armario C-1", "Armario C-2", "Laboratorio Mesa 1", "Laboratorio Mesa 2", "Depósito Principal", "Depósito Secundario"]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT settings_single_row CHECK (id = 1)
        );
        
        -- Insertar configuración por defecto
        INSERT INTO settings (id) VALUES (1);
        
        RAISE NOTICE 'Tabla settings creada exitosamente';
    END IF;
END
$$;

-- Crear trigger para updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    return NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que todo esté correcto
SELECT 'Migración completada exitosamente' as resultado;
SELECT 
    'Configuración actual:' as info,
    low_stock_threshold,
    jsonb_array_length(categories) as total_categories,
    jsonb_array_length(sources) as total_sources,
    jsonb_array_length(teachers) as total_teachers,
    jsonb_array_length(locations) as total_locations
FROM settings WHERE id = 1;
