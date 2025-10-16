import { supabase } from './supabase';
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
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting teachers:', error);
    return [];
  }
};

// Agregar un nuevo profesor
export const addTeacher = async (teacherData: Omit<any, 'id' | 'created_at' | 'updated_at'>): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .insert([teacherData])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding teacher:', error);
    return null;
  }
};

// Marcar un profesor como inactivo
export const removeTeacher = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('teachers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing teacher:', error);
    return false;
  }
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    // Get settings by key
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'configuracion_principal')
      .single<RawSettings>();

    if (error || !data) {
      console.error('Error getting settings, using defaults:', error);
      // Return default settings if no settings found
      return getDefaultAppSettings();
    }

    // Map the raw data to DBSettings format
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
      notifications: data.notifications !== false, // Default to true if not set
      auto_backup: data.auto_backup || false,
      language: 'es', // Default language
      sources: ['COMPRA', 'DONACION', 'TRASLADO', 'OTRO'] // Default sources
    };

    return convertDbSettingsToAppSettings(dbSettings);
  } catch (error) {
    console.error('Error getting settings:', error);
    // Return default settings in case of error
    return {
      lowStockThreshold: 10,
      defaultLoanDays: 14,
      autoBackup: false,
      notifications: true,
      currency: 'USD',
      language: 'es',
      categories: ['EQUIPAMIENTO', 'HERRAMIENTA', 'INSUMO', 'MOBILIARIO', 'OTROS', 'UTENSILIO DE COCINA'],
      sources: ['COMPRA', 'DONACION', 'TRASLADO', 'OTRO'],
      teachers: [],
      locations: ['ALMACEN', 'AULA', 'OFICINA', 'TALLER']
    };
  }
};

// Helper function to get default app settings
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
    // Convert to database format
    const dbSettings = convertAppSettingsToDbSettings(settings);

    // Get the current settings to check if we need to update or insert
    const { data: existingSettings } = await supabase
      .from('settings')
      .select('id')
      .eq('key', 'configuracion_principal')
      .single<{ id: string }>();

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

    let error;

    if (existingSettings?.id) {
      // Update existing settings
      const { error: updateError } = await supabase
        .from('settings')
        .update(settingsData)
        .eq('id', existingSettings.id);
      error = updateError;
    } else {
      // Insert new settings
      const { error: insertError } = await supabase
        .from('settings')
        .insert([{
          ...settingsData,
          created_at: new Date().toISOString(),
          value: {}
        }]);
      error = insertError;
    }

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

export const getItems = async (): Promise<Item[]> => {
  try {
    console.log('Obteniendo elementos de la base de datos...');
    const { data, error, count } = await supabase
      .from('items')
      .select('*', { count: 'exact' });

    console.log('Resultado de la consulta a Supabase:', { data, error, count });
    
    if (error) {
      console.error('Error al obtener elementos:', error);
      throw error;
    }
    
    console.log(`Se encontraron ${data?.length || 0} elementos en la base de datos`);
    return (data || []) as Item[];
  } catch (error) {
    console.error('Error getting items:', error);
    return [];
  }
};

export const addItem = async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item | null> => {
  try {
    const payload: any = {
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('items')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Item;
  } catch (error) {
    console.error('Error adding item:', error);
    return null;
  }
};

export const updateItem = async (id: string, updates: Partial<Item>): Promise<boolean> => {
  try {
    const payload: { [key: string]: any } = { updated_at: new Date().toISOString() };

    // List of valid columns in the 'items' table
    const validColumns = [
      'name', 'category', 'quantity', 'source', 'cost', 'acquisition_date',
      'description', 'status', 'image', 'type', 'brand', 'condition', 'location'
    ];

    for (const key in updates) {
      if (validColumns.includes(key)) {
        payload[key] = (updates as any)[key];
      }
    }

    const { error } = await supabase
      .from('items')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating item:', error);
    return false;
  }
};

// Obtener transacciones con información del profesor
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        teacher:teachers (id, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mapear los datos para incluir el nombre del profesor
    return (data || []).map(tx => ({
      ...tx,
      teacherName: tx.teacher ? `${tx.teacher.first_name} ${tx.teacher.last_name}` : '',
      teacher_id: tx.teacher_id || undefined
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

// Agregar una nueva transacción
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & { teacher_id?: string }): Promise<Transaction | null> => {
  try {
    // Si tenemos teacherName pero no teacher_id, intentamos encontrarlo
    if (transaction.teacherName && !transaction.teacher_id) {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .or(`first_name.ilike.${transaction.teacherName}%,last_name.ilike.%${transaction.teacherName}%`)
        .eq('is_active', true)
        .single();

      if (teacher) {
        transaction.teacher_id = teacher.id;
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        teacher_id: transaction.teacher_id || null,
        status: 'activo',
        date: new Date().toISOString().split('T')[0],
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Error checking database connection:', error);
    return false;
  }
};

export const deleteItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    if (!id) {
      console.error('Error: No se proporcionó un ID de transacción');
      return false;
    }
    
    console.log(`Eliminando transacción con ID: ${id}`);
    
    // Intentar eliminar directamente sin verificación previa
    const { error: deleteError, count } = await supabase
      .from('transactions')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar la transacción:', deleteError);
      return false;
    }
    
    if (count === 0) {
      console.warn(`No se encontró ninguna transacción con ID: ${id}`);
      return false;
    }
    
    console.log(`Transacción ${id} eliminada correctamente`);
    return true;
  } catch (error) {
    console.error('Error inesperado al eliminar transacción:', error);
    return false;
  }
};

export const updateTeacher = async (id: string, updates: Partial<any>): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating teacher:', error);
    return null;
  }
};

export const getCategories = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const addCategory = async (name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    return null;
  }
};

export const updateCategory = async (id: string, name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

export const getLocations = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting locations:', error);
    return [];
  }
};

export const addLocation = async (name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding location:', error);
    return null;
  }
};

export const updateLocation = async (id: string, name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating location:', error);
    return null;
  }
};

export const deleteLocation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting location:', error);
    return false;
  }
};

export const getSources = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting sources:', error);
    return [];
  }
};

export const addSource = async (name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding source:', error);
    return null;
  }
};

export const updateSource = async (id: string, name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('sources')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating source:', error);
    return null;
  }
};

export const deleteSource = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting source:', error);
    return false;
  }
};

export const getConditions = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('conditions')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting conditions:', error);
    return [];
  }
};

export const addCondition = async (name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('conditions')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding condition:', error);
    return null;
  }
};

export const updateCondition = async (id: string, name: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('conditions')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating condition:', error);
    return null;
  }
};

export const deleteCondition = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conditions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting condition:', error);
    return false;
  }
};
