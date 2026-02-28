"use server";

import sql from './db';
import { AppSettings, DBSettings, Item, Transaction } from '../types/inventory.types';
import { convertAppSettingsToDbSettings, convertDbSettingsToAppSettings } from './settings-utils';

// Helper type for the raw settings from the database
interface RawSettings {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
  categories?: string[];
  locations?: string[];
  teachers?: string[];
  low_stock_threshold?: number;
  default_loan_days?: number;
  currency?: string;
  notifications?: boolean;
  auto_backup?: boolean;
}

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
    locations: ['ALMACEN', 'AULA', 'OFICINA', 'TALLER']
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
    return Array.from(data) as unknown as Item[];
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
    return data as unknown as Item;
  } catch (error) {
    console.error('Error adding item:', error);
    return null;
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

    await sql`
      UPDATE items SET ${sql(payload, ...Object.keys(payload))}
      WHERE id = ${id}
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

    return Array.from(data).map(tx => ({
      ...tx,
      teacherName: tx.first_name ? `${tx.first_name} ${tx.last_name}` : tx.teacher_name,
      teacher_id: tx.teacher_id || undefined
    })) as unknown as Transaction[];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const addTransaction = async (transaction: any): Promise<Transaction | null> => {
  try {
    const payload = {
      ...transaction,
      teacher_id: transaction.teacher_id || null,
      status: transaction.status || 'activo',
      date: transaction.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Remove client-side only aliases before insert
    const { teacherName, ...dbPayload } = payload;

    const columns = Object.keys(dbPayload).filter(key => dbPayload[key] !== undefined);

    const [data] = await sql`
      INSERT INTO transactions ${sql(dbPayload, ...columns)}
      RETURNING *
    `;
    return data as unknown as Transaction;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  }
};

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

// Funciones auxiliares para categorías, ubicaciones, etc.
export const getCategories = async () => {
  const data = await sql`SELECT * FROM categories ORDER BY name ASC`;
  return Array.from(data);
};
export const addCategory = async (name: string) => {
  const [data] = await sql`INSERT INTO categories (name) VALUES (${name}) RETURNING *`;
  return data;
};
export const updateCategory = async (id: string, name: string) => {
  const [data] = await sql`UPDATE categories SET name = ${name} WHERE id = ${id} RETURNING *`;
  return data;
};
export const deleteCategory = async (id: string) => {
  await sql`DELETE FROM categories WHERE id = ${id}`;
  return true;
};

export const getLocations = async () => {
  const data = await sql`SELECT * FROM locations ORDER BY name ASC`;
  return Array.from(data);
};
export const addLocation = async (name: string) => {
  const [data] = await sql`INSERT INTO locations (name) VALUES (${name}) RETURNING *`;
  return data;
};
export const updateLocation = async (id: string, name: string) => {
  const [data] = await sql`UPDATE locations SET name = ${name} WHERE id = ${id} RETURNING *`;
  return data;
};
export const deleteLocation = async (id: string) => {
  await sql`DELETE FROM locations WHERE id = ${id}`;
  return true;
};

export const getSources = async () => {
  const data = await sql`SELECT * FROM sources ORDER BY name ASC`;
  return Array.from(data);
};
export const addSource = async (name: string) => {
  const [data] = await sql`INSERT INTO sources (name) VALUES (${name}) RETURNING *`;
  return data;
};
export const updateSource = async (id: string, name: string) => {
  const [data] = await sql`UPDATE sources SET name = ${name} WHERE id = ${id} RETURNING *`;
  return data;
};
export const deleteSource = async (id: string) => {
  await sql`DELETE FROM sources WHERE id = ${id}`;
  return true;
};

export const getConditions = async () => {
  const data = await sql`SELECT * FROM conditions ORDER BY name ASC`;
  return Array.from(data);
};
export const addCondition = async (name: string) => {
  const [data] = await sql`INSERT INTO conditions (name) VALUES (${name}) RETURNING *`;
  return data;
};
export const updateCondition = async (id: string, name: string) => {
  const [data] = await sql`UPDATE conditions SET name = ${name} WHERE id = ${id} RETURNING *`;
  return data;
};
export const deleteCondition = async (id: string) => {
  await sql`DELETE FROM conditions WHERE id = ${id}`;
  return true;
};
