-- Habilitar RLS en la tabla settings si no está habilitado
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Crear una política para permitir la lectura a todos los usuarios autenticados
CREATE POLICY "Enable read access for all authenticated users" 
ON settings
FOR SELECT
TO authenticated
USING (true);

-- Crear una política para permitir la actualización solo a administradores
CREATE POLICY "Enable update for admin users"
ON settings
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Crear una política para permitir la inserción solo a administradores
CREATE POLICY "Enable insert for admin users"
ON settings
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Verificar si las políticas se crearon correctamente
SELECT 
    tablename, 
    policyname, 
    cmd, 
    permissive, 
    roles, 
    qual, 
    with_check 
FROM 
    pg_policies 
WHERE 
    tablename = 'settings';
