"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  SettingsIcon,
  BarChart3,
  Users,
  AlertTriangle,
  Wrench,
} from "lucide-react"

// Tipos de datos
export interface Item {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  location: string
  description: string
  status: "disponible" | "prestado" | "mantenimiento" | "baja"
  addedDate: string
  lastUpdated: string
  type: "herramienta" | "insumo"
  brand?: string
  condition?: string
  image_url?: string
  source?: string
  cost?: number
  acquisition_date?: string
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id: string
  item_id: string
  item_name: string
  itemId: string
  itemName: string
  type: "prestamo" | "devolucion" | "entrada" | "salida"
  quantity: number
  teacher_id?: string
  teacher_name?: string
  borrower?: string
  date: string
  return_date?: string
  dueDate?: string
  notes: string | null
  status: "activo" | "completado" | "vencido" | "pendiente"
  created_at: string
  updated_at: string
}

export interface Disposal {
  id: string
  itemId: string
  itemName: string
  reason: string
  quantity: number
  date: string
  notes?: string
  status: "pendiente" | "aprobada" | "rechazada"
}

export interface AppSettings {
  categories: string[]
  locations: string[]
  sources: string[]
  lowStockThreshold: number
  defaultLoanDays: number
  notifications: boolean
  autoBackup: boolean
  currency: string
  language: string
}

// Datos iniciales
const initialItems: Item[] = [
  {
    id: "1",
    name: "Taladro Eléctrico Bosch",
    category: "Herramientas Eléctricas",
    quantity: 3,
    minStock: 1,
    location: "Taller Principal",
    description: "Taladro eléctrico profesional 750W con set de brocas",
    status: "disponible",
    addedDate: "2024-01-15",
    lastUpdated: "2024-01-15",
    type: "herramienta",
  },
  {
    id: "2",
    name: "Martillo de Carpintero",
    category: "Herramientas Manuales",
    quantity: 5,
    minStock: 2,
    location: "Taller Principal",
    description: "Martillo de carpintero mango de madera 16oz",
    status: "disponible",
    addedDate: "2024-01-15",
    lastUpdated: "2024-01-15",
    type: "herramienta",
  },
  {
    id: "3",
    name: "Destornilladores Set",
    category: "Herramientas Manuales",
    quantity: 2,
    minStock: 1,
    location: "Taller Principal",
    description: "Set de destornilladores Phillips y planos",
    status: "prestado",
    addedDate: "2024-01-15",
    lastUpdated: "2024-01-20",
    type: "herramienta",
  },
  {
    id: "4",
    name: "Pintura Acrílica Blanca",
    category: "Pinturas",
    quantity: 10,
    minStock: 3,
    location: "Depósito A",
    description: "Pintura acrílica blanca mate 1L",
    status: "disponible",
    addedDate: "2024-01-15",
    lastUpdated: "2024-01-15",
    type: "insumo",
  },
  {
    id: "5",
    name: "Tornillos Autorroscantes",
    category: "Ferretería",
    quantity: 500,
    minStock: 100,
    location: "Depósito B",
    description: "Tornillos autorroscantes 4x40mm caja x100",
    status: "disponible",
    addedDate: "2024-01-15",
    lastUpdated: "2024-01-15",
    type: "insumo",
  },
  {
    id: "6",
    name: "Sierra Circular",
    category: "Herramientas Eléctricas",
    quantity: 1,
    minStock: 1,
    location: "Taller Principal",
    description: 'Sierra circular 7 1/4" 1400W',
    status: "mantenimiento",
    addedDate: "2024-01-15",
    lastUpdated: "2024-01-18",
    type: "herramienta",
  },
]

const initialTransactions: Transaction[] = [
  {
    id: "1",
    itemId: "3",
    itemName: "Destornilladores Set",
    type: "prestamo",
    quantity: 1,
    borrower: "Juan Pérez",
    date: "2024-01-20",
    dueDate: "2024-01-27",
    notes: "Para proyecto de carpintería",
    status: "activo",
  },
  {
    id: "2",
    itemId: "1",
    itemName: "Taladro Eléctrico Bosch",
    type: "prestamo",
    quantity: 1,
    borrower: "María García",
    date: "2024-01-18",
    dueDate: "2024-01-25",
    notes: "Instalación de estantes",
    status: "completado",
  },
]

