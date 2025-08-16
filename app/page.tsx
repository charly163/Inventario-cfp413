"use client"

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Package,
  Wrench,
  Package2,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  User,
  Clock,
  XCircle,
  Settings,
  FileText,
  DollarSign,
} from "lucide-react"
import { parseISO, isAfter } from "date-fns"

// Importar componentes
import ItemsList from "@/components/items-list"
import ToolsList from "@/components/tools-list"
import SuppliesList from "@/components/supplies-list"
import TransactionsList from "@/components/transactions-list"
import AddTransactionForm from "@/components/add-transaction-form"
import AddMultipleTransactionForm from "@/components/add-multiple-transaction-form"
import EditItemForm from "@/components/edit-item-form"
import DisposalsList from "@/components/disposals-list"
import AddDisposalForm from "@/components/add-disposal-form"
import EditDisposalForm from "@/components/edit-disposal-form"
import ReportsSection from "@/components/reports-section"
import SettingsPanel from "@/components/settings-panel"
import ToolHistoryModal from "@/components/tool-history-modal"

// Tipos de datos
export interface Item {
  id: string
  name: string
  description?: string
  category: string
  type: "herramienta" | "insumo"
  quantity: number
  brand?: string
  condition: "nuevo" | "usado" | "regular" | "malo"
  location?: string
  cost?: number
  acquisitionDate: string
  source: string
  status: "active" | "low-stock" | "out-of-stock"
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  itemId: string
  itemName: string
  type: "loan" | "donation"
  quantity: number
  teacherName: string
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

export default function InventorySystem() {
  // Estados principales
  const [items, setItems] = useState<Item[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [disposals, setDisposals] = useState<Disposal[]>([])
  const [settings, setSettings] = useState<AppSettings>({
    lowStockThreshold: 5,
    categories: [
      "HERRAMIENTAS MANUALES",
      "HERRAMIENTAS ELÉCTRICAS",
      "EQUIPOS DE MEDICIÓN",
      "MATERIALES DE CONSTRUCCIÓN",
      "INSUMOS DE OFICINA",
      "EQUIPOS DE SEGURIDAD",
      "OTROS",
    ],
    sources: ["COMPRA", "DONACIÓN", "TRANSFERENCIA", "OTROS"],
    teachers: [
      "Prof. Juan Pérez",
      "Prof. María González",
      "Prof. Carlos López",
      "Prof. Ana Martínez",
      "Prof. Luis Rodríguez",
    ],
    locations: ["Estante A-1", "Estante A-2", "Cajón B-1", "Cajón B-2", "Depósito C-1", "Armario D-1"],
  })

  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para modales
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddMultipleTransaction, setShowAddMultipleTransaction] = useState(false)
  const [showAddDisposal, setShowAddDisposal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editingDisposal, setEditingDisposal] = useState<Disposal | null>(null)
  const [viewingHistory, setViewingHistory] = useState<Item | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      // Datos de ejemplo para demostración
      const sampleItems: Item[] = [
        {
          id: "1",
          name: "Taladro Eléctrico Bosch",
          description: "Taladro percutor 650W con maletín y brocas",
          category: "HERRAMIENTAS ELÉCTRICAS",
          type: "herramienta",
          quantity: 3,
          brand: "Bosch",
          condition: "usado",
          location: "Estante A-1",
          cost: 15000,
          acquisitionDate: "2024-01-15",
          source: "COMPRA",
          status: "active",
          createdAt: "2024-01-15",
          updatedAt: "2024-01-15",
        },
        {
          id: "2",
          name: "Destornilladores Phillips",
          description: "Set de 6 destornilladores Phillips de diferentes tamaños",
          category: "HERRAMIENTAS MANUALES",
          type: "herramienta",
          quantity: 2,
          brand: "Stanley",
          condition: "nuevo",
          location: "Cajón B-1",
          cost: 2500,
          acquisitionDate: "2024-01-10",
          source: "COMPRA",
          status: "active",
          createdAt: "2024-01-10",
          updatedAt: "2024-01-20",
        },
        {
          id: "3",
          name: "Papel A4",
          description: "Resma de papel A4 75g - 500 hojas",
          category: "INSUMOS DE OFICINA",
          type: "insumo",
          quantity: 50,
          brand: "Ledesma",
          condition: "nuevo",
          location: "Depósito C-1",
          cost: 800,
          acquisitionDate: "2024-01-05",
          source: "COMPRA",
          status: "active",
          createdAt: "2024-01-05",
          updatedAt: "2024-01-05",
        },
        {
          id: "4",
          name: "Casco de Seguridad",
          description: "Casco blanco con barbijo ajustable",
          category: "EQUIPOS DE SEGURIDAD",
          type: "herramienta",
          quantity: 1,
          brand: "3M",
          condition: "usado",
          location: "Armario D-1",
          cost: 3500,
          acquisitionDate: "2024-01-12",
          source: "DONACIÓN",
          status: "low-stock",
          createdAt: "2024-01-12",
          updatedAt: "2024-01-12",
        },
        {
          id: "5",
          name: "Soldadora Eléctrica",
          description: "Soldadora eléctrica 200A con accesorios",
          category: "HERRAMIENTAS ELÉCTRICAS",
          type: "herramienta",
          quantity: 1,
          brand: "Lincoln",
          condition: "regular",
          location: "Estante A-2",
          cost: 45000,
          acquisitionDate: "2023-12-20",
          source: "COMPRA",
          status: "active",
          createdAt: "2023-12-20",
          updatedAt: "2023-12-20",
        },
        {
          id: "6",
          name: "Tornillos Autorroscantes",
          description: "Caja de 100 tornillos autorroscantes 4x40mm",
          category: "MATERIALES DE CONSTRUCCIÓN",
          type: "insumo",
          quantity: 3,
          brand: "Fiero",
          condition: "nuevo",
          location: "Cajón B-2",
          cost: 1200,
          acquisitionDate: "2024-01-08",
          source: "COMPRA",
          status: "low-stock",
          createdAt: "2024-01-08",
          updatedAt: "2024-01-08",
        },
      ]

      const sampleTransactions: Transaction[] = [
        {
          id: "1",
          itemId: "2",
          itemName: "Destornilladores Phillips",
          type: "loan",
          quantity: 1,
          teacherName: "Prof. Juan Pérez",
          date: "2024-01-20",
          returnDate: "2024-01-27",
          status: "active",
          notes: "Para reparación en aula 3",
        },
        {
          id: "2",
          itemId: "3",
          itemName: "Papel A4",
          type: "donation",
          quantity: 5,
          teacherName: "Prof. María González",
          date: "2024-01-18",
          status: "returned",
          notes: "Para impresiones del taller",
        },
      ]

      const sampleDisposals: Disposal[] = [
        {
          id: "1",
          itemId: "old-drill",
          itemName: "Taladro Viejo Black & Decker",
          quantity: 1,
          reason: "damaged",
          date: "2024-01-10",
          notes: "Motor quemado, irreparable",
        },
      ]

      setItems(sampleItems)
      setTransactions(sampleTransactions)
      setDisposals(sampleDisposals)

      // Actualizar estados de items basado en cantidad y umbral
      updateItemStatuses(sampleItems)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estados de items
  const updateItemStatuses = (itemsToUpdate: Item[]) => {
    const updatedItems = itemsToUpdate.map((item) => {
      let status: "active" | "low-stock" | "out-of-stock" = "active"

      if (item.quantity === 0) {
        status = "out-of-stock"
      } else if (item.type === "insumo" && item.quantity < settings.lowStockThreshold) {
        status = "low-stock"
      }

      return { ...item, status }
    })

    setItems(updatedItems)
  }

  // Funciones para manejar transacciones
  const getLoanedQuantity = (itemId: string): number => {
    return transactions
      .filter((t) => t.itemId === itemId && t.status === "active" && t.type === "loan")
      .reduce((sum, t) => sum + t.quantity, 0)
  }

  const getAvailableQuantity = (item: Item): number => {
    const loanedQuantity = getLoanedQuantity(item.id)
    return Math.max(0, item.quantity - loanedQuantity)
  }

  // Manejar formularios
  const handleAddItem = async (itemData: Omit<Item, "id">) => {
    try {
      const newItem: Item = {
        ...itemData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }

      const updatedItems = [...items, newItem]
      setItems(updatedItems)
      updateItemStatuses(updatedItems)

      toast.success("Artículo agregado correctamente")
    } catch (error) {
      console.error("Error adding item:", error)
      toast.error("No se pudo agregar el artículo")
    }
  }

  const handleUpdateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : item,
      )
      setItems(updatedItems)
      updateItemStatuses(updatedItems)
      toast.success("Artículo actualizado correctamente")
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("No se pudo actualizar el artículo")
    }
  }

  const handleAddTransaction = async (transactionData: Omit<Transaction, "id">) => {
    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
      }

      setTransactions([...transactions, newTransaction])

      // Si es una donación, reducir la cantidad del item
      if (transactionData.type === "donation") {
        const item = items.find((i) => i.id === transactionData.itemId)
        if (item) {
          const updatedItems = items.map((i) =>
            i.id === transactionData.itemId
              ? { ...i, quantity: Math.max(0, i.quantity - transactionData.quantity) }
              : i,
          )
          setItems(updatedItems)
          updateItemStatuses(updatedItems)
        }
      }

      toast.success(
        transactionData.type === "loan" ? "Préstamo registrado correctamente" : "Donación registrada correctamente",
      )
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast.error("No se pudo registrar la transacción")
    }
  }

  const handleMarkReturned = async (transactionId: string) => {
    try {
      const updatedTransactions = transactions.map((t) =>
        t.id === transactionId
          ? { ...t, status: "returned" as const, returnDate: new Date().toISOString().split("T")[0] }
          : t,
      )
      setTransactions(updatedTransactions)
      toast.success("Devolución registrada correctamente")
    } catch (error) {
      console.error("Error marking as returned:", error)
      toast.error("No se pudo registrar la devolución")
    }
  }

  const handleExtendLoan = async (transactionId: string, newReturnDate: string) => {
    try {
      const updatedTransactions = transactions.map((t) =>
        t.id === transactionId ? { ...t, returnDate: newReturnDate } : t,
      )
      setTransactions(updatedTransactions)
      toast.success("Fecha de devolución actualizada")
    } catch (error) {
      console.error("Error extending loan:", error)
      toast.error("No se pudo actualizar la fecha")
    }
  }

  const handleUpdateReturnDate = async (transactionId: string, newReturnDate: string) => {
    try {
      const updatedTransactions = transactions.map((t) =>
        t.id === transactionId ? { ...t, returnDate: newReturnDate } : t,
      )
      setTransactions(updatedTransactions)
      toast.success("Fecha de devolución actualizada")
    } catch (error) {
      console.error("Error updating return date:", error)
      toast.error("No se pudo actualizar la fecha")
    }
  }

  const handleAddDisposal = async (disposalData: Omit<Disposal, "id">) => {
    try {
      const newDisposal: Disposal = {
        ...disposalData,
        id: Date.now().toString(),
      }

      setDisposals([...disposals, newDisposal])

      // Reducir la cantidad del item
      const updatedItems = items.map((item) =>
        item.id === disposalData.itemId
          ? { ...item, quantity: Math.max(0, item.quantity - disposalData.quantity) }
          : item,
      )
      setItems(updatedItems)
      updateItemStatuses(updatedItems)

      toast.success("Baja registrada correctamente")
    } catch (error) {
      console.error("Error adding disposal:", error)
      toast.error("No se pudo registrar la baja")
    }
  }

  const handleUpdateDisposal = async (id: string, updates: Partial<Disposal>) => {
    try {
      const updatedDisposals = disposals.map((disposal) =>
        disposal.id === id ? { ...disposal, ...updates } : disposal,
      )
      setDisposals(updatedDisposals)
      toast.success("Baja actualizada correctamente")
    } catch (error) {
      console.error("Error updating disposal:", error)
      toast.error("No se pudo actualizar la baja")
    }
  }

  const handleDeleteDisposal = async (id: string) => {
    try {
      const disposal = disposals.find((d) => d.id === id)
      if (!disposal) return

      // Restaurar la cantidad al item si existe
      const item = items.find((i) => i.id === disposal.itemId)
      if (item) {
        const updatedItems = items.map((i) =>
          i.id === disposal.itemId ? { ...i, quantity: i.quantity + disposal.quantity } : i,
        )
        setItems(updatedItems)
        updateItemStatuses(updatedItems)
      }

      setDisposals(disposals.filter((d) => d.id !== id))
      toast.success("Baja eliminada correctamente")
    } catch (error) {
      console.error("Error deleting disposal:", error)
      toast.error("No se pudo eliminar la baja")
    }
  }

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      setSettings(newSettings)
      updateItemStatuses(items)
      toast.success("Configuración actualizada correctamente")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("No se pudo actualizar la configuración")
    }
  }

  // Filtrar items por tipo
  const allItems = items
  const tools = items.filter((item) => item.type === "herramienta")
  const supplies = items.filter((item) => item.type === "insumo")

  // Calcular métricas
  const stats = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalTools = tools.reduce((sum, item) => sum + item.quantity, 0)
    const totalSupplies = supplies.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)

    const activeLoans = transactions.filter((t) => t.status === "active" && t.type === "loan").length
    const totalDonations = transactions.filter((t) => t.type === "donation").length

    const lowStockItems = items.filter((item) => item.status === "low-stock").length
    const outOfStockItems = items.filter((item) => item.status === "out-of-stock").length

    const overdueLoans = transactions.filter((t) => {
      if (t.status !== "active" || !t.returnDate) return false
      return isAfter(new Date(), parseISO(t.returnDate))
    }).length

    return {
      totalItems,
      totalTools,
      totalSupplies,
      totalValue,
      activeLoans,
      totalDonations,
      lowStockItems,
      outOfStockItems,
      overdueLoans,
    }
  }, [items, transactions, tools, supplies])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Inventario - CFP 413</h1>
          <p className="text-gray-600">Gestión de herramientas e insumos del pañol</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Versión 36</span> - Sistema actualizado
          </div>
        </div>

        {/* Métricas Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTools} herramientas, {stats.totalSupplies} insumos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Inventario completo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLoans}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overdueLoans > 0 && <span className="text-red-600">{stats.overdueLoans} vencidos</span>}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockItems + stats.outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Stock bajo/agotado</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {(stats.lowStockItems > 0 || stats.outOfStockItems > 0 || stats.overdueLoans > 0) && (
          <div className="mb-6 space-y-2">
            {stats.lowStockItems > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-orange-800 font-medium">{stats.lowStockItems} artículo(s) con stock bajo</span>
                </div>
              </div>
            )}
            {stats.outOfStockItems > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">{stats.outOfStockItems} artículo(s) sin stock</span>
                </div>
              </div>
            )}
            {stats.overdueLoans > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">{stats.overdueLoans} préstamo(s) vencido(s)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controles principales */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Préstamo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Préstamo Individual</DialogTitle>
                <DialogDescription>Registra el préstamo de un artículo específico</DialogDescription>
              </DialogHeader>
              <AddTransactionForm
                items={items.filter((item) => getAvailableQuantity(item) > 0)}
                teachers={settings.teachers}
                onAddTransaction={handleAddTransaction}
                onClose={() => setShowAddTransaction(false)}
                getAvailableQuantity={getAvailableQuantity}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showAddMultipleTransaction} onOpenChange={setShowAddMultipleTransaction}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Préstamo Múltiple
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Registrar Préstamo Múltiple</DialogTitle>
                <DialogDescription>Registra el préstamo de múltiples artículos a la vez</DialogDescription>
              </DialogHeader>
              <AddMultipleTransactionForm
                items={items.filter((item) => getAvailableQuantity(item) > 0)}
                teachers={settings.teachers}
                onAddTransactions={(transactionsData) => {
                  transactionsData.forEach((transactionData) => {
                    handleAddTransaction(transactionData)
                  })
                }}
                onClose={() => setShowAddMultipleTransaction(false)}
                getAvailableQuantity={getAvailableQuantity}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDisposal} onOpenChange={setShowAddDisposal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Registrar Baja
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Baja de Artículo</DialogTitle>
                <DialogDescription>Registra la baja de artículos dañados, vencidos o en desuso</DialogDescription>
              </DialogHeader>
              <AddDisposalForm
                items={items.filter((item) => item.quantity > 0)}
                onAddDisposal={handleAddDisposal}
                onClose={() => setShowAddDisposal(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Contenido Principal con Pestañas */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Todos ({allItems.length})
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Herramientas ({tools.length})
            </TabsTrigger>
            <TabsTrigger value="supplies" className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              Insumos ({supplies.length})
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Préstamos ({stats.activeLoans})
            </TabsTrigger>
            <TabsTrigger value="disposals" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Bajas ({disposals.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Todos los Artículos */}
          <TabsContent value="all">
            <ItemsList
              items={allItems}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUpdateItem={handleUpdateItem}
              onEditItem={setEditingItem}
              transactions={transactions}
              lowStockThreshold={settings.lowStockThreshold}
              settings={settings}
              onAddItem={handleAddItem}
            />
          </TabsContent>

          {/* Pestaña Herramientas */}
          <TabsContent value="tools">
            <ToolsList
              items={tools}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUpdateItem={handleUpdateItem}
              onEditItem={setEditingItem}
              onViewHistory={setViewingHistory}
              transactions={transactions}
              settings={settings}
              onAddItem={handleAddItem}
              getLoanedQuantity={getLoanedQuantity}
              getAvailableQuantity={getAvailableQuantity}
            />
          </TabsContent>

          {/* Pestaña Insumos */}
          <TabsContent value="supplies">
            <SuppliesList
              items={supplies}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUpdateItem={handleUpdateItem}
              onEditItem={setEditingItem}
              transactions={transactions}
              lowStockThreshold={settings.lowStockThreshold}
              settings={settings}
              onAddItem={handleAddItem}
              getLoanedQuantity={getLoanedQuantity}
              getAvailableQuantity={getAvailableQuantity}
            />
          </TabsContent>

          {/* Pestaña Préstamos */}
          <TabsContent value="loans">
            <TransactionsList
              transactions={transactions}
              onMarkReturned={handleMarkReturned}
              onExtendLoan={handleExtendLoan}
              onUpdateReturnDate={handleUpdateReturnDate}
            />
          </TabsContent>

          {/* Pestaña Bajas */}
          <TabsContent value="disposals">
            <DisposalsList
              disposals={disposals}
              onEditDisposal={setEditingDisposal}
              onDeleteDisposal={handleDeleteDisposal}
            />
          </TabsContent>

          {/* Pestaña Reportes */}
          <TabsContent value="reports">
            <ReportsSection items={items} transactions={transactions} disposals={disposals} />
          </TabsContent>
        </Tabs>

        {/* Botón de Configuración Flotante */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
              size="icon"
              title="Configuración"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configuración del Sistema</DialogTitle>
              <DialogDescription>Personaliza las opciones del sistema de inventario</DialogDescription>
            </DialogHeader>
            <SettingsPanel settings={settings} onUpdateSettings={handleUpdateSettings} />
          </DialogContent>
        </Dialog>

        {/* Modales de Edición */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Artículo</DialogTitle>
                <DialogDescription>Modifica la información del artículo</DialogDescription>
              </DialogHeader>
              <EditItemForm
                item={editingItem}
                settings={settings}
                onUpdateItem={handleUpdateItem}
                onClose={() => setEditingItem(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {editingDisposal && (
          <Dialog open={!!editingDisposal} onOpenChange={() => setEditingDisposal(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Baja</DialogTitle>
                <DialogDescription>Modifica la información de la baja</DialogDescription>
              </DialogHeader>
              <EditDisposalForm
                disposal={editingDisposal}
                onUpdateDisposal={handleUpdateDisposal}
                onClose={() => setEditingDisposal(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {viewingHistory && (
          <Dialog open={!!viewingHistory} onOpenChange={() => setViewingHistory(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Historial de {viewingHistory.name}</DialogTitle>
                <DialogDescription>Historial completo de transacciones y movimientos</DialogDescription>
              </DialogHeader>
              <ToolHistoryModal
                item={viewingHistory}
                transactions={transactions.filter((t) => t.itemId === viewingHistory.id)}
                disposals={disposals.filter((d) => d.itemId === viewingHistory.id)}
                onClose={() => setViewingHistory(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
