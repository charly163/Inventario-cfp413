// Inventory Item Types
export type ItemType = "herramienta" | "insumo";
export type ItemStatus = "active" | "low-stock" | "out-of-stock";
export type ItemCondition = "nuevo" | "usado" | "regular" | "malo";

export interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  source: string;
  cost?: number | null;
  acquisition_date: string; // Formato: YYYY-MM-DD
  description?: string | null;
  status: ItemStatus;
  image?: string | null;
  type: ItemType;
  brand?: string | null;
  condition: ItemCondition;
  location: string;
  created_at: string;
  updated_at: string;
  
  // Campos para compatibilidad con el código existente
  is_loanable?: boolean;
  is_active?: boolean;
  image_url?: string | null; // Alias para image
  
  // Para futura implementación
  maintenance_history?: MaintenanceRecord[];
  loan_history?: LoanRecord[];
  checklists?: Checklist[];
  min_quantity?: number;
  notes?: string;
  barcode?: string | null;
}

export interface MaintenanceRecord {
  date: string;
  description: string;
  cost?: number;
  technician?: string;
  notes?: string;
}

export interface LoanRecord {
  date_borrowed: string;
  date_returned?: string;
  borrower: string;
  condition_before: string;
  condition_after?: string;
  notes?: string;
}

export interface ChecklistItem {
  description: string;
  completed: boolean;
  completed_at?: string;
  completed_by?: string;
}

export interface Checklist {
  name: string;
  items: ChecklistItem[];
}

// Transaction Types
export type TransactionType = 'prestamo' | 'devolucion' | 'entrada' | 'salida';
export type TransactionStatus = 'activo' | 'completado' | 'vencido';

export interface Transaction {
  id: string;
  item_id: string;
  item_name: string;
  teacher_id: string;  // Added teacher_id field
  teacher_name: string;
  quantity: number;
  type: 'prestamo' | 'devolucion' | 'entrada' | 'salida';
  date: string;
  return_date: string | null;
  status: 'activo' | 'completado' | 'vencido';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Aliases for compatibility
  itemId?: string;
  itemName?: string;
  teacherName?: string;
  returnDate?: string | null;
  borrower?: string; // Alias for teacher_name
  dueDate?: string | null; // Alias for return_date
}

// Disposal Types
export interface Disposal {
  id: string;
  item_id?: string;
  item_name?: string;
  reason: string;
  quantity: number;
  date: string;
  notes?: string | null;
  status: "pendiente" | "aprobada" | "rechazada";
  created_at?: string;
  updated_at?: string;
  // Aliases for compatibility
  itemId?: string;
  itemName?: string;
}

// App Settings
export interface AppSettings {
  categories: string[];
  locations: string[];
  teachers: string[];
  sources: string[];
  lowStockThreshold: number;
  defaultLoanDays: number;
  currency: string;
  notifications: boolean;
  autoBackup: boolean;
  language: string;
}

// Helper type for database settings
export interface DBSettings {
  low_stock_threshold: number;
  default_loan_days: number;
  auto_backup: boolean;
  notifications: boolean;
  currency: string;
  language: string;
  categories: string[];
  sources: string[];
  teachers: string[];
  locations: string[];
  id?: string;  // Changed from number to string to match UUID format
  created_at?: string;
  updated_at?: string;
}