const initialDisposals: Disposal[] = [
  {
    id: "1",
    itemId: "6",
    itemName: "Sierra Circular",
    reason: "Desgaste por uso",
    quantity: 1,
    date: "2024-01-18",
    notes: "Motor quemado, no es reparable",
    status: "pendiente",
  },
]

const initialSettings: AppSettings = {
  categories: [
    "Herramientas Eléctricas",
    "Herramientas Manuales",
    "Pinturas",
    "Ferretería",
    "Seguridad",
    "Medición",
    "Limpieza",
    "Oficina",
  ],
  locations: ["Taller Principal", "Depósito A", "Depósito B", "Oficina", "Almacén General"],
  sources: ["Compra", "Donación", "Transferencia", "Fabricación Propia"],
  lowStockThreshold: 5,
  defaultLoanDays: 7,
  notifications: true,
  autoBackup: false,
  currency: "ARS",
  language: "es",
}

export default function InventorySystem() {
  // Estados principales
  const [items, setItems] = useState<Item[]>(initialItems)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [disposals, setDisposals] = useState<Disposal[]>(initialDisposals)
  const [settings, setSettings] = useState<AppSettings>(initialSettings)

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [isTransactionOpen, setIsTransactionOpen] = useState(false)
  const [isDisposalOpen, setIsDisposalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Estados de formularios
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: "",
    category: "",
    quantity: 0,
    minStock: 0,
    location: "",
    description: "",
    type: "herramienta",
  })

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: "prestamo",
    quantity: 1,
    borrower: "",
    notes: "",
  })

  const [newDisposal, setNewDisposal] = useState<Partial<Disposal>>({
    reason: "",
    quantity: 1,
    notes: "",
  })

  // Funciones de utilidad
  const generateId = () => Math.random().toString(36).substr(2, 9)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "prestado":
        return "bg-yellow-100 text-yellow-800"
      case "mantenimiento":
        return "bg-orange-100 text-orange-800"
      case "baja":
        return "bg-red-100 text-red-800"
      case "activo":
        return "bg-blue-100 text-blue-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "vencido":
        return "bg-red-100 text-red-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "disponible":
        return "Disponible"
      case "prestado":
        return "Prestado"
      case "mantenimiento":
        return "Mantenimiento"
      case "baja":
        return "Baja"
      case "activo":
        return "Activo"
      case "completado":
        return "Completado"
      case "vencido":
        return "Vencido"
      case "pendiente":
        return "Pendiente"
      case "aprobada":
        return "Aprobada"
      case "rechazada":
        return "Rechazada"
      default:
        return status
    }
  }

  // Filtros
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesType = filterType === "all" || item.type === filterType

    return matchesSearch && matchesCategory && matchesStatus && matchesType
  })

  // Funciones CRUD
  const addItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.location) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const item: Item = {
      id: generateId(),
      name: newItem.name!,
      category: newItem.category!,
      quantity: newItem.quantity || 0,
      minStock: newItem.minStock || 0,
      location: newItem.location!,
      description: newItem.description || "",
      status: "disponible",
      addedDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      type: newItem.type || "herramienta",
    }

    setItems([...items, item])
    setNewItem({
      name: "",
      category: "",
      quantity: 0,
      minStock: 0,
      location: "",
      description: "",
      type: "herramienta",
    })
    setIsAddItemOpen(false)

    toast({
      title: "Éxito",
      description: "Artículo agregado correctamente",
    })
  }

  const editItem = () => {
    if (!selectedItem || !newItem.name || !newItem.category || !newItem.location) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const updatedItems = items.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            name: newItem.name!,
            category: newItem.category!,
            quantity: newItem.quantity || 0,
            minStock: newItem.minStock || 0,
            location: newItem.location!,
            description: newItem.description || "",
            type: newItem.type || "herramienta",
            lastUpdated: new Date().toISOString().split("T")[0],
          }
        : item,
    )

    setItems(updatedItems)
    setIsEditItemOpen(false)
    setSelectedItem(null)

    toast({
      title: "Éxito",
      description: "Artículo actualizado correctamente",
    })
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    toast({
      title: "Éxito",
      description: "Artículo eliminado correctamente",
    })
  }

  const addTransaction = () => {
    if (!selectedItem || !newTransaction.type || !newTransaction.quantity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (newTransaction.type === "prestamo" && !newTransaction.borrower) {
      toast({
        title: "Error",
        description: "Por favor ingresa el nombre del solicitante",
        variant: "destructive",
      })
      return
    }

    const transaction: Transaction = {
      id: generateId(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: newTransaction.type!,
      quantity: newTransaction.quantity!,
      borrower: newTransaction.borrower,
      date: new Date().toISOString().split("T")[0],
      dueDate:
        newTransaction.type === "prestamo"
          ? new Date(Date.now() + settings.defaultLoanDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : undefined,
      notes: newTransaction.notes,
      status: newTransaction.type === "prestamo" ? "activo" : "completado",
    }

    setTransactions([...transactions, transaction])

    // Actualizar estado del artículo
    const updatedItems = items.map((item) => {
      if (item.id === selectedItem.id) {
        let newQuantity = item.quantity
        let newStatus = item.status

        switch (newTransaction.type) {
          case "prestamo":
            newQuantity -= newTransaction.quantity!
            newStatus = newQuantity === 0 ? "prestado" : "disponible"
            break
          case "devolucion":
            newQuantity += newTransaction.quantity!
            newStatus = "disponible"
            break
          case "entrada":
            newQuantity += newTransaction.quantity!
            break
          case "salida":
            newQuantity -= newTransaction.quantity!
            break
        }

        return {
          ...item,
          quantity: Math.max(0, newQuantity),
          status: newStatus,
          lastUpdated: new Date().toISOString().split("T")[0],
        }
      }
      return item
    })

    setItems(updatedItems)
    setNewTransaction({
      type: "prestamo",
      quantity: 1,
      borrower: "",
      notes: "",
    })
    setIsTransactionOpen(false)
    setSelectedItem(null)

    toast({
      title: "Éxito",
      description: "Transacción registrada correctamente",
    })
  }

  const addDisposal = () => {
    if (!selectedItem || !newDisposal.reason || !newDisposal.quantity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const disposal: Disposal = {
      id: generateId(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      reason: newDisposal.reason!,
      quantity: newDisposal.quantity!,
      date: new Date().toISOString().split("T")[0],
      notes: newDisposal.notes,
      status: "pendiente",
    }

    setDisposals([...disposals, disposal])
    setNewDisposal({
      reason: "",
      quantity: 1,
      notes: "",
    })
    setIsDisposalOpen(false)
    setSelectedItem(null)

    toast({
      title: "Éxito",
      description: "Solicitud de baja registrada correctamente",
    })
  }

  const approveDisposal = (disposalId: string) => {
    const disposal = disposals.find((d) => d.id === disposalId)
    if (!disposal) return

    // Actualizar estado de la baja
    const updatedDisposals = disposals.map((d) => (d.id === disposalId ? { ...d, status: "aprobada" as const } : d))
    setDisposals(updatedDisposals)

    // Actualizar cantidad del artículo
    const updatedItems = items.map((item) => {
      if (item.id === disposal.itemId) {
        const newQuantity = Math.max(0, item.quantity - disposal.quantity)
        return {
          ...item,
          quantity: newQuantity,
          status: newQuantity === 0 ? ("baja" as const) : item.status,
          lastUpdated: new Date().toISOString().split("T")[0],
        }
      }
      return item
    })
    setItems(updatedItems)

    toast({
      title: "Éxito",
      description: "Baja aprobada correctamente",
    })
  }

  const rejectDisposal = (disposalId: string) => {
    const updatedDisposals = disposals.map((d) => (d.id === disposalId ? { ...d, status: "rechazada" as const } : d))
    setDisposals(updatedDisposals)

    toast({
      title: "Éxito",
      description: "Baja rechazada",
    })
  }

  // Estadísticas
  const stats = {
    totalItems: items.length,
    availableItems: items.filter((item) => item.status === "disponible").length,
    loanedItems: items.filter((item) => item.status === "prestado").length,
    lowStockItems: items.filter((item) => item.quantity <= item.minStock).length,
    activeLoans: transactions.filter((t) => t.status === "activo").length,
    overdueLoans: transactions.filter((t) => {
      if (t.status !== "activo" || !t.dueDate) return false
      return new Date(t.dueDate) < new Date()
    }).length,
    tools: items.filter((item) => item.type === "herramienta").length,
    supplies: items.filter((item) => item.type === "insumo").length,
  }

  // Efectos
  useEffect(() => {
    // Actualizar préstamos vencidos
    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.status === "activo" && transaction.dueDate) {
        const isOverdue = new Date(transaction.dueDate) < new Date()
        return {
          ...transaction,
          status: isOverdue ? ("vencido" as const) : transaction.status,
        }
      }
      return transaction
    })

    if (JSON.stringify(updatedTransactions) !== JSON.stringify(transactions)) {
      setTransactions(updatedTransactions)
    }
  }, [transactions])

  const openEditDialog = (item: Item) => {
    setSelectedItem(item)
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock,
      location: item.location,
      description: item.description,
      type: item.type,
    })
    setIsEditItemOpen(true)
  }

  const openTransactionDialog = (item: Item) => {
    setSelectedItem(item)
    setNewTransaction({
      type: "prestamo",
      quantity: 1,
      borrower: "",
      notes: "",
    })
    setIsTransactionOpen(true)
  }

  const openDisposalDialog = (item: Item) => {
    setSelectedItem(item)
    setNewDisposal({
      reason: "",
      quantity: 1,
      notes: "",
    })
    setIsDisposalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Inventario CFP 413</h1>
          <p className="text-gray-600">Gestión de herramientas e insumos - Versión 36</p>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
            <TabsTrigger value="insumos">Insumos</TabsTrigger>
            <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
            <TabsTrigger value="configuracion">Config</TabsTrigger>
          </TabsList>

          {/* Tab Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Herramientas</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.tools}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Insumos</p>
                      <p className="text-2xl font-bold text-green-600">{stats.supplies}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Préstamos Activos</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.activeLoans}</p>
                    </div>
                    <Users className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                      <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Herramientas</CardTitle>
                  <CardDescription>Estado actual del inventario de herramientas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Activas:</span>
                      <span className="font-medium">
                        {items.filter((t) => t.type === "herramienta" && t.status === "disponible").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>En préstamo:</span>
                      <span className="font-medium">{stats.activeLoans}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>En mantenimiento:</span>
                      <span className="font-medium">
                        {items.filter((t) => t.type === "herramienta" && t.status === "mantenimiento").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas de Stock</CardTitle>
                  <CardDescription>Insumos que requieren atención</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.lowStockItems > 0 ? (
                    <div className="space-y-2">
                      {items
                        .filter((item) => item.quantity <= item.minStock)
                        .slice(0, 5)
                        .map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-sm">{item.name}</span>
                            <Badge variant="destructive" className="text-xs">
                              {item.quantity} / {item.minStock}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">✅ Todos los insumos tienen stock suficiente</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Herramientas */}
          <TabsContent value="herramientas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Gestión de Herramientas</CardTitle>
                    <CardDescription>Administra las herramientas del CFP 413</CardDescription>
                  </div>
                  <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Herramienta
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Agregar Nueva Herramienta</DialogTitle>
                        <DialogDescription>Completa la información de la nueva herramienta</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nombre *</Label>
                          <Input
                            id="name"
                            value={newItem.name || ""}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="Ej: Taladro Eléctrico"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Categoría *</Label>
                          <Select
                            value={newItem.category}
                            onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {settings.categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="0"
                              value={newItem.quantity || 0}
                              onChange={(e) =>
                                setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="minStock">Stock Mínimo</Label>
                            <Input
                              id="minStock"
                              type="number"
                              min="0"
                              value={newItem.minStock || 0}
                              onChange={(e) =>
                                setNewItem({ ...newItem, minStock: Number.parseInt(e.target.value) || 0 })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="location">Ubicación *</Label>
                          <Select
                            value={newItem.location}
                            onValueChange={(value) => setNewItem({ ...newItem, location: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una ubicación" />
                            </SelectTrigger>
                            <SelectContent>
                              {settings.locations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={newItem.description || ""}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Descripción detallada de la herramienta"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            setNewItem({ ...newItem, type: "herramienta" })
                            addItem()
                          }}
                        >
                          Agregar Herramienta
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros y búsqueda */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar herramientas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {settings.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="prestado">Prestado</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla de herramientas */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems
                        .filter((item) => item.type === "herramienta")
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-[200px]">{item.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={item.quantity <= item.minStock ? "text-red-600 font-semibold" : ""}>
                                  {item.quantity}
                                </span>
                                {item.quantity <= item.minStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              </div>
                            </TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openTransactionDialog(item)}
                                  disabled={item.status === "baja"}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar herramienta?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. La herramienta será eliminada permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteItem(item.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredItems.filter((item) => item.type === "herramienta").length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron herramientas que coincidan con los filtros
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Insumos */}
          <TabsContent value="insumos" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Gestión de Insumos</CardTitle>
                    <CardDescription>Administra los insumos del CFP 413</CardDescription>
                  </div>
                  <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Insumo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Insumo</DialogTitle>
                        <DialogDescription>Completa la información del nuevo insumo</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nombre *</Label>
                          <Input
                            id="name"
                            value={newItem.name || ""}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="Ej: Pintura Acrílica"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Categoría *</Label>
                          <Select
                            value={newItem.category}
                            onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {settings.categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input
                              id="quantity"
                              type="number"
                              min="0"
                              value={newItem.quantity || 0}
                              onChange={(e) =>
                                setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="minStock">Stock Mínimo</Label>
                            <Input
                              id="minStock"
                              type="number"
                              min="0"
                              value={newItem.minStock || 0}
                              onChange={(e) =>
                                setNewItem({ ...newItem, minStock: Number.parseInt(e.target.value) || 0 })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="location">Ubicación *</Label>
                          <Select
                            value={newItem.location}
                            onValueChange={(value) => setNewItem({ ...newItem, location: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una ubicación" />
                            </SelectTrigger>
                            <SelectContent>
                              {settings.locations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Descripción</Label>
                          <Textarea
                            id="description"
                            value={newItem.description || ""}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Descripción detallada del insumo"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            setNewItem({ ...newItem, type: "insumo" })
                            addItem()
                          }}
                        >
                          Agregar Insumo
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros y búsqueda */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar insumos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {settings.categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="prestado">Prestado</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla de insumos */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems
                        .filter((item) => item.type === "insumo")
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-[200px]">{item.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={item.quantity <= item.minStock ? "text-red-600 font-semibold" : ""}>
                                  {item.quantity}
                                </span>
                                {item.quantity <= item.minStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              </div>
                            </TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openTransactionDialog(item)}
                                  disabled={item.status === "baja"}
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar insumo?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. El insumo será eliminado permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteItem(item.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredItems.filter((item) => item.type === "insumo").length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron insumos que coincidan con los filtros
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Préstamos */}
          <TabsContent value="prestamos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Préstamos</CardTitle>
                <CardDescription>Registro de préstamos, devoluciones y movimientos de inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Artículo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell className="font-medium">{transaction.itemName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.type === "prestamo"
                                ? "Préstamo"
                                : transaction.type === "devolucion"
                                  ? "Devolución"
                                  : transaction.type === "entrada"
                                    ? "Entrada"
                                    : "Salida"}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>{transaction.borrower || "-"}</TableCell>
                          <TableCell>{transaction.dueDate ? formatDate(transaction.dueDate) : "-"}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {getStatusText(transaction.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{transaction.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No hay transacciones registradas</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Reportes */}
          <TabsContent value="reportes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes y Estadísticas</CardTitle>
                <CardDescription>Análisis y reportes del sistema de inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resumen por categorías */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Inventario por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {settings.categories.map((category) => {
                          const categoryItems = items.filter((item) => item.category === category)
                          const totalQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
                          return (
                            <div key={category} className="flex justify-between items-center">
                              <span className="text-sm font-medium">{category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{categoryItems.length} items</span>
                                <Badge variant="outline">{totalQuantity} unidades</Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Artículos con stock bajo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Stock Bajo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items
                          .filter((item) => item.quantity <= item.minStock)
                          .map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span className="text-sm font-medium">{item.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-red-600">
                                  {item.quantity}/{item.minStock}
                                </span>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              </div>
                            </div>
                          ))}
                        {items.filter((item) => item.quantity <= item.minStock).length === 0 && (
                          <p className="text-sm text-gray-500">No hay artículos con stock bajo</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Préstamos activos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Préstamos Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transactions
                          .filter((t) => t.status === "activo")
                          .map((transaction) => (
                            <div key={transaction.id} className="flex justify-between items-center">
                              <div>
                                <span className="text-sm font-medium">{transaction.itemName}</span>
                                <p className="text-xs text-gray-500">{transaction.borrower}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm">{transaction.quantity} unidades</span>
                                <p className="text-xs text-gray-500">
                                  Vence: {transaction.dueDate ? formatDate(transaction.dueDate) : "-"}
                                </p>
                              </div>
                            </div>
                          ))}
                        {transactions.filter((t) => t.status === "activo").length === 0 && (
                          <p className="text-sm text-gray-500">No hay préstamos activos</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Préstamos vencidos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Préstamos Vencidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transactions
                          .filter((t) => t.status === "vencido")
                          .map((transaction) => (
                            <div key={transaction.id} className="flex justify-between items-center">
                              <div>
                                <span className="text-sm font-medium">{transaction.itemName}</span>
                                <p className="text-xs text-gray-500">{transaction.borrower}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm text-red-600">{transaction.quantity} unidades</span>
                                <p className="text-xs text-red-500">
                                  Venció: {transaction.dueDate ? formatDate(transaction.dueDate) : "-"}
                                </p>
                              </div>
                            </div>
                          ))}
                        {transactions.filter((t) => t.status === "vencido").length === 0 && (
                          <p className="text-sm text-gray-500">No hay préstamos vencidos</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Botones de exportación */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Inventario
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Transacciones
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Configuración */}
          <TabsContent value="configuracion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Personaliza las opciones del sistema de inventario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categorías */}
                <div>
                  <Label className="text-base font-semibold">Categorías</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Gestiona las categorías disponibles para clasificar los artículos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {settings.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ubicaciones */}
                <div>
                  <Label className="text-base font-semibold">Ubicaciones</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Define las ubicaciones físicas donde se almacenan los artículos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {settings.locations.map((location) => (
                      <Badge key={location} variant="secondary">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Configuración de préstamos */}
                <div>
                  <Label className="text-base font-semibold">Configuración de Préstamos</Label>
                  <p className="text-sm text-gray-600 mb-3">Ajusta los parámetros por defecto para los préstamos</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultLoanDays">Días de préstamo por defecto</Label>
                      <Input
                        id="defaultLoanDays"
                        type="number"
                        min="1"
                        value={settings.defaultLoanDays}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            defaultLoanDays: Number.parseInt(e.target.value) || 7,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Moneda</Label>
                      <Select
                        value={settings.currency}
                        onValueChange={(value) => setSettings({ ...settings, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notificaciones */}
                <div>
                  <Label className="text-base font-semibold">Notificaciones</Label>
                  <p className="text-sm text-gray-600 mb-3">Configura las alertas y notificaciones del sistema</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificaciones habilitadas</Label>
                        <p className="text-sm text-gray-600">Recibir alertas del sistema</p>
                      </div>
                      <Button
                        variant={settings.notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                      >
                        {settings.notifications ? "Activado" : "Desactivado"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Respaldo automático</Label>
                        <p className="text-sm text-gray-600">Crear copias de seguridad automáticas</p>
                      </div>
                      <Button
                        variant={settings.autoBackup ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                      >
                        {settings.autoBackup ? "Activado" : "Desactivado"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Acciones del sistema */}
                <div>
                  <Label className="text-base font-semibold">Acciones del Sistema</Label>
                  <p className="text-sm text-gray-600 mb-3">Herramientas de mantenimiento y gestión</p>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Datos
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Configuración
                    </Button>
                    <Button variant="outline">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Restablecer Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para editar artículo */}
        <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Artículo</DialogTitle>
              <DialogDescription>Modifica la información del artículo seleccionado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={newItem.name || ""}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Tipo *</Label>
                <Select
                  value={newItem.type}
                  onValueChange={(value: "herramienta" | "insumo") => setNewItem({ ...newItem, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="herramienta">Herramienta</SelectItem>
                    <SelectItem value="insumo">Insumo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría *</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Cantidad</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="0"
                    value={newItem.quantity || 0}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-minStock">Stock Mínimo</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    min="0"
                    value={newItem.minStock || 0}
                    onChange={(e) => setNewItem({ ...newItem, minStock: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">Ubicación *</Label>
                <Select value={newItem.location} onValueChange={(value) => setNewItem({ ...newItem, location: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={newItem.description || ""}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditItemOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editItem}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para transacciones */}
        <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Transacción</DialogTitle>
              <DialogDescription>Registra un préstamo, devolución o movimiento de inventario</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Artículo</Label>
                <Input value={selectedItem?.name || ""} disabled />
              </div>
              <div>
                <Label htmlFor="transaction-type">Tipo de Transacción *</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value: "prestamo" | "devolucion" | "entrada" | "salida") =>
                    setNewTransaction({ ...newTransaction, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prestamo">Préstamo</SelectItem>
                    <SelectItem value="devolucion">Devolución</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transaction-quantity">Cantidad *</Label>
                <Input
                  id="transaction-quantity"
                  type="number"
                  min="1"
                  max={selectedItem?.quantity || 1}
                  value={newTransaction.quantity || 1}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, quantity: Number.parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              {newTransaction.type === "prestamo" && (
                <div>
                  <Label htmlFor="transaction-borrower">Solicitante *</Label>
                  <Input
                    id="transaction-borrower"
                    value={newTransaction.borrower || ""}
                    onChange={(e) => setNewTransaction({ ...newTransaction, borrower: e.target.value })}
                    placeholder="Nombre del solicitante"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="transaction-notes">Notas</Label>
                <Textarea
                  id="transaction-notes"
                  value={newTransaction.notes || ""}
                  onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  placeholder="Observaciones adicionales"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransactionOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={addTransaction}>Registrar Transacción</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para bajas */}
        <Dialog open={isDisposalOpen} onOpenChange={setIsDisposalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Solicitar Baja</DialogTitle>
              <DialogDescription>Registra una solicitud de baja para el artículo seleccionado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Artículo</Label>
                <Input value={selectedItem?.name || ""} disabled />
              </div>
              <div>
                <Label htmlFor="disposal-reason">Motivo de la Baja *</Label>
                <Select
                  value={newDisposal.reason}
                  onValueChange={(value) => setNewDisposal({ ...newDisposal, reason: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desgaste por uso">Desgaste por uso</SelectItem>
                    <SelectItem value="Daño irreparable">Daño irreparable</SelectItem>
                    <SelectItem value="Obsolescencia">Obsolescencia</SelectItem>
                    <SelectItem value="Pérdida">Pérdida</SelectItem>
                    <SelectItem value="Robo">Robo</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="disposal-quantity">Cantidad *</Label>
                <Input
                  id="disposal-quantity"
                  type="number"
                  min="1"
                  max={selectedItem?.quantity || 1}
                  value={newDisposal.quantity || 1}
                  onChange={(e) => setNewDisposal({ ...newDisposal, quantity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="disposal-notes">Notas</Label>
                <Textarea
                  id="disposal-notes"
                  value={newDisposal.notes || ""}
                  onChange={(e) => setNewDisposal({ ...newDisposal, notes: e.target.value })}
                  placeholder="Detalles adicionales sobre la baja"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDisposalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={addDisposal}>Solicitar Baja</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  )
}
