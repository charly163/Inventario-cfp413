"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Custom Components
import ItemsList from "@/components/items-list"
import TransactionsList from "@/components/transactions-list"
import AddItemForm from "@/components/add-item-form"
import AddTransactionForm from "@/components/add-transaction-form"
import ToolsList from "@/components/tools-list"
import SuppliesList from "@/components/supplies-list"
import ToolHistoryModal from "@/components/tool-history-modal"
import { TransactionDetailsDialog } from "@/components/transactions/transaction-details-dialog"
import EditItemForm from "@/components/edit-item-form"
import ItemDetailsDialog from "@/components/item-details-dialog"
import TeachersManager from "@/components/TeachersManager"
import CategoriesManager from "@/components/CategoriesManager"
import LocationsManager from "@/components/LocationsManager"
import SourcesManager from "@/components/SourcesManager"
import ConditionsManager from "@/components/ConditionsManager"
import { TransactionForm, type TransactionFormData } from "@/components/transactions/transaction-form"

// Database functions
import {
  getItems,
  getTransactions,
  deleteTransaction as deleteTransactionInDb,
  addTransaction as createTransactionInDb,
  updateItem,
  addItem as createItemInDb,
  getItems as fetchItemsFromDb,
  deleteItem as deleteItemInDb,
  updateTeacher
} from "@/lib/database"

// Types
import { Item, Transaction } from "@/types/inventory.types"

interface AppSettings {
  lowStockThreshold: number
  categories: string[]
  itemTypes: string[]
  conditions: string[]
  locations: string[]
  transactionTypes: string[]
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("inventario")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isTransactionOpen, setIsTransactionOpen] = useState(false)
  const [isSubmittingTx, setIsSubmittingTx] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    lowStockThreshold: 5,
    categories: [],
    itemTypes: [],
    conditions: [],
    locations: [],
    transactionTypes: []
  })

  // Cargar transacciones desde la base de datos
  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await getTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Error al cargar transacciones:', error)
      toast.error('Error al cargar el historial de transacciones')
    } finally {
      setLoading(false)
    }
  }

  // Cargar ítems desde la base de datos
  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await getItems()
      setItems(data)
    } catch (error) {
      console.error('Error al cargar ítems:', error)
      toast.error('Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadItems()
    loadTransactions()
  }, [])

  // Manejar eliminación de transacción
  const handleDeleteTransaction = async (id: string) => {
    if (!id) {
      toast.error('ID de transacción no válido')
      return
    }

    try {
      setLoading(true)
      const deleted = await deleteTransactionInDb(id)
      
      if (deleted) {
        setTransactions(prev => prev.filter(tx => tx.id !== id))
        toast.success('Transacción eliminada correctamente')
      } else {
        toast.error('No se pudo eliminar la transacción')
      }
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      toast.error('Error al eliminar la transacción')
    } finally {
      setLoading(false)
    }
  }

  // Renderizar el contenido principal
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="inventario" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
          <TabsTrigger value="insumos">Insumos</TabsTrigger>
          <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
        </TabsList>

        <TabsContent value="inventario">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inventario</CardTitle>
                <Button onClick={() => setIsTransactionOpen(true)}>Nuevo Movimiento</Button>
              </div>
              <CardDescription>
                Gestión completa del inventario de herramientas e insumos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemsList 
                items={items} 
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onViewDetails={handleViewItemDetails}
                onViewHistory={handleViewItemHistory}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prestamos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial de Préstamos</CardTitle>
                <Button onClick={() => setIsTransactionOpen(true)}>Nuevo Préstamo</Button>
              </div>
              <CardDescription>
                Registro de todos los préstamos y devoluciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsList 
                transactions={transactions}
                onViewDetails={handleViewTransactionDetails}
                onDelete={handleDeleteTransaction}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <TransactionDetailsDialog
        open={isTransactionDetailsOpen}
        onOpenChange={setIsTransactionDetailsOpen}
        transaction={selectedTransaction}
      />

      <ItemDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        item={selectedItem}
      />

      {/* Formulario de transacción */}
      <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
            <DialogDescription>
              Registra un nuevo préstamo, devolución o ajuste de inventario
            </DialogDescription>
          </DialogHeader>
          <AddTransactionForm
            items={items}
            onSubmit={handleAddTransaction}
            onCancel={() => setIsTransactionOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de historial */}
      <ToolHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        itemId={selectedItem?.id || ''}
      />
    </div>
  )

  // Funciones de manejo de eventos
  async function handleEditItem(item: Item) {
    setSelectedItem(item)
    setIsEditOpen(true)
  }

  async function handleDeleteItem(id: string) {
    // Implementar lógica de eliminación
  }

  function handleViewItemDetails(item: Item) {
    setSelectedItem(item)
    setIsDetailsOpen(true)
  }

  function handleViewItemHistory(item: Item) {
    setSelectedItem(item)
    setIsHistoryModalOpen(true)
  }

  function handleViewTransactionDetails(transaction: Transaction) {
    setSelectedTransaction(transaction)
    setIsTransactionDetailsOpen(true)
  }

  async function handleAddTransaction(data: TransactionFormData) {
    try {
      setIsSubmittingTx(true)
      // Implementar lógica para agregar transacción
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      toast.error('Error al procesar la transacción')
    } finally {
      setIsSubmittingTx(false)
      setIsTransactionOpen(false)
    }
  }
}
