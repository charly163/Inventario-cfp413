"use server";

import sql from './db';
import { AppSettings, DBSettings, Item, Transaction } from '../types/inventory.types';
import { convertAppSettingsToDbSettings, convertDbSettingsToAppSettings } from './settings-utils';

// Log simple para ver si el módulo se carga en el servidor
console.log("Database module initialized at", new Date().toISOString());

// Obtener todos los profesores activos
export const getTeachers = async (): Promise<any[]> => {
  try {
    const data = await sql`
      SELECT * FROM teachers 
      WHERE is_active = true 
      ORDER BY last_name ASC
    `;
    return Array.from(data);
  } catch (error) {
    console.error('Error getting teachers:', error);
    return [];
  }
};

// Agregar un nuevo profesor
export const addTeacher = async (teacherData: any): Promise<any | null> => {
  try {
    const [data] = await sql`
      INSERT INTO teachers ${sql(teacherData, 'first_name', 'last_name', 'is_active')}
      RETURNING *
    `;
    return data;
  } catch (error) {
    console.error('Error adding teacher:', error);
    return null;
  }
};

// Marcar un profesor como inactivo
export const removeTeacher = async (id: string): Promise<boolean> => {
  try {
    await sql`
      UPDATE teachers 
      SET is_active = false 
      WHERE id = ${id}
    `;
    return true;
  } catch (error) {
    console.error('Error removing teacher:', error);
    return false;
  }
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const [data] = await sql`
      SELECT * FROM settings 
      WHERE key = 'configuracion_principal'
      LIMIT 1
    `;

    if (!data) {
      console.log('No settings found, using defaults');
      return getDefaultAppSettings();
    }

    const dbSettings: DBSettings = {
      id: data.id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      categories: data.categories || [],
      locations: data.locations || [],
      teachers: data.teachers || [],
      low_stock_threshold: data.low_stock_threshold || 5,
      default_loan_days: data.default_loan_days || 7,
      currency: data.currency || 'ARS',
      notifications: data.notifications !== false,
      auto_backup: data.auto_backup || false,
      language: 'es',
      sources: ['COMPRA', 'DONACION', 'TRASLADO', 'OTRO']
    };

    return convertDbSettingsToAppSettings(dbSettings);
  } catch (error) {
    console.error('Error getting settings:', error);
    return getDefaultAppSettings();
  }
};

function getDefaultAppSettings(): AppSettings {
  return {
    lowStockThreshold: 5,
    defaultLoanDays: 7,
    autoBackup: false,
    notifications: true,
    currency: 'ARS',
    language: 'es',
    categories: ['EQUIPAMIENTO', 'HERRAMIENTA', 'INSUMO', 'MOBILIARIO', 'OTROS', 'UTENSILIO DE COCINA'],
    sources: ['COMPRA', 'DONACION', 'TRASLADO', 'OTRO'],
    teachers: [],
    locations: ['ALMACEN', 'AULA', 'OFICINA', 'TALLER'],
    itemTypes: ['herramienta', 'insumo'],
    conditions: ['nuevo', 'usado', 'regular', 'malo'],
    transactionTypes: ['prestamo', 'devolucion', 'entrada', 'salida']
  };
}

