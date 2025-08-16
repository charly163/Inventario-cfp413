"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Settings,
  Loader2,
  Database,
  Wifi,
  WifiOff,
  ExternalLink,
  Wrench,
  Package2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ItemsList from "@/components/items-list"
import ToolsList from "@/components/tools-list"
import SuppliesList from "@/components/supplies-list"
import AddItemForm from "@/components/add-item-form"
import EditItemForm from "@/components/edit-item-form"
import TransactionsList from "@/components/transactions-list"
import AddTransactionForm from "@/components/add-transaction-form"
import AddMultipleTransactionForm from "@/components/add-multiple-transaction-form"
import DisposalsList from "@/components/disposals-list"
import AddDisposalForm from "@/components/add-disposal-form"
import EditDisposalForm from "@/components/edit-disposal-form"
import ReportsSection from "@/components/reports-section"
import SettingsPanel from "@/components/settings-panel"
import ToolHistoryModal from "@/components/tool-history-modal"
import { toast } from "sonner"

// Types
export interface Item {
  id: string
  name: string
  category: string
  quantity: number
  source: string
  cost?: number
  acquisitionDate: string
  description?: string
  status: "active" | "low-stock" | "out-of-stock"
  image?: string
  type: "herramienta" | "insumo"
  brand?: string
  condition: "nuevo" | "usado" | "regular" | "malo"
  location?: string
}

export interface Transaction {
  id: string
  itemId: string
  itemName: string
  teacherName: string
  quantity: number
  type: "loan" | "donation"
  date: string
  returnDate?: string
  status: "active" | "returned" | "overdue"
  notes?: string
}

export interface Disposal {
  id: string
  itemId: string
  itemName: string
  quantity: number
  reason: "damaged" | "expired" | "worn-out" | "obsolete" | "other"
  date: string
  notes?: string
}

export interface AppSettings {
  lowStockThreshold: number
  categories: string[]
  sources: string[]
  teachers: string[]
  locations: string[]
}

