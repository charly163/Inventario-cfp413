"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Users, AlertTriangle, TrendingUp, Settings } from "lucide-react"
import ItemsList from "@/components/items-list"
import AddItemForm from "@/components/add-item-form"
import EditItemForm from "@/components/edit-item-form"
import TransactionsList from "@/components/transactions-list"
import AddTransactionForm from "@/components/add-transaction-form"
import DisposalsList from "@/components/disposals-list"
import AddDisposalForm from "@/components/add-disposal-form"
import EditDisposalForm from "@/components/edit-disposal-form"
import ReportsSection from "@/components/reports-section"
import SettingsPanel from "@/components/settings-panel"

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

  // Initialize with sample data
  useEffect(() => {
    const sampleItems: Item[] = [
      {
        id: "1",
        name: "Calculadora Científica",
        category: "EQUIPAMIENTO",
        quantity: 25,
        source: "CREDITO FISCAL",
        cost: 15.99,
        acquisitionDate: "2024-01-15",
        description: "TI-84 Plus CE",
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
        name: "Microscopio",
        category: "EQUIPAMIENTO",
        quantity: 8,
        source: "PLAN DE MEJORAS",
        cost: 299.99,
        acquisitionDate: "2024-01-20",
        description: "Microscopio digital con cámara",
        status: "active",
        type: "herramienta",
        brand: "Olympus",
        condition: "nuevo",
        location: "Laboratorio Mesa 2",
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
  }, [])

  const addItem = (item: Omit<Item, "id">) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
    }
    setItems((prev) => [...prev, newItem])
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
  }

  const handleUpdateItem = (updatedItem: Item) => {
    updateItem(updatedItem.id, updatedItem)
    setEditingItem(null)
  }

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions((prev) => [...prev, newTransaction])

    // Update item quantity for loans
    if (transaction.type === "loan") {
      const item = items.find((item) => item.id === transaction.itemId)
      if (item) {
        const newQuantity = item.quantity - transaction.quantity
        let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

        if (newQuantity === 0) newStatus = "out-of-stock"
        else if (newQuantity < settings.lowStockThreshold) newStatus = "low-stock"

        updateItem(transaction.itemId, {
          quantity: newQuantity,
          status: newStatus,
        })
      }
    }
  }

  const addDisposal = (disposal: Omit<Disposal, "id">) => {
    const newDisposal: Disposal = {
      ...disposal,
      id: Date.now().toString(),
    }
    setDisposals((prev) => [...prev, newDisposal])

    // Update item quantity and status
    const item = items.find((item) => item.id === disposal.itemId)
    if (item) {
      const newQuantity = item.quantity - disposal.quantity
      let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

      if (newQuantity === 0) newStatus = "out-of-stock"
      else if (newQuantity < settings.lowStockThreshold) newStatus = "low-stock"

      updateItem(disposal.itemId, {
        quantity: newQuantity,
        status: newStatus,
      })
    }
  }

  const handleEditDisposal = (disposal: Disposal) => {
    setEditingDisposal(disposal)
  }

  const handleUpdateDisposal = (updatedDisposal: Disposal, originalQuantity: number) => {
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
        else if (newQuantity < settings.lowStockThreshold) newStatus = "low-stock"

        updateItem(updatedDisposal.itemId, {
          quantity: newQuantity,
          status: newStatus,
        })
      }
    }

    // Actualizar la baja
    setDisposals((prev) => prev.map((disposal) => (disposal.id === updatedDisposal.id ? updatedDisposal : disposal)))

    setEditingDisposal(null)
  }

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)

    // Recalculate item statuses based on new threshold
    setItems((prev) =>
      prev.map((item) => {
        let newStatus: "active" | "low-stock" | "out-of-stock" = "active"
        if (item.quantity === 0) newStatus = "out-of-stock"
        else if (item.quantity < newSettings.lowStockThreshold) newStatus = "low-stock"

        return { ...item, status: newStatus }
      }),
    )
  }

  const markTransactionReturned = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((transaction) => {
        if (transaction.id === transactionId) {
          // Devolver la cantidad al inventario
          const item = items.find((item) => item.id === transaction.itemId)
          if (item) {
            const newQuantity = item.quantity + transaction.quantity
            let newStatus: "active" | "low-stock" | "out-of-stock" = "active"

            if (newQuantity === 0) newStatus = "out-of-stock"
            else if (newQuantity < settings.lowStockThreshold) newStatus = "low-stock"

            updateItem(transaction.itemId, {
              quantity: newQuantity,
              status: newStatus,
            })
          }

          return { ...transaction, status: "returned" as const }
        }
        return transaction
      }),
    )
  }

  const extendLoan = (transactionId: string, newReturnDate: string) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, returnDate: newReturnDate } : transaction,
      ),
    )
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const activeLoans = transactions.filter((t) => t.status === "active" && t.type === "loan").length
  const lowStockItems = items.filter((item) => item.quantity < settings.lowStockThreshold && item.quantity > 0).length
  const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-blue-500">
            Sistema de Inventario del pañol del CFP 413{" "}
          </h1>
          <p className="text-muted-foreground">Gestiona herramientas y suministros de manera eficiente</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 min-w-[600px]">
              <TabsTrigger value="dashboard">Panel</TabsTrigger>
              <TabsTrigger value="items">Artículos</TabsTrigger>
              <TabsTrigger value="transactions">Préstamos</TabsTrigger>
              <TabsTrigger value="disposals">Bajas</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Config
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Artículos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <p className="text-xs text-muted-foreground">En {items.length} categorías</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeLoans}</div>
                  <p className="text-xs text-muted-foreground">Artículos prestados actualmente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alerta Stock Bajo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
                  <p className="text-xs text-muted-foreground">
                    Artículos con menos de {settings.lowStockThreshold} unidades
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Solo artículos comprados</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transacciones Recientes</CardTitle>
                  <CardDescription>Últimos préstamos y donaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{transaction.itemName}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.teacherName} • {transaction.quantity} unidades
                          </p>
                        </div>
                        <Badge variant={transaction.type === "loan" ? "default" : "secondary"}>
                          {transaction.type === "loan" ? "préstamo" : "donación"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Artículos con Stock Bajo</CardTitle>
                  <CardDescription>Artículos que necesitan reposición</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items
                      .filter((item) => item.quantity < settings.lowStockThreshold && item.quantity > 0)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <Badge variant="outline" className="text-orange-600">
                            {item.quantity} restantes
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-xl font-semibold">Préstamos y Donaciones</h2>
              <AddTransactionForm items={items} onAddTransaction={addTransaction} settings={settings} />
            </div>
            <TransactionsList
              transactions={transactions}
              onMarkReturned={markTransactionReturned}
              onExtendLoan={extendLoan}
            />
          </TabsContent>

          <TabsContent value="disposals" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-xl font-semibold">Bajas de Artículos</h2>
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

        {/* Add Item Form */}
        <AddItemForm onAddItem={addItem} settings={settings} />
      </div>
    </div>
  )
}
