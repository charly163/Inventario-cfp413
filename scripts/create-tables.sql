-- Crear tabla de artículos
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  cost DECIMAL(10,2),
  acquisition_date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'low-stock', 'out-of-stock')),
  image TEXT,
  type TEXT NOT NULL CHECK (type IN ('herramienta', 'insumo')),
  brand TEXT,
  condition TEXT NOT NULL DEFAULT 'nuevo' CHECK (condition IN ('nuevo', 'usado', 'regular', 'malo')),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('loan', 'donation')),
  date DATE NOT NULL,
  return_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de bajas
CREATE TABLE IF NOT EXISTS disposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('damaged', 'expired', 'worn-out', 'obsolete', 'other')),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de configuración
CREATE TABLE IF NOT EXISTS settings (
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_disposals_item_id ON disposals(item_id);
CREATE INDEX IF NOT EXISTS idx_disposals_date ON disposals(date);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disposals_updated_at ON disposals;
CREATE TRIGGER update_disposals_updated_at
    BEFORE UPDATE ON disposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración inicial si no existe
INSERT INTO settings (id, low_stock_threshold, categories, sources, teachers, locations)
VALUES (
  1,
  10,
  '["EQUIPAMIENTO", "HERRAMIENTA", "INSUMO", "MOBILIARIO", "OTROS", "UTENSILIO DE COCINA"]'::jsonb,
  '["CREDITO FISCAL", "DONACIONES", "MOBILIARIO ADIF", "MOBILIARIO UMUPLA", "PLAN DE MEJORAS", "SIN CLASIFICAR", "SITRARED", "UMUPLA"]'::jsonb,
  '["Profesor Martínez", "Profesora Rodríguez", "Profesor García", "Profesora López", "Profesor Fernández", "Profesora Pérez", "Profesor González", "Profesora Sánchez", "Profesor Ramírez", "Profesora Torres", "Charly"]'::jsonb,
  '["Estante A-1", "Estante A-2", "Estante B-1", "Estante B-2", "Armario C-1", "Armario C-2", "Laboratorio Mesa 1", "Laboratorio Mesa 2", "Depósito Principal", "Depósito Secundario"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Tablas creadas exitosamente' as resultado;
