"use client"

import { useState, useEffect } from "react"
// import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Database functions
import {
  getItems,
  getTransactions,
  updateItem,
  addItem as createItemInDb,
  addTransaction as createTransactionInDb,
  deleteTransaction as deleteTransactionInDb,
  updateTeacher,
  getCategories,
  getLocations,
  getSources,
  getConditions,
  deleteItem as deleteItemInDb,
  getSettings,
  updateSettings
} from "@/lib/database"

// Alias para mantener la compatibilidad con el código existente
const updateTransactionInDb = async (id: string, updates: any): Promise<void> => {
  // Esta función no está disponible en database.ts, implementación temporal
  console.warn('updateTransactionInDb no está implementado');
}

// Types
import { Item, Transaction } from "@/types/inventory.types"

// Components
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransactionForm, type TransactionFormData } from "@/components/transactions/transaction-form"
import TeachersManager from "@/components/TeachersManager"
import CategoriesManager from "@/components/CategoriesManager"
import LocationsManager from "@/components/LocationsManager"
import SourcesManager from "@/components/SourcesManager"
import ConditionsManager from "@/components/ConditionsManager"
import SystemSettingsManager from "@/components/SystemSettingsManager"

export interface AppSettings {
  lowStockThreshold: number
  categories: string[]
  itemTypes: string[]
  conditions: string[]
  locations: string[]
  transactionTypes: string[]
  teachers: string[]
  sources: string[]
  defaultLoanDays: number
  currency: string
  language: string
  notifications: boolean
  autoBackup: boolean
}

