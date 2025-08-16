import { createClient } from "@supabase/supabase-js"

// Obtener variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Función para verificar si Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  const hasUrl = !!supabaseUrl && supabaseUrl !== ""
  const hasKey = !!supabaseAnonKey && supabaseAnonKey !== ""

  console.log("Supabase URL:", supabaseUrl ? "✓ Configurada" : "✗ No configurada")
  console.log("Supabase Key:", hasKey ? "✓ Configurada" : "✗ No configurada")

  return hasUrl && hasKey
}

// Crear cliente de Supabase solo si está configurado
let supabase: ReturnType<typeof createClient> | null = null

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "X-Client-Info": "inventario-cfp413@1.0.0",
        },
      },
    })
    console.log("✅ Cliente de Supabase inicializado correctamente")
  } catch (error) {
    console.error("❌ Error inicializando cliente de Supabase:", error)
    supabase = null
  }
} else {
  console.warn("⚠️ Supabase no está configurado. Usando modo local.")
}

// Exportar cliente
export { supabase }

// Función para verificar la conexión
export const testConnection = async (): Promise<boolean> => {
  if (!supabase) {
    console.log("❌ No hay cliente de Supabase disponible")
    return false
  }

  try {
    console.log("🔍 Probando conexión a Supabase...")

    // Hacer una consulta simple para probar la conexión
    const { data, error } = await supabase.from("items").select("count", { count: "exact", head: true })

    if (error) {
      console.error("❌ Error en la conexión:", error.message)
      return false
    }

    console.log("✅ Conexión a Supabase exitosa")
    return true
  } catch (error) {
    console.error("❌ Error probando conexión:", error)
    return false
  }
}

// Función para obtener información del cliente
export const getSupabaseInfo = () => {
  return {
    isConfigured: isSupabaseConfigured(),
    hasClient: !!supabase,
    url: supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : "No configurada",
    version: "2.39.0",
  }
}

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          name: string
          category: string
          quantity: number
          source: string
          cost: number | null
          acquisition_date: string
          description: string | null
          status: string
          image: string | null
          type: string
          brand: string | null
          condition: string
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          quantity: number
          source: string
          cost?: number | null
          acquisition_date: string
          description?: string | null
          status?: string
          image?: string | null
          type: string
          brand?: string | null
          condition?: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          quantity?: number
          source?: string
          cost?: number | null
          acquisition_date?: string
          description?: string | null
          status?: string
          image?: string | null
          type?: string
          brand?: string | null
          condition?: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          item_id: string
          item_name: string
          teacher_name: string
          quantity: number
          type: string
          date: string
          return_date: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          item_name: string
          teacher_name: string
          quantity: number
          type: string
          date: string
          return_date?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          item_name?: string
          teacher_name?: string
          quantity?: number
          type?: string
          date?: string
          return_date?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      disposals: {
        Row: {
          id: string
          item_id: string
          item_name: string
          quantity: number
          reason: string
          date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          item_name: string
          quantity: number
          reason: string
          date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          item_name?: string
          quantity?: number
          reason?: string
          date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          low_stock_threshold: number
          categories: string[]
          sources: string[]
          teachers: string[]
          locations: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          low_stock_threshold?: number
          categories?: string[]
          sources?: string[]
          teachers?: string[]
          locations?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          low_stock_threshold?: number
          categories?: string[]
          sources?: string[]
          teachers?: string[]
          locations?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Exportar tipo del cliente
export type SupabaseClient = typeof supabase

// Función de utilidad para manejar errores de Supabase
export const handleSupabaseError = (error: any): string => {
  if (!error) return "Error desconocido"

  // Errores comunes de Supabase
  const errorMessages: Record<string, string> = {
    "23505": "Ya existe un registro con esos datos",
    "23503": "No se puede eliminar porque está siendo usado",
    "42P01": "La tabla no existe en la base de datos",
    "42703": "La columna especificada no existe",
    PGRST116: "No se encontraron registros",
    PGRST301: "No tienes permisos para realizar esta acción",
  }

  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code]
  }

  if (error.message) {
    return error.message
  }

  return "Error de base de datos"
}

// Función para logging de operaciones
export const logOperation = (operation: string, table: string, success: boolean, error?: any) => {
  const timestamp = new Date().toISOString()
  const status = success ? "✅" : "❌"

  console.log(`${status} [${timestamp}] ${operation} en ${table}`)

  if (!success && error) {
    console.error("Error details:", error)
  }
}

export default supabase
