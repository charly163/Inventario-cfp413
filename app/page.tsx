"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Wrench, Users, AlertTriangle } from "lucide-react"
import { AddItemForm } from "@/components/add-item-form"
import { ItemsList } from "@/components/items-list"
import { ToolsList } from "@/components/tools-list"
import { SuppliesList } from "@/components/supplies-list"
import { TransactionsList } from "@/components/transactions-list"
import { DisposalsList } from "@/components/disposals-list"
import { ReportsSection } from "@/components/reports-section"
import { SettingsPanel } from "@/components/settings-panel"
import { getItems, getTransactions, getDisposals } from "@/lib/database"

interface Item {
  id: number
  name: string
  category: string
  type: "tool" | "supply"
  quantity: number
  min_stock: number
  location: string
  condition: string
  acquisition_date: string
  cost: number
  supplier: string
  brand: string
  model: string
  status: "active" | "low_stock" | "out_of_stock"
  created_at: string
  updated_at: string
}

interface Transaction {
  id: number
  item_id: number
  item_name: string
  professor_name: string
  transaction_type: "loan" | "donation"
  quantity: number
  loan_date: string
  return_date: string | null
  expected_return_date: string | null
  status: "active" | "returned" | "overdue"
  notes: string | null
  created_at: string
  updated_at: string
}

interface Disposal {
  id: number
  item_id: number
  item_name: string
  reason: string
  quantity: number
  disposal_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export default function InventoryDashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [disposals, setDisposals] = useState<Disposal[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [itemsData, transactionsData, disposalsData] = await Promise.all([
        getItems(),
        getTransactions(),
        getDisposals(),
      ])
      setItems(itemsData)
      setTransactions(transactionsData)
      setDisposals(disposalsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calcular estadísticas
  const tools = items.filter((item) => item.type === "tool")
  const supplies = items.filter((item) => item.type === "supply")
  const activeLoans = transactions.filter((t) => t.status === "active").length
  const overdueLoans = transactions.filter((t) => t.status === "overdue").length
  const lowStockSupplies = supplies.filter((item) => item.quantity <= item.min_stock).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Inventario CFP 413</h1>
          <p className="text-muted-foreground">Gestión de herramientas, insumos y préstamos</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Versión 36
        </Badge>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tools">Herramientas</TabsTrigger>
          <TabsTrigger value="supplies">Insumos</TabsTrigger>
          <TabsTrigger value="all-items">Todos</TabsTrigger>
          <TabsTrigger value="loans">Préstamos</TabsTrigger>
          <TabsTrigger value="disposals">Bajas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="settings">Config</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Herramientas</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tools.length}</div>
                <p className="text-xs text-muted-foreground">
                  {tools.filter((t) => t.status === "active").length} activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Insumos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{supplies.length}</div>
                <p className="text-xs text-muted-foreground">
                  {supplies.reduce((sum, item) => sum + item.quantity, 0)} unidades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLoans}</div>
                <p className="text-xs text-muted-foreground">{overdueLoans} vencidos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockSupplies}</div>
                <p className="text-xs text-muted-foreground">Insumos por reponer</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Herramientas</CardTitle>
                <CardDescription>Estado actual del inventario de herramientas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Activas:</span>
                    <span className="font-medium">{tools.filter((t) => t.status === "active").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En préstamo:</span>
                    <span className="font-medium">{activeLoans}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disponibles:</span>
                    <span className="font-medium">
                      {tools.filter((t) => t.status === "active").length - activeLoans}
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
                {lowStockSupplies > 0 ? (
                  <div className="space-y-2">
                    {supplies
                      .filter((item) => item.quantity <= item.min_stock)
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-sm">{item.name}</span>
                          <Badge variant="destructive" className="text-xs">
                            {item.quantity} / {item.min_stock}
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

        <TabsContent value="tools">
          <ToolsList items={tools} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="supplies">
          <SuppliesList items={supplies} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="all-items">
          <div className="space-y-6">
            <AddItemForm onSuccess={loadData} />
            <ItemsList items={items} onUpdate={loadData} />
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <TransactionsList transactions={transactions} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="disposals">
          <DisposalsList disposals={disposals} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsSection items={items} transactions={transactions} disposals={disposals} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