export const updateSettings = async (settings: AppSettings): Promise<boolean> => {
  try {
    const dbSettings = convertAppSettingsToDbSettings(settings);
    const settingsData = {
      key: 'configuracion_principal',
      categories: dbSettings.categories,
      locations: dbSettings.locations,
      teachers: dbSettings.teachers,
      low_stock_threshold: dbSettings.low_stock_threshold,
      default_loan_days: dbSettings.default_loan_days,
      currency: dbSettings.currency,
      notifications: dbSettings.notifications,
      auto_backup: dbSettings.auto_backup,
      updated_at: new Date().toISOString()
    };

    const [existing] = await sql`
      SELECT id FROM settings WHERE key = 'configuracion_principal' LIMIT 1
    `;

    if (existing) {
      await sql`
        UPDATE settings SET ${sql(settingsData, 'categories', 'locations', 'teachers', 'low_stock_threshold', 'default_loan_days', 'currency', 'notifications', 'auto_backup', 'updated_at')}
        WHERE id = ${existing.id}
      `;
    } else {
      await sql`
        INSERT INTO settings ${sql({ ...settingsData, created_at: new Date().toISOString() }, 'key', 'categories', 'locations', 'teachers', 'low_stock_threshold', 'default_loan_days', 'currency', 'notifications', 'auto_backup', 'updated_at', 'created_at')}
      `;
    }
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

export const getItems = async (): Promise<Item[]> => {
  try {
    const data = await sql`SELECT * FROM items ORDER BY name ASC`;
    return (data as any[]).map(item => ({
      ...item,
      cost: item.cost ? Number(item.cost) : null,
      quantity: item.quantity ? Number(item.quantity) : 0
    })) as Item[];
  } catch (error) {
    console.error('Error getting items:', error);
    return [];
  }
};

export const addItem = async (item: any): Promise<Item | null> => {
  try {
    const columns = [
      'name', 'category', 'quantity', 'source', 'cost', 'acquisition_date',
      'description', 'status', 'image', 'type', 'brand', 'condition', 'location'
    ];

    const payload: any = {};
    columns.forEach(col => {
      if (item[col] !== undefined) payload[col] = item[col];
    });
    payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();

    const [data] = await sql`
      INSERT INTO items ${sql(payload, ...Object.keys(payload))}
      RETURNING *
    `;
    return {
      ...data,
      cost: data.cost ? Number(data.cost) : null,
      quantity: data.quantity ? Number(data.quantity) : 0
    } as any;
  } catch (error) {
    console.error('DATABASE ERROR adding item:', error);
    throw error; // Re-lanzar para que el cliente sepa que falló
  }
};

export const updateItem = async (id: string, updates: any): Promise<boolean> => {
  try {
    const validColumns = [
      'name', 'category', 'quantity', 'source', 'cost', 'acquisition_date',
      'description', 'status', 'image', 'type', 'brand', 'condition', 'location'
    ];

    const payload: any = {};
    for (const key of validColumns) {
      if (key in updates) {
        payload[key] = (updates as any)[key];
      }
    }
    payload.updated_at = new Date().toISOString();

    const [data] = await sql`
      UPDATE items SET ${sql(payload, ...Object.keys(payload))}
      WHERE id = ${id}
      RETURNING *
    `;
    return true;
  } catch (error) {
    console.error('Error updating item:', error);
    return false;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const data = await sql`
      SELECT t.*, 
             tr.first_name, tr.last_name
      FROM transactions t
      LEFT JOIN teachers tr ON t.teacher_id = tr.id
      ORDER BY t.created_at DESC
    `;

    return (data as any[]).map(tx => ({
      ...tx,
      quantity: Number(tx.quantity || 0),
      teacherName: tx.first_name ? `${tx.first_name} ${tx.last_name}` : (tx.teacher_name || tx.teacherName || 'Sin asignar'),
      teacherId: tx.teacher_id || tx.teacherId,
      itemId: tx.item_id || tx.itemId,
      itemName: tx.item_name || tx.itemName,
      returnDate: tx.return_date || tx.returnDate,
      courseName: tx.course_name || tx.courseName,
      teacher_id: tx.teacher_id,
      item_id: tx.item_id,
      item_name: tx.item_name,
      return_date: tx.return_date,
      course_name: tx.course_name
    })) as Transaction[];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const addTransaction = async (transaction: any): Promise<Transaction | null> => {
  try {
    // INSERT EXPLÍCITO para evitar errores de mapeo dinámico
    const finalQuery = sql`
      INSERT INTO transactions (
        item_id, item_name, teacher_id, teacher_name, 
        quantity, type, date, return_date, 
        status, notes, course_name, created_at, updated_at
      ) VALUES (
        ${transaction.item_id}, ${transaction.item_name}, ${transaction.teacher_id || null}, ${transaction.teacher_name || 'Sin asignar'},
        ${Number(transaction.quantity)}, ${transaction.type}, ${transaction.date}, ${transaction.return_date || null},
        ${transaction.status || 'activo'}, ${transaction.notes || null}, ${transaction.course_name || null}, 
        ${new Date().toISOString()}, ${new Date().toISOString()}
      )
      RETURNING *
    `;
    
    const results = await finalQuery;
    
    if (!results || results.length === 0) {
      return { success: false, error: 'No se recibió respuesta de Neon tras insertar.' } as any;
    }

    const data = results[0];
    const normalizedData = {
      ...data,
      quantity: Number(data.quantity),
      teacherName: data.teacher_name,
      itemId: data.item_id,
      teacherId: data.teacher_id,
      courseName: data.course_name
    };
    
    return { success: true, data: normalizedData } as any;
  } catch (error: any) {
    console.error('DATABASE ERROR in addTransaction:', error);
    return { success: false, error: error.message || 'Error desconocido' } as any;
  }
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`;
    
    // Migración rápida: asegurar que existan las columnas nuevas en producción
    try {
      await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS course_name TEXT`;
    } catch (e) {
      console.log("Columna course_name ya existe o error al crearla (ignorable)");
    }

    return true;
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  }
};

// ... Borrado de items, transacciones, etc (sin cambios en lógica pero con try/catch) ...

export const deleteItem = async (id: string): Promise<boolean> => {
  try {
    await sql`DELETE FROM items WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const result = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING id`;
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

export const updateTeacher = async (id: string, updates: any): Promise<any | null> => {
  try {
    const columns = Object.keys(updates).filter(k => updates[k] !== undefined);
    const [data] = await sql`
      UPDATE teachers SET ${sql(updates, ...columns)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return data;
  } catch (error) {
    console.error('Error updating teacher:', error);
    return null;
  }
};

// Funciones auxiliares para categorías, ubicaciones, etc. con try/catch robusto
export const getCategories = async () => {
  try {
    const data = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return Array.from(data);
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const addCategory = async (name: string) => {
  try {
    const [data] = await sql`INSERT INTO categories (name) VALUES (${name}) RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    return null;
  }
};

export const updateCategory = async (id: string, name: string) => {
  try {
    const [data] = await sql`UPDATE categories SET name = ${name} WHERE id = ${id} RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    await sql`DELETE FROM categories WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

// Funciones de ubicación
export const getLocations = async () => {
  try {
    const data = await sql`SELECT * FROM locations ORDER BY name ASC`;
    return Array.from(data);
  } catch (error) {
    console.error('Error getting locations:', error);
    return [];
  }
};

export const addLocation = async (name: string) => {
  try {
    const [data] = await sql`INSERT INTO locations (name) VALUES (${name}) RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error adding location:', error);
    return null;
  }
};

export const updateLocation = async (id: string, name: string) => {
  try {
    const [data] = await sql`UPDATE locations SET name = ${name} WHERE id = ${id} RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error updating location:', error);
    return null;
  }
};

export const deleteLocation = async (id: string) => {
  try {
    await sql`DELETE FROM locations WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting location:', error);
    return false;
  }
};

// Funciones de fuentes (sources)
export const getSources = async () => {
  try {
    const data = await sql`SELECT * FROM sources ORDER BY name ASC`;
    return Array.from(data);
  } catch (error) {
    console.error('Error getting sources:', error);
    return [];
  }
};

export const addSource = async (name: string) => {
  try {
    const [data] = await sql`INSERT INTO sources (name) VALUES (${name}) RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error adding source:', error);
    return null;
  }
};

export const updateSource = async (id: string, name: string) => {
  try {
    const [data] = await sql`UPDATE sources SET name = ${name} WHERE id = ${id} RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error updating source:', error);
    return null;
  }
};

export const deleteSource = async (id: string) => {
  try {
    await sql`DELETE FROM sources WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting source:', error);
    return false;
  }
};

// Funciones de condiciones (conditions)
export const getConditions = async () => {
  try {
    const data = await sql`SELECT * FROM conditions ORDER BY name ASC`;
    return Array.from(data);
  } catch (error) {
    console.error('Error getting conditions:', error);
    return [];
  }
};

export const addCondition = async (name: string) => {
  try {
    const [data] = await sql`INSERT INTO conditions (name) VALUES (${name}) RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error adding condition:', error);
    return null;
  }
};

export const updateCondition = async (id: string, name: string) => {
  try {
    const [data] = await sql`UPDATE conditions SET name = ${name} WHERE id = ${id} RETURNING *`;
    return data;
  } catch (error) {
    console.error('Error updating condition:', error);
    return null;
  }
};

export const deleteCondition = async (id: string) => {
  try {
    await sql`DELETE FROM conditions WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting condition:', error);
    return false;
  }
};
