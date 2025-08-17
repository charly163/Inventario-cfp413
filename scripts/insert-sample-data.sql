-- Insertar artículos de ejemplo
INSERT INTO items (name, category, quantity, source, cost, acquisition_date, description, status, type, brand, condition, location) VALUES
('Calculadora Científica', 'EQUIPAMIENTO', 25, 'CREDITO FISCAL', 15.99, '2024-01-15', 'TI-84 Plus CE para cálculos avanzados', 'active', 'herramienta', 'Texas Instruments', 'nuevo', 'Estante A-1'),
('Set de Materiales de Arte', 'INSUMO', 5, 'DONACIONES', NULL, '2024-02-01', 'Lápices de colores, marcadores, papel', 'low-stock', 'insumo', 'Faber-Castell', 'usado', 'Armario C-1'),
('Microscopio Digital', 'EQUIPAMIENTO', 8, 'PLAN DE MEJORAS', 299.99, '2024-01-20', 'Microscopio digital con cámara integrada', 'active', 'herramienta', 'Olympus', 'nuevo', 'Laboratorio Mesa 2'),
('Taladro Eléctrico', 'HERRAMIENTA', 3, 'CREDITO FISCAL', 89.99, '2024-01-10', 'Taladro percutor 650W con accesorios', 'active', 'herramienta', 'Bosch', 'nuevo', 'Estante B-1'),
('Papel Bond A4', 'INSUMO', 2, 'UMUPLA', 12.50, '2024-02-15', 'Resma de 500 hojas blancas', 'low-stock', 'insumo', 'Chamex', 'nuevo', 'Armario C-2'),
('Soldador Eléctrico', 'HERRAMIENTA', 4, 'PLAN DE MEJORAS', 45.00, '2024-01-25', 'Soldador de estaño 40W con soporte', 'active', 'herramienta', 'Weller', 'nuevo', 'Estante B-2'),
('Cartuchos de Tinta', 'INSUMO', 8, 'CREDITO FISCAL', 25.00, '2024-02-10', 'Cartuchos de tinta negra para impresora', 'low-stock', 'insumo', 'HP', 'nuevo', 'Armario C-1'),
('Multímetro Digital', 'HERRAMIENTA', 6, 'DONACIONES', 35.50, '2024-01-30', 'Multímetro digital con pantalla LCD', 'active', 'herramienta', 'Fluke', 'usado', 'Laboratorio Mesa 1');

-- Insertar transacciones de ejemplo
INSERT INTO transactions (item_id, item_name, teacher_name, quantity, type, date, return_date, status, notes)
SELECT 
  i.id,
  'Calculadora Científica',
  'Profesor Martínez',
  5,
  'loan',
  '2024-03-01',
  '2024-03-15',
  'active',
  'Para clase de álgebra'
FROM items i WHERE i.name = 'Calculadora Científica' LIMIT 1;

INSERT INTO transactions (item_id, item_name, teacher_name, quantity, type, date, status, notes)
SELECT 
  i.id,
  'Set de Materiales de Arte',
  'Profesora Rodríguez',
  2,
  'donation',
  '2024-02-28',
  'active',
  'Para programa de arte terapia'
FROM items i WHERE i.name = 'Set de Materiales de Arte' LIMIT 1;

INSERT INTO transactions (item_id, item_name, teacher_name, quantity, type, date, return_date, status, notes)
SELECT 
  i.id,
  'Taladro Eléctrico',
  'Profesor García',
  1,
  'loan',
  '2024-03-05',
  '2024-03-12',
  'active',
  'Para proyecto de carpintería'
FROM items i WHERE i.name = 'Taladro Eléctrico' LIMIT 1;

INSERT INTO transactions (item_id, item_name, teacher_name, quantity, type, date, return_date, status, notes)
SELECT 
  i.id,
  'Calculadora Científica',
  'Profesora López',
  3,
  'loan',
  '2024-02-20',
  '2024-02-27',
  'returned',
  'Para examen de matemáticas'
FROM items i WHERE i.name = 'Calculadora Científica' LIMIT 1;

INSERT INTO transactions (item_id, item_name, teacher_name, quantity, type, date, return_date, status, notes)
SELECT 
  i.id,
  'Multímetro Digital',
  'Profesor Fernández',
  2,
  'loan',
  '2024-02-15',
  '2024-02-22',
  'returned',
  'Para práctica de electricidad'
FROM items i WHERE i.name = 'Multímetro Digital' LIMIT 1;

-- Insertar bajas de ejemplo
INSERT INTO disposals (item_id, item_name, quantity, reason, date, notes)
SELECT 
  i.id,
  'Calculadora Científica',
  2,
  'damaged',
  '2024-02-15',
  'Pantalla rota, botones no funcionan'
FROM items i WHERE i.name = 'Calculadora Científica' LIMIT 1;

-- Mensaje de confirmación
SELECT 'Datos de ejemplo insertados exitosamente' as resultado;