export default function Home() {
  // Estados de la aplicación
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inventario");

  // Estados para la gestión de ítems
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Estados para la gestión de transacciones
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Estados para los modales
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Configuración de la aplicación
  const [settings, setSettings] = useState<AppSettings>({
    lowStockThreshold: 5,
    categories: [],
    itemTypes: [],
    conditions: [],
    locations: [],
    transactionTypes: [],
    teachers: [],
    sources: [],
    defaultLoanDays: 7,
    currency: 'ARS',
    language: 'es',
    notifications: true,
    autoBackup: false
  });

  // Cargar transacciones desde la base de datos
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Cargar items
        const itemsData = await getItems();
        setItems(itemsData);

        // Cargar settings
        const settingsData = await getSettings();
        setSettings(settingsData);

        // Cargar transacciones
        await loadTransactions();
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [])

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      const ok = await updateSettings(newSettings);
      if (!ok) throw new Error("DB update failed");
      setSettings(newSettings);
    } catch (e) {
      console.error("Error updating settings:", e);
      throw e;
    }
  }

  const handleAddItem = async (newItem: Omit<Item, "id" | "created_at" | "updated_at">) => {
    try {
      const saved = await createItemInDb(newItem as any)
      if (saved) {
        setItems([...items, saved])
        toast.success(`Ítem ${saved.name} agregado correctamente`)
      }
    } catch (e) {
      console.error(e)
      toast.error(`Error al guardar: ${e instanceof Error ? e.message : 'Error de base de datos'}`)
    }
    return Promise.resolve()
  }

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTransaction = await createTransactionInDb(transaction);
      if (newTransaction) {
        setTransactions([newTransaction, ...transactions]);
        toast.success("Transacción agregada correctamente");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error(`Error de base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  }



  const handleUpdateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const ok = await updateItem(id, updates as any)
      if (!ok) throw new Error('DB update failed')
      setItems(items.map(item => (item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item)))
      toast.success("Ítem actualizado correctamente")
    } catch (e) {
      console.error(e)
      // Aún así actualizamos local para no perder cambios visuales
      setItems(items.map(item => (item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item)))
      toast.error("No se pudo actualizar en la base. Cambio aplicado localmente.")
    }
    return Promise.resolve()
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const ok = await deleteItemInDb(id);
      if (ok) {
        setItems(items.filter(item => item.id !== id));
        toast.success("Ítem eliminado correctamente");
      } else {
        throw new Error('No se pudo eliminar el ítem');
      }
    } catch (error) {
      console.error('Error al eliminar el ítem:', error);
      toast.error(`Error al eliminar el ítem: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Función para manejar la eliminación de una transacción
  const handleDeleteTransaction = async (id: string) => {
    if (!id) {
      toast.error("ID de transacción no válido");
      return;
    }

    try {
      const ok = await deleteTransactionInDb(id);
      if (ok) {
        setTransactions(transactions.filter(tx => tx.id !== id));
        toast.success("Transacción eliminada correctamente");
      } else {
        throw new Error('No se pudo eliminar la transacción');
      }
    } catch (error) {
      console.error('Error al eliminar la transacción:', error);
      toast.error(`Error al eliminar la transacción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item)
    setIsEditOpen(true)
  }

  // Funciones para calcular cantidades disponibles y prestadas
  const getLoanedQuantity = (itemId: string): number => {
    return transactions
      .filter(t => (t.item_id || t.itemId) === itemId && t.status === "activo")
      .reduce((total, t) => total + t.quantity, 0)
  }

  const getAvailableQuantity = (item: Item): number => {
    if (item.status === 'active' || item.status === 'low-stock') {
      return Math.max(0, item.quantity - getLoanedQuantity(item.id));
    }
    return 0;
  };

  const handleMarkReturned = async (transactionId: string) => {
    // Simulamos marcar una transacción como devuelta
    setTransactions(transactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, status: "completado" }
      }
      return t
    }))
    toast.success("Préstamo marcado como devuelto")
    return Promise.resolve()
  }

  const handleExtendLoan = async (transactionId: string, newReturnDate: string) => {
    // Simulamos extender un préstamo
    setTransactions(transactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, expected_return_date: newReturnDate }
      }
      return t
    }))
    toast.success("Préstamo extendido correctamente")
    return Promise.resolve()
  }

  const handleUpdateReturnDate = async (transactionId: string, newReturnDate: string) => {
    // Simulamos actualizar la fecha de devolución
    setTransactions(transactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, expected_return_date: newReturnDate }
      }
      return t
    }))
    toast.success("Fecha de devolución actualizada")
    return Promise.resolve()
  }

  // Las funciones getLoanedQuantity y getAvailableQuantity ya están definidas arriba

  // Funciones para manejar el historial de herramientas
  const handleViewHistory = (item: Item) => {
    setSelectedItem(item)
    setIsHistoryModalOpen(true)
    // Filtramos las transacciones relacionadas con este ítem para mostrar su historial
    const itemTransactions = transactions.filter(t =>
      (t.item_id === item.id || t.itemId === item.id)
    )
  }

  // Función para ver detalles de ítem
  const handleViewItemDetails = (item: Item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  // Función para ver detalles de transacción
  const handleViewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsTransactionDetailsOpen(true)
  }

  const openTransactionDialog = (item: Item) => {
    setSelectedItem(item)
    setIsTransactionOpen(true)
  }

  const handleSubmitTransaction = async (formData: TransactionFormData) => {
    try {
      setIsSubmittingTx(true);

      // Map form data to transaction
      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        item_id: formData.itemId,
        item_name: formData.itemName,
        teacher_id: formData.teacherId || null,
        teacher_name: formData.teacherName || 'Sin asignar',
        quantity: formData.quantity,
        type: formData.type || 'prestamo',
        date: format(formData.date || new Date(), 'yyyy-MM-dd'),
        return_date: formData.returnDate ? format(formData.returnDate, 'yyyy-MM-dd') : null,
        status: formData.status || 'activo',
        notes: formData.notes || null,
        course_name: formData.courseName || null,
      }
      await handleAddTransaction(transaction);
      setIsTransactionOpen(false);
      toast.success("Transacción registrada correctamente");
    } catch (error) {
      console.error('Error submitting transaction:', error);
      toast.error("Error al registrar la transacción");
    } finally {
      setIsSubmittingTx(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Sistema de Inventario CFP 413</h2>
        </div>

        <Tabs defaultValue="inventario" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="herramientas">Herramientas</TabsTrigger>
            <TabsTrigger value="insumos">Insumos</TabsTrigger>
            <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
            <TabsTrigger value="inventario">Todos</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="herramientas">
            <Card>
              <CardHeader>
                <CardTitle>Herramientas</CardTitle>
                <CardDescription>Lista de todas las herramientas en el inventario</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">Cargando herramientas...</div>
                ) : (
                  <ToolsList
                    items={items.filter(item => {
                      const cat = item.category?.toLowerCase() || "";
                      const type = item.type?.toLowerCase() || "";
                      return cat.includes("herramienta") || type === "herramienta";
                    })}
                    transactions={transactions}
                    settings={settings}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                    openEditDialog={handleEditItem}
                    openHistoryDialog={handleViewHistory}
                    openViewDialog={handleViewItemDetails}
                    openTransactionDialog={openTransactionDialog}
                    onAddItem={handleAddItem}
                    getLoanedQuantity={getLoanedQuantity}
                    getAvailableQuantity={getAvailableQuantity}
                    lowStockThreshold={settings.lowStockThreshold || 5}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insumos">
            <Card>
              <CardHeader>
                <CardTitle>Insumos</CardTitle>
                <CardDescription>Lista de todos los insumos en el inventario</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">Cargando insumos...</div>
                ) : (
                  <SuppliesList
                    items={items.filter(item => {
                      const cat = item.category?.toLowerCase() || "";
                      const type = item.type?.toLowerCase() || "";
                      return cat.includes("insumo") || type === "insumo";
                    })}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    transactions={transactions}
                    settings={settings}
                    lowStockThreshold={settings.lowStockThreshold}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                    onEditItem={handleEditItem}
                    openViewDialog={handleViewItemDetails}
                    openTransactionDialog={openTransactionDialog}
                    onViewHistory={handleViewHistory}
                    onAddItem={handleAddItem}
                    getAvailableQuantity={getAvailableQuantity}
                    getLoanedQuantity={getLoanedQuantity}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventario">
            <Card>
              <CardHeader>
                <CardTitle>Inventario Completo</CardTitle>
                <CardDescription>Gestión de herramientas e insumos</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">Cargando inventario...</div>
                ) : (
                  <ItemsList
                    items={items}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onUpdateItem={handleUpdateItem}
                    openEditDialog={handleEditItem}
                    openHistoryDialog={handleViewHistory}
                    openViewDialog={handleViewItemDetails}
                    openTransactionDialog={openTransactionDialog}
                    transactions={transactions}
                    lowStockThreshold={settings.lowStockThreshold}
                    settings={settings}
                    onAddItem={handleAddItem}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prestamos">
            <Card>
              <CardHeader>
                <CardTitle>Préstamos</CardTitle>
                <CardDescription>Gestión de préstamos y devoluciones</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">Cargando préstamos...</div>
                ) : (
                  <TransactionsList
                    transactions={transactions}
                    onMarkReturned={handleMarkReturned}
                    onExtendLoan={handleExtendLoan}
                    onUpdateReturnDate={handleUpdateReturnDate}
                    onViewDetails={handleViewTransactionDetails}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SystemSettingsManager settings={settings} onUpdateSettings={handleUpdateSettings} />
              <TeachersManager />
              <CategoriesManager />
              <LocationsManager />
              <SourcesManager />
              <ConditionsManager />
            </div>
          </TabsContent>
        </Tabs>

        {/* Modales para historial y detalles */}
        {selectedItem && isEditOpen && (
          <EditItemForm
            item={selectedItem}
            onUpdateItem={handleUpdateItem}
            onClose={() => setIsEditOpen(false)}
            lowStockThreshold={settings.lowStockThreshold}
          />
        )}
        {selectedItem && isTransactionOpen && (
          <Dialog open={true} onOpenChange={() => setIsTransactionOpen(false)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nueva Transacción</DialogTitle>
                <DialogDescription>Registrar préstamo o donación para {selectedItem.name}</DialogDescription>
              </DialogHeader>
              <TransactionForm
                item={selectedItem}
                onSubmit={handleSubmitTransaction}
                onCancel={() => setIsTransactionOpen(false)}
                isSubmitting={isSubmittingTx}
              />
            </DialogContent>
          </Dialog>
        )}
        <ItemDetailsDialog
          item={selectedItem}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
        <ToolHistoryModal
          item={selectedItem}
          transactions={transactions}
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />

        <TransactionDetailsDialog
          transaction={selectedTransaction}
          isOpen={isTransactionDetailsOpen}
          onClose={() => setIsTransactionDetailsOpen(false)}
        />
      </div>
    </div>
  )
}