import { supabase, isSupabaseConfigured } from "./supabase"
import type { Item, Transaction, Disposal, AppSettings } from "@/app/page"

// Función para verificar la conexión
export const checkConnection = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado correctamente")
  }

  if (!supabase) {
    throw new Error("Cliente de Supabase no inicializado")
  }

  try {
    console.log("Verificando conexión a Supabase...")
    const { error } = await supabase.from("items").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Error de conexión:", error)
      if (error.code === "42P01") {
        throw new Error("Las tablas no existen en la base de datos. Ejecuta los scripts SQL.")
      }
      throw new Error(`Error de base de datos: ${error.message}`)
    }

    console.log("Conexión a Supabase exitosa")
  } catch (error: any) {
    console.error("Error verificando conexión:", error)
    throw error
  }
}

// Función para obtener todos los artículos
export const getItems = async (): Promise<Item[]> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Obteniendo artículos...")
    const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo artículos:", error)
      throw new Error(`Error al obtener artículos: ${error.message}`)
    }

    console.log(`${data?.length || 0} artículos obtenidos`)
    return data || []
  } catch (error: any) {
    console.error("Error en getItems:", error)
    throw error
  }
}

// Función para agregar un artículo
export const addItem = async (item: Omit<Item, "id">): Promise<Item> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Agregando artículo:", item.name)
    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          source: item.source,
          cost: item.cost,
          acquisition_date: item.acquisitionDate,
          description: item.description,
          status: item.status,
          image: item.image,
          type: item.type,
          brand: item.brand,
          condition: item.condition,
          location: item.location,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error agregando artículo:", error)
      throw new Error(`Error al agregar artículo: ${error.message}`)
    }

    const newItem: Item = {
      id: data.id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      source: data.source,
      cost: data.cost,
      acquisitionDate: data.acquisition_date,
      description: data.description,
      status: data.status,
      image: data.image,
      type: data.type,
      brand: data.brand,
      condition: data.condition,
      location: data.location,
    }

    console.log("Artículo agregado exitosamente")
    return newItem
  } catch (error: any) {
    console.error("Error en addItem:", error)
    throw error
  }
}

// Función para actualizar un artículo
export const updateItem = async (id: string, updates: Partial<Item>): Promise<Item> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Actualizando artículo:", id)
    const updateData: any = {}

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity
    if (updates.source !== undefined) updateData.source = updates.source
    if (updates.cost !== undefined) updateData.cost = updates.cost
    if (updates.acquisitionDate !== undefined) updateData.acquisition_date = updates.acquisitionDate
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.image !== undefined) updateData.image = updates.image
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.brand !== undefined) updateData.brand = updates.brand
    if (updates.condition !== undefined) updateData.condition = updates.condition
    if (updates.location !== undefined) updateData.location = updates.location

    const { data, error } = await supabase.from("items").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error actualizando artículo:", error)
      throw new Error(`Error al actualizar artículo: ${error.message}`)
    }

    const updatedItem: Item = {
      id: data.id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      source: data.source,
      cost: data.cost,
      acquisitionDate: data.acquisition_date,
      description: data.description,
      status: data.status,
      image: data.image,
      type: data.type,
      brand: data.brand,
      condition: data.condition,
      location: data.location,
    }

    console.log("Artículo actualizado exitosamente")
    return updatedItem
  } catch (error: any) {
    console.error("Error en updateItem:", error)
    throw error
  }
}

// Función para obtener todas las transacciones
export const getTransactions = async (): Promise<Transaction[]> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Obteniendo transacciones...")
    const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo transacciones:", error)
      throw new Error(`Error al obtener transacciones: ${error.message}`)
    }

    const transactions: Transaction[] = (data || []).map((t) => ({
      id: t.id,
      itemId: t.item_id,
      itemName: t.item_name,
      teacherName: t.teacher_name,
      quantity: t.quantity,
      type: t.type,
      date: t.date,
      returnDate: t.return_date,
      status: t.status,
      notes: t.notes,
    }))

    console.log(`${transactions.length} transacciones obtenidas`)
    return transactions
  } catch (error: any) {
    console.error("Error en getTransactions:", error)
    throw error
  }
}

// Función para agregar una transacción
export const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<Transaction> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Agregando transacción:", transaction.itemName)
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          item_id: transaction.itemId,
          item_name: transaction.itemName,
          teacher_name: transaction.teacherName,
          quantity: transaction.quantity,
          type: transaction.type,
          date: transaction.date,
          return_date: transaction.returnDate,
          status: transaction.status,
          notes: transaction.notes,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error agregando transacción:", error)
      throw new Error(`Error al agregar transacción: ${error.message}`)
    }

    const newTransaction: Transaction = {
      id: data.id,
      itemId: data.item_id,
      itemName: data.item_name,
      teacherName: data.teacher_name,
      quantity: data.quantity,
      type: data.type,
      date: data.date,
      returnDate: data.return_date,
      status: data.status,
      notes: data.notes,
    }

    console.log("Transacción agregada exitosamente")
    return newTransaction
  } catch (error: any) {
    console.error("Error en addTransaction:", error)
    throw error
  }
}

// Función para actualizar una transacción
export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Actualizando transacción:", id)
    const updateData: any = {}

    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.returnDate !== undefined) updateData.return_date = updates.returnDate
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { error } = await supabase.from("transactions").update(updateData).eq("id", id)

    if (error) {
      console.error("Error actualizando transacción:", error)
      throw new Error(`Error al actualizar transacción: ${error.message}`)
    }

    console.log("Transacción actualizada exitosamente")
  } catch (error: any) {
    console.error("Error en updateTransaction:", error)
    throw error
  }
}

// Función para obtener todas las bajas
export const getDisposals = async (): Promise<Disposal[]> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Obteniendo bajas...")
    const { data, error } = await supabase.from("disposals").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo bajas:", error)
      throw new Error(`Error al obtener bajas: ${error.message}`)
    }

    const disposals: Disposal[] = (data || []).map((d) => ({
      id: d.id,
      itemId: d.item_id,
      itemName: d.item_name,
      quantity: d.quantity,
      reason: d.reason,
      date: d.date,
      notes: d.notes,
    }))

    console.log(`${disposals.length} bajas obtenidas`)
    return disposals
  } catch (error: any) {
    console.error("Error en getDisposals:", error)
    throw error
  }
}

// Función para agregar una baja
export const addDisposal = async (disposal: Omit<Disposal, "id">): Promise<Disposal> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Agregando baja:", disposal.itemName)
    const { data, error } = await supabase
      .from("disposals")
      .insert([
        {
          item_id: disposal.itemId,
          item_name: disposal.itemName,
          quantity: disposal.quantity,
          reason: disposal.reason,
          date: disposal.date,
          notes: disposal.notes,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error agregando baja:", error)
      throw new Error(`Error al agregar baja: ${error.message}`)
    }

    const newDisposal: Disposal = {
      id: data.id,
      itemId: data.item_id,
      itemName: data.item_name,
      quantity: data.quantity,
      reason: data.reason,
      date: data.date,
      notes: data.notes,
    }

    console.log("Baja agregada exitosamente")
    return newDisposal
  } catch (error: any) {
    console.error("Error en addDisposal:", error)
    throw error
  }
}

// Función para actualizar una baja
export const updateDisposal = async (id: string, updates: Disposal): Promise<void> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Actualizando baja:", id)
    const { error } = await supabase
      .from("disposals")
      .update({
        item_id: updates.itemId,
        item_name: updates.itemName,
        quantity: updates.quantity,
        reason: updates.reason,
        date: updates.date,
        notes: updates.notes,
      })
      .eq("id", id)

    if (error) {
      console.error("Error actualizando baja:", error)
      throw new Error(`Error al actualizar baja: ${error.message}`)
    }

    console.log("Baja actualizada exitosamente")
  } catch (error: any) {
    console.error("Error en updateDisposal:", error)
    throw error
  }
}

// Función para obtener configuración
export const getSettings = async (): Promise<AppSettings> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Obteniendo configuración...")
    const { data, error } = await supabase.from("settings").select("*").single()

    if (error) {
      if (error.code === "PGRST116") {
        // No hay configuración, devolver valores por defecto
        console.log("No hay configuración guardada, usando valores por defecto")
        return {
          lowStockThreshold: 10,
          categories: ["EQUIPAMIENTO", "HERRAMIENTA", "INSUMO", "MOBILIARIO", "OTROS", "UTENSILIO DE COCINA"],
          sources: [
            "CREDITO FISCAL",
            "DONACIONES",
            "MOBILIARIO ADIF",
            "MOBILIARIO UMUPLA",
            "PLAN DE MEJORAS",
            "SIN CLASIFICAR",
            "SITRARED",
            "UMUPLA",
          ],
          teachers: [
            "Profesor Martínez",
            "Profesora Rodríguez",
            "Profesor García",
            "Profesora López",
            "Profesor Fernández",
            "Profesora Pérez",
            "Profesor González",
            "Profesora Sánchez",
            "Profesor Ramírez",
            "Profesora Torres",
            "Charly",
          ],
          locations: [
            "Estante A-1",
            "Estante A-2",
            "Estante B-1",
            "Estante B-2",
            "Armario C-1",
            "Armario C-2",
            "Laboratorio Mesa 1",
            "Laboratorio Mesa 2",
            "Depósito Principal",
            "Depósito Secundario",
          ],
        }
      }
      console.error("Error obteniendo configuración:", error)
      throw new Error(`Error al obtener configuración: ${error.message}`)
    }

    const settings: AppSettings = {
      lowStockThreshold: data.low_stock_threshold,
      categories: data.categories,
      sources: data.sources,
      teachers: data.teachers,
      locations: data.locations,
    }

    console.log("Configuración obtenida exitosamente")
    return settings
  } catch (error: any) {
    console.error("Error en getSettings:", error)
    throw error
  }
}

// Función para actualizar configuración
export const updateSettings = async (settings: AppSettings): Promise<void> => {
  if (!supabase) throw new Error("Supabase no configurado")

  try {
    console.log("Actualizando configuración...")

    // Primero intentar actualizar
    const { data, error: updateError } = await supabase
      .from("settings")
      .update({
        low_stock_threshold: settings.lowStockThreshold,
        categories: settings.categories,
        sources: settings.sources,
        teachers: settings.teachers,
        locations: settings.locations,
      })
      .eq("id", 1)
      .select()

    if (updateError || !data || data.length === 0) {
      // Si no existe, crear nuevo registro
      console.log("Configuración no existe, creando nueva...")
      const { error: insertError } = await supabase.from("settings").insert([
        {
          id: 1,
          low_stock_threshold: settings.lowStockThreshold,
          categories: settings.categories,
          sources: settings.sources,
          teachers: settings.teachers,
          locations: settings.locations,
        },
      ])

      if (insertError) {
        console.error("Error creando configuración:", insertError)
        throw new Error(`Error al crear configuración: ${insertError.message}`)
      }
    }

    console.log("Configuración actualizada exitosamente")
  } catch (error: any) {
    console.error("Error en updateSettings:", error)
    throw error
  }
}