export default function InventoryDashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [disposals, setDisposals] = useState<Disposal[]>([])
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editingDisposal, setEditingDisposal] = useState<Disposal | null>(null)
  const [selectedToolForHistory, setSelectedToolForHistory] = useState<Item | null>(null)
  const [settings, setSettings] = useState<AppSettings>({
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
  })
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [databaseConnected, setDatabaseConnected] = useState(false)
  const [useLocalData, setUseLocalData] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Verificar conexión a Supabase
  const checkSupabaseConnection = async () => {
    try {
      // Verificar variables de entorno
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Variables de entorno de Supabase no configuradas")
      }

      // Intentar importar y usar las funciones de base de datos
      const { checkConnection } = await import("@/lib/database")
      await checkConnection()
      setDatabaseConnected(true)
      setConnectionError(null)
      return true
    } catch (err: any) {
      console.error("Error connecting to Supabase:", err)
      setDatabaseConnected(false)
      setConnectionError(err.message)
      return false
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar conexión a Supabase
      const connected = await checkSupabaseConnection()

      if (connected) {
        // Cargar datos desde Supabase
        const { getItems, getTransactions, getDisposals, getSettings } = await import("@/lib/database")

        const [itemsData, transactionsData, disposalsData, settingsData] = await Promise.all([
          getItems(),
          getTransactions(),
          getDisposals(),
          getSettings(),
        ])

        setItems(itemsData)
        setTransactions(transactionsData)
        setDisposals(disposalsData)
        setSettings(settingsData)
        setUseLocalData(false)

        toast.success("Datos cargados desde Supabase", {
          description: "Conexión exitosa con la base de datos",
        })
      } else {
        // Usar datos de ejemplo locales
        loadSampleData()
        setUseLocalData(true)

        toast.warning("Usando datos locales", {
          description: "No se pudo conectar con la base de datos",
        })
      }
    } catch (err: any) {
      console.error("Error loading data:", err)
      setError("Error al cargar los datos. Usando datos de ejemplo.")
      loadSampleData()
      setUseLocalData(true)

      toast.error("Error al cargar datos", {
        description: err.message || "Error desconocido",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    const sampleItems: Item[] = [
      {
        id: "1",
        name: "Calculadora Científica",
        category: "EQUIPAMIENTO",
        quantity: 25,
        source: "CREDITO FISCAL",
        cost: 15.99,
        acquisitionDate: "2024-01-15",
        description: "TI-84 Plus CE para cálculos avanzados",
        status: "active",
        type: "herramienta",
        brand: "Texas Instruments",
        condition: "nuevo",
        location: "Estante A-1",
      },
      {
        id: "2",
        name: "Set de Materiales de Arte",
        category: "INSUMO",
        quantity: 5,
        source: "DONACIONES",
        acquisitionDate: "2024-02-01",
        description: "Lápices de colores, marcadores, papel",
        status: "low-stock",
        type: "insumo",
        brand: "Faber-Castell",
        condition: "usado",
        location: "Armario C-1",
      },
      {
        id: "3",
        name: "Microscopio Digital",
        category: "EQUIPAMIENTO",
        quantity: 8,
        source: "PLAN DE MEJORAS",
        cost: 299.99,
        acquisitionDate: "2024-01-20",
        description: "Microscopio digital con cámara integrada",
        status: "active",
        type: "herramienta",
        brand: "Olympus",
        condition: "nuevo",
        location: "Laboratorio Mesa 2",
      },
      {
        id: "4",
        name: "Taladro Eléctrico",
        category: "HERRAMIENTA",
        quantity: 3,
        source: "CREDITO FISCAL",
        cost: 89.99,
        acquisitionDate: "2024-01-10",
        description: "Taladro percutor 650W con accesorios",
        status: "active",
        type: "herramienta",
        brand: "Bosch",
        condition: "nuevo",
        location: "Estante B-1",
      },
      {
        id: "5",
        name: "Papel Bond A4",
        category: "INSUMO",
        quantity: 2,
        source: "UMUPLA",
        cost: 12.5,
        acquisitionDate: "2024-02-15",
        description: "Resma de 500 hojas blancas",
        status: "low-stock",
        type: "insumo",
        brand: "Chamex",
        condition: "nuevo",
        location: "Armario C-2",
      },
      {
        id: "6",
        name: "Soldador Eléctrico",
        category: "HERRAMIENTA",
        quantity: 4,
        source: "PLAN DE MEJORAS",
        cost: 45.0,
        acquisitionDate: "2024-01-25",
        description: "Soldador de estaño 40W con soporte",
        status: "active",
        type: "herramienta",
        brand: "Weller",
        condition: "nuevo",
        location: "Estante B-2",
      },
      {
        id: "7",
        name: "Cartuchos de Tinta",
        category: "INSUMO",
        quantity: 8,
        source: "CREDITO FISCAL",
        cost: 25.0,
        acquisitionDate: "2024-02-10",
        description: "Cartuchos de tinta negra para impresora",
        status: "low-stock",
        type: "insumo",
        brand: "HP",
        condition: "nuevo",
        location: "Armario C-1",
      },
      {
        id: "8",
        name: "Multímetro Digital",
        category: "HERRAMIENTA",
        quantity: 6,
        source: "DONACIONES",
        cost: 35.5,
        acquisitionDate: "2024-01-30",
        description: "Multímetro digital con pantalla LCD",
        status: "active",
        type: "herramienta",
        brand: "Fluke",
        condition: "usado",
        location: "Laboratorio Mesa 1",
      },
    ]

    const sampleTransactions: Transaction[] = [
      {
        id: "1",
        itemId: "1",
        itemName: "Calculadora Científica",
        teacherName: "Profesor Martínez",
        quantity: 5,
        type: "loan",
        date: "2024-03-01",
        returnDate: "2024-03-15",
        status: "active",
        notes: "Para clase de álgebra",
      },
      {
        id: "2",
        itemId: "2",
        itemName: "Set de Materiales de Arte",
        teacherName: "Profesora Rodríguez",
        quantity: 2,
        type: "donation",
        date: "2024-02-28",
        status: "active",
        notes: "Para programa de arte terapia",
      },
      {
        id: "3",
        itemId: "4",
        itemName: "Taladro Eléctrico",
        teacherName: "Profesor García",
        quantity: 1,
        type: "loan",
        date: "2024-03-05",
        returnDate: "2024-03-12",
        status: "active",
        notes: "Para proyecto de carpintería",
      },
      {
        id: "4",
        itemId: "1",
        itemName: "Calculadora Científica",
        teacherName: "Profesora López",
        quantity: 3,
        type: "loan",
        date: "2024-02-20",
        returnDate: "2024-02-27",
        status: "returned",
        notes: "Para examen de matemáticas",
      },
      {
        id: "5",
        itemId: "8",
        itemName: "Multímetro Digital",
        teacherName: "Profesor Fernández",
        quantity: 2,
        type: "loan",
        date: "2024-02-15",
        returnDate: "2024-02-22",
        status: "returned",
        notes: "Para práctica de electricidad",
      },
    ]

    const sampleDisposals: Disposal[] = [
      {
        id: "1",
        itemId: "1",
        itemName: "Calculadora Científica",
        quantity: 2,
        reason: "damaged",
        date: "2024-02-15",
        notes: "Pantalla rota, botones no funcionan",
      },
    ]

    setItems(sampleItems)
    setTransactions(sampleTransactions)
    setDisposals(sampleDisposals)
  }

  const addItem = async (item: Omit<Item, "id">) => {
    try {
      setError(null)

      if (useLocalData) {
        const newItem: Item = {
          ...item,
          id: Date.now().toString(),
        }
        setItems((prev) => [newItem, ...prev])
        toast.success("Artículo agregado", {
          description: `${item.name} se agregó correctamente`,
        })
      } else {
        const { addItem: dbAddItem } = await import("@/lib/database")
        const newItem = await dbAddItem(item)
        setItems((prev) => [newItem, ...prev])
        toast.success("Artículo agregado", {
          description: `${item.name} se guardó en la base de datos`,
        })
      }
    } catch (err: any) {
      console.error("Error adding item:", err)
      const errorMessage = err.message || "Error desconocido al agregar el artículo"
      setError(errorMessage)
      toast.error("Error al agregar artículo", {
        description: errorMessage,
      })
    }
  }

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      if (useLocalData) {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
        toast.success("Artículo actualizado")
      } else {
        const { updateItem: dbUpdateItem } = await import("@/lib/database")
        const updatedItem = await dbUpdateItem(id, updates)
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
        toast.success("Artículo actualizado", {
          description: "Los cambios se guardaron en la base de datos",
        })
      }
    } catch (err: any) {
      console.error("Error updating item:", err)
      const errorMessage = err.message || "Error al actualizar el artículo"
      setError(errorMessage)
      toast.error("Error al actualizar artículo", {
        description: errorMessage,
      })
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
  }

  const handleUpdateItem = async (updatedItem: Item) => {
    await updateItem(updatedItem.id, updatedItem)
    setEditingItem(null)
  }

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setError(null)

      if (useLocalData) {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
        }
        setTransactions((prev) => [newTransaction, ...prev])
        toast.success("Transacción registrada")
      } else {
        const { addTransaction: dbAddTransaction } = await import("@/lib/database")
        const newTransaction = await dbAddTransaction(transaction)
        setTransactions((prev) => [newTransaction, ...prev])
        toast.success("Transacción registrada", {
          description: "Se guardó en la base de datos",
        })
      }

      // Update item quantity for loans
      if (transaction.type === "loan") {
        const item = items.find((item) => item.id === transaction.itemId)
        if (item) {
          const newQuantity = item.quantity - transaction.quantity
          let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

          if (newQuantity === 0) newStatus = "out-of-stock"
          else if (newQuantity < settings.lowStockThreshold && item.type === "insumo") newStatus = "low-stock"

          await updateItem(transaction.itemId, {
            quantity: newQuantity,
            status: newStatus,
          })
        }
      }
    } catch (err: any) {
      console.error("Error adding transaction:", err)
      const errorMessage = err.message || "Error desconocido al registrar la transacción"
      setError(errorMessage)
      toast.error("Error al registrar transacción", {
        description: errorMessage,
      })
    }
  }

  const addMultipleTransactions = async (transactions: Omit<Transaction, "id">[]) => {
    try {
      setError(null)

      if (useLocalData) {
        const newTransactions: Transaction[] = transactions.map((transaction, index) => ({
          ...transaction,
          id: (Date.now() + index).toString(),
        }))
        setTransactions((prev) => [...newTransactions, ...prev])
        toast.success("Préstamo múltiple registrado", {
          description: `${transactions.length} herramientas prestadas a ${transactions[0].teacherName}`,
        })
      } else {
        const { addTransaction: dbAddTransaction } = await import("@/lib/database")
        const newTransactions: Transaction[] = []

        for (const transaction of transactions) {
          const newTransaction = await dbAddTransaction(transaction)
          newTransactions.push(newTransaction)
        }

        setTransactions((prev) => [...newTransactions, ...prev])
        toast.success("Préstamo múltiple registrado", {
          description: `${transactions.length} herramientas guardadas en la base de datos`,
        })
      }

      // Update item quantities for all loans
      for (const transaction of transactions) {
        const item = items.find((item) => item.id === transaction.itemId)
        if (item) {
          const newQuantity = item.quantity - transaction.quantity
          let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

          if (newQuantity === 0) newStatus = "out-of-stock"
          else if (newQuantity < settings.lowStockThreshold && item.type === "insumo") newStatus = "low-stock"

          await updateItem(transaction.itemId, {
            quantity: newQuantity,
            status: newStatus,
          })
        }
      }
    } catch (err: any) {
      console.error("Error adding multiple transactions:", err)
      const errorMessage = err.message || "Error desconocido al registrar el préstamo múltiple"
      setError(errorMessage)
      toast.error("Error al registrar préstamo múltiple", {
        description: errorMessage,
      })
    }
  }

  const addDisposal = async (disposal: Omit<Disposal, "id">) => {
    try {
      setError(null)

      if (useLocalData) {
        const newDisposal: Disposal = {
          ...disposal,
          id: Date.now().toString(),
        }
        setDisposals((prev) => [newDisposal, ...prev])
        toast.success("Baja registrada")
      } else {
        const { addDisposal: dbAddDisposal } = await import("@/lib/database")
        const newDisposal = await dbAddDisposal(disposal)
        setDisposals((prev) => [newDisposal, ...prev])
        toast.success("Baja registrada", {
          description: "Se guardó en la base de datos",
        })
      }

      // Update item quantity and status
      const item = items.find((item) => item.id === disposal.itemId)
      if (item) {
        const newQuantity = item.quantity - disposal.quantity
        let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

        if (newQuantity === 0) newStatus = "out-of-stock"
        else if (newQuantity < settings.lowStockThreshold && item.type === "insumo") newStatus = "low-stock"

        await updateItem(disposal.itemId, {
          quantity: newQuantity,
          status: newStatus,
        })
      }
    } catch (err: any) {
      console.error("Error adding disposal:", err)
      const errorMessage = err.message || "Error desconocido al registrar la baja"
      setError(errorMessage)
      toast.error("Error al registrar baja", {
        description: errorMessage,
      })
    }
  }

  const handleEditDisposal = (disposal: Disposal) => {
    setEditingDisposal(disposal)
  }

  const handleUpdateDisposal = async (updatedDisposal: Disposal, originalQuantity: number) => {
    try {
      // Actualizar el artículo si la cantidad cambió
      if (updatedDisposal.quantity !== originalQuantity) {
        const item = items.find((item) => item.id === updatedDisposal.itemId)
        if (item) {
          // Devolver la cantidad original al inventario
          const quantityAfterReturn = item.quantity + originalQuantity

          // Luego restar la nueva cantidad
          const newQuantity = quantityAfterReturn - updatedDisposal.quantity

          let newStatus: "active" | "low-stock" | "out-of-stock" = "active"
          if (newQuantity === 0) newStatus = "out-of-stock"
          else if (newQuantity < settings.lowStockThreshold && item.type === "insumo") newStatus = "low-stock"

          await updateItem(updatedDisposal.itemId, {
            quantity: newQuantity,
            status: newStatus,
          })
        }
      }

      // Actualizar la baja
      if (useLocalData) {
        setDisposals((prev) =>
          prev.map((disposal) => (disposal.id === updatedDisposal.id ? updatedDisposal : disposal)),
        )
        toast.success("Baja actualizada")
      } else {
        const { updateDisposal: dbUpdateDisposal } = await import("@/lib/database")
        await dbUpdateDisposal(updatedDisposal.id, updatedDisposal)
        setDisposals((prev) =>
          prev.map((disposal) => (disposal.id === updatedDisposal.id ? updatedDisposal : disposal)),
        )
        toast.success("Baja actualizada", {
          description: "Los cambios se guardaron en la base de datos",
        })
      }

      setEditingDisposal(null)
    } catch (err: any) {
      console.error("Error updating disposal:", err)
      const errorMessage = err.message || "Error al actualizar la baja"
      setError(errorMessage)
      toast.error("Error al actualizar baja", {
        description: errorMessage,
      })
    }
  }

  const updateSettings = async (newSettings: AppSettings) => {
    try {
      console.log("Updating settings:", newSettings)

      if (useLocalData) {
        setSettings(newSettings)
        console.log("Settings updated locally")
        toast.success("Configuración guardada localmente")
      } else {
        const { updateSettings: dbUpdateSettings } = await import("@/lib/database")
        await dbUpdateSettings(newSettings)
        console.log("Settings updated in database")

        // Actualizar el estado local después de guardar en la base de datos
        setSettings(newSettings)
        toast.success("Configuración guardada", {
          description: "Los cambios se guardaron en la base de datos",
        })
      }

      // Recalculate item statuses based on new threshold (only for supplies)
      const updatedItems = items.map((item) => {
        let newStatus: "active" | "low-stock" | "out-of-stock" = "active"
        if (item.quantity === 0) newStatus = "out-of-stock"
        else if (item.quantity < newSettings.lowStockThreshold && item.type === "insumo") newStatus = "low-stock"

        if (newStatus !== item.status) {
          updateItem(item.id, { status: newStatus })
        }

        return { ...item, status: newStatus }
      })

      setItems(updatedItems)

      // Limpiar cualquier error previo
      setError(null)
    } catch (err: any) {
      console.error("Error updating settings:", err)
      const errorMessage = err.message || "Error desconocido al actualizar la configuración"
      setError(errorMessage)
      toast.error("Error al guardar configuración", {
        description: errorMessage,
      })
      throw new Error(errorMessage)
    }
  }

  const markTransactionReturned = async (transactionId: string) => {
    try {
      const transaction = transactions.find((t) => t.id === transactionId)
      if (!transaction) return

      if (useLocalData) {
        setTransactions((prev) =>
          prev.map((t) => {
            if (t.id === transactionId) {
              // Devolver la cantidad al inventario
              const item = items.find((item) => item.id === t.itemId)
              if (item) {
                const newQuantity = item.quantity + t.quantity
                let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

                if (newQuantity === 0) newStatus = "out-of-stock"
                else if (newQuantity < settings.lowStockThreshold && item.type === "insumo") newStatus = "low-stock"

                updateItem(t.itemId, {
                  quantity: newQuantity,
                  status: newStatus,
                })
              }

              return { ...t, status: "returned" as const }
            }
            return t
          }),
        )
        toast.success("Préstamo marcado como devuelto")
      } else {
        const { updateTransaction: dbUpdateTransaction } = await import("@/lib/database")
        await dbUpdateTransaction(transactionId, { status: "returned" })

        setTransactions((prev) =>
          prev.map((t) => {
            if (t.id === transactionId) {
              // Devolver la cantidad al inventario
              const item = items.find((item) => item.id === t.itemId)
              if (item) {
                const newQuantity = item.quantity + t.quantity
                let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

                if (newQuantity === 0) newStatus = "out-of-stock"
                else if (newQuantity < settings.lowStockThreshold && item.type === "insumo") newStatus = "low-stock"

                updateItem(t.itemId, {
                  quantity: newQuantity,
                  status: newStatus,
                })
              }

              return { ...t, status: "returned" as const }
            }
            return t
          }),
        )
        toast.success("Préstamo marcado como devuelto", {
          description: "Se actualizó en la base de datos",
        })
      }
    } catch (err: any) {
      console.error("Error marking transaction as returned:", err)
      const errorMessage = err.message || "Error al marcar como devuelto"
      setError(errorMessage)
      toast.error("Error al marcar como devuelto", {
        description: errorMessage,
      })
    }
  }

  const extendLoan = async (transactionId: string, newReturnDate: string) => {
    try {
      if (useLocalData) {
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === transactionId ? { ...transaction, returnDate: newReturnDate } : transaction,
          ),
        )
        toast.success("Préstamo extendido")
      } else {
        const { updateTransaction: dbUpdateTransaction } = await import("@/lib/database")
        await dbUpdateTransaction(transactionId, { returnDate: newReturnDate })

        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === transactionId ? { ...transaction, returnDate: newReturnDate } : transaction,
          ),
        )
        toast.success("Préstamo extendido", {
          description: "Se actualizó en la base de datos",
        })
      }
    } catch (err: any) {
      console.error("Error extending loan:", err)
      const errorMessage = err.message || "Error al extender el préstamo"
      setError(errorMessage)
      toast.error("Error al extender préstamo", {
        description: errorMessage,
      })
    }
  }

  const updateTransactionReturnDate = async (transactionId: string, newReturnDate: string) => {
    try {
      if (useLocalData) {
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === transactionId ? { ...transaction, returnDate: newReturnDate } : transaction,
          ),
        )
        toast.success("Fecha de devolución actualizada")
      } else {
        const { updateTransaction: dbUpdateTransaction } = await import("@/lib/database")
        await dbUpdateTransaction(transactionId, { returnDate: newReturnDate })

        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === transactionId ? { ...transaction, returnDate: newReturnDate } : transaction,
          ),
        )
        toast.success("Fecha de devolución actualizada", {
          description: "Se actualizó en la base de datos",
        })
      }
    } catch (err: any) {
      console.error("Error updating return date:", err)
      const errorMessage = err.message || "Error al actualizar la fecha de devolución"
      setError(errorMessage)
      toast.error("Error al actualizar fecha", {
        description: errorMessage,
      })
    }
  }

  // Calcular estadísticas separadas
  const tools = items.filter((item) => item.type === "herramienta")
  const supplies = items.filter((item) => item.type === "insumo")

  const totalTools = tools.reduce((sum, item) => sum + item.quantity, 0)
  const totalSupplies = supplies.reduce((sum, item) => sum + item.quantity, 0)
  const totalItems = totalTools + totalSupplies

  const toolsValue = tools.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
  const suppliesValue = supplies.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
  const totalValue = toolsValue + suppliesValue

  const activeLoans = transactions.filter((t) => t.status === "active" && t.type === "loan").length
  const lowStockSupplies = supplies.filter(
    (item) => item.quantity < settings.lowStockThreshold && item.quantity > 0,
  ).length

  // Función para obtener cantidad prestada de un artículo
  const getLoanedQuantity = (itemId: string) => {
    return transactions
      .filter((t) => t.itemId === itemId && t.type === "loan" && t.status === "active")
      .reduce((sum, t) => sum + t.quantity, 0)
  }

  // Función para obtener cantidad en pañol (total - prestada)
  const getAvailableQuantity = (item: Item) => {
    const loanedQuantity = getLoanedQuantity(item.id)
    return item.quantity - loanedQuantity
  }

  // Calcular cantidades con colores para el dashboard
  const toolsInStock = tools.reduce((sum, item) => sum + getAvailableQuantity(item), 0)
  const toolsLoaned = tools.reduce((sum, item) => sum + getLoanedQuantity(item.id), 0)
  const suppliesInStock = supplies.reduce((sum, item) => sum + getAvailableQuantity(item), 0)
  const suppliesLoaned = supplies.reduce((sum, item) => sum + getLoanedQuantity(item.id), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Cargando Sistema de Inventario</h2>
          <p className="text-slate-600">Verificando conexión con la base de datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sistema de Inventario del pañol del CFP 413{" "}
          </h1>
          <p className="text-slate-600">Gestiona herramientas y suministros de manera eficiente</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              {databaseConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Conectado a Supabase</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <WifiOff className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">Modo Local (Sin Base de Datos)</span>
                </>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}
          </div>

          {/* Mostrar información sobre el estado de la conexión */}
          {useLocalData && (
            <div className="mt-4 space-y-2">
              <Alert className="border-orange-200 bg-orange-50">
                <Database className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Funcionando con datos de ejemplo.</strong> Para usar la base de datos, configura las variables
                  de entorno de Supabase.
                </AlertDescription>
              </Alert>

              {connectionError && connectionError.includes("tablas") && (
                <Alert className="border-blue-200 bg-blue-50">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Base de datos detectada pero faltan tablas.</strong>
                    <br />
                    Ejecuta los scripts SQL en la carpeta <code className="bg-blue-100 px-1 rounded">scripts/</code>{" "}
                    para crear las tablas necesarias.
                    <br />
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 underline"
                      onClick={() => {
                        // Mostrar información sobre cómo ejecutar los scripts
                        toast.info("Scripts SQL disponibles", {
                          description:
                            "Revisa la carpeta 'scripts/' para encontrar create-tables.sql e insert-sample-data.sql",
                        })
                      }}
                    >
                      Ver scripts disponibles
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-8 min-w-[800px] bg-white border border-slate-200 shadow-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Panel
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Wrench className="h-4 w-4 mr-2" />
                Herramientas
              </TabsTrigger>
              <TabsTrigger value="supplies" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Package2 className="h-4 w-4 mr-2" />
                Insumos
              </TabsTrigger>
              <TabsTrigger value="items" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Préstamos
              </TabsTrigger>
              <TabsTrigger value="disposals" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Bajas
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Reportes
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Config
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Total Herramientas</CardTitle>
                  <Wrench className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{totalTools}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200">
                      {toolsInStock} en pañol
                    </div>
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs border border-red-200">
                      {toolsLoaned} prestadas
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Total Insumos</CardTitle>
                  <Package2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{totalSupplies}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs border border-green-200">
                      {suppliesInStock} en pañol
                    </div>
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs border border-red-200">
                      {suppliesLoaned} prestadas
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Préstamos Activos</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{activeLoans}</div>
                  <p className="text-xs text-slate-600">Artículos prestados actualmente</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Insumos Stock Bajo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">{lowStockSupplies}</div>
                  <p className="text-xs text-slate-600">Insumos con menos de {settings.lowStockThreshold} unidades</p>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas de Valor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Valor Herramientas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">${toolsValue.toFixed(2)}</div>
                  <p className="text-xs text-slate-600">Valor total de herramientas</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Valor Insumos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">${suppliesValue.toFixed(2)}</div>
                  <p className="text-xs text-slate-600">Valor total de insumos</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-teal-50 to-teal-100 border-l-4 border-l-teal-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700">Valor Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">${totalValue.toFixed(2)}</div>
                  <p className="text-xs text-slate-600">Valor total del inventario</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-slate-200 shadow-md">
                <CardHeader className="bg-slate-50/50">
                  <CardTitle className="text-slate-800">Transacciones Recientes</CardTitle>
                  <CardDescription className="text-slate-600">Últimos préstamos y donaciones</CardDescription>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-medium text-sm text-slate-800">{transaction.itemName}</p>
                          <p className="text-xs text-slate-600">
                            {transaction.teacherName} • {transaction.quantity} unidades
                          </p>
                        </div>
                        <Badge
                          variant={transaction.type === "loan" ? "default" : "secondary"}
                          className={
                            transaction.type === "loan"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-green-100 text-green-800 border-green-300"
                          }
                        >
                          {transaction.type === "loan" ? "préstamo" : "donación"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-md">
                <CardHeader className="bg-slate-50/50">
                  <CardTitle className="text-slate-800">Insumos con Stock Bajo</CardTitle>
                  <CardDescription className="text-slate-600">Insumos que necesitan reposición</CardDescription>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="space-y-3">
                    {supplies
                      .filter((item) => item.quantity < settings.lowStockThreshold && item.quantity > 0)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-red-50">
                          <div>
                            <p className="font-medium text-sm text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-600">{item.category}</p>
                          </div>
                          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 animate-pulse">
                            {item.quantity} restantes
                          </Badge>
                        </div>
                      ))}
                    {supplies.filter((item) => item.quantity < settings.lowStockThreshold && item.quantity > 0)
                      .length === 0 && <p className="text-center text-slate-500 py-4">No hay insumos con stock bajo</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <ToolsList
              items={tools}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUpdateItem={updateItem}
              onEditItem={handleEditItem}
              onViewHistory={setSelectedToolForHistory}
              transactions={transactions}
              settings={settings}
              onAddItem={addItem}
              getLoanedQuantity={getLoanedQuantity}
              getAvailableQuantity={getAvailableQuantity}
            />
          </TabsContent>

          <TabsContent value="supplies" className="space-y-4">
            <SuppliesList
              items={supplies}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUpdateItem={updateItem}
              onEditItem={handleEditItem}
              transactions={transactions}
              lowStockThreshold={settings.lowStockThreshold}
              settings={settings}
              onAddItem={addItem}
              getLoanedQuantity={getLoanedQuantity}
              getAvailableQuantity={getAvailableQuantity}
            />
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <ItemsList
              items={items}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUpdateItem={updateItem}
              onEditItem={handleEditItem}
              transactions={transactions}
              lowStockThreshold={settings.lowStockThreshold}
              settings={settings}
              onAddItem={addItem}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Préstamos y Donaciones</h2>
              <div className="flex gap-2">
                <AddTransactionForm
                  key={`transaction-form-${settings.teachers.length}`}
                  items={items}
                  onAddTransaction={addTransaction}
                  settings={settings}
                />
                <AddMultipleTransactionForm
                  items={items}
                  onAddTransactions={addMultipleTransactions}
                  settings={settings}
                  getLoanedQuantity={getLoanedQuantity}
                  getAvailableQuantity={getAvailableQuantity}
                />
              </div>
            </div>
            <TransactionsList
              transactions={transactions}
              onMarkReturned={markTransactionReturned}
              onExtendLoan={extendLoan}
              onUpdateReturnDate={updateTransactionReturnDate}
            />
          </TabsContent>

          <TabsContent value="disposals" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Bajas de Artículos</h2>
              <AddDisposalForm items={items} onAddDisposal={addDisposal} />
            </div>
            <DisposalsList disposals={disposals} onEditDisposal={handleEditDisposal} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsSection items={items} transactions={transactions} disposals={disposals} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsPanel settings={settings} onUpdateSettings={updateSettings} />
          </TabsContent>
        </Tabs>

        {/* Edit Item Modal */}
        {editingItem && (
          <EditItemForm
            item={editingItem}
            settings={settings}
            onUpdateItem={handleUpdateItem}
            onClose={() => setEditingItem(null)}
          />
        )}

        {/* Edit Disposal Modal */}
        {editingDisposal && (
          <EditDisposalForm
            disposal={editingDisposal}
            items={items}
            onUpdateDisposal={handleUpdateDisposal}
            onClose={() => setEditingDisposal(null)}
          />
        )}

        {/* Tool History Modal */}
        <ToolHistoryModal
          item={selectedToolForHistory}
          transactions={transactions}
          isOpen={!!selectedToolForHistory}
          onClose={() => setSelectedToolForHistory(null)}
        />

        {/* Add Item Form */}
        <AddItemForm onAddItem={addItem} settings={settings} />
      </div>
    </div>
  )
}
