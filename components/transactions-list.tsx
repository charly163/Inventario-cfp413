"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CheckCircle, Clock, AlertTriangle, CalendarIcon, User, Package, Edit, Filter, Trash2 } from "lucide-react"
import { format, parseISO, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Transaction } from "@/types/inventory.types"

interface TransactionsListProps {
  transactions: Transaction[]
  onMarkReturned: (transactionId: string) => Promise<void>
  onExtendLoan: (transactionId: string, newReturnDate: string) => Promise<void>
  onUpdateReturnDate: (transactionId: string, newReturnDate: string) => Promise<void>
  onViewDetails?: (transaction: Transaction) => void
  onDeleteTransaction: (transactionId: string) => Promise<void>
}

export default function TransactionsList({
  transactions,
  onMarkReturned,
  onExtendLoan,
  onUpdateReturnDate,
  onViewDetails,
  onDeleteTransaction,
}: TransactionsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [editingReturnDate, setEditingReturnDate] = useState<string | null>(null)
  const [newReturnDate, setNewReturnDate] = useState<Date>()

  // Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        (transaction.itemName || transaction.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.teacherName || transaction.teacher_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
      const matchesType = typeFilter === "all" || transaction.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [transactions, searchTerm, statusFilter, typeFilter])

  // Estadísticas
  const stats = useMemo(() => {
    const activeLoans = transactions.filter((t) => t.status === "activo" && t.type === "prestamo").length
    const overdueLoans = transactions.filter(
      (t) => {
        const returnDate = t.returnDate || t.return_date;
        return t.status === "vencido" ||
        (t.status === "activo" && returnDate && isAfter(new Date(), parseISO(returnDate)))
      },
    ).length
    const totalDonations = transactions.filter((t) => t.type === "entrada").length
    const returnedLoans = transactions.filter((t) => t.status === "completado").length

    return {
      activeLoans,
      overdueLoans,
      totalDonations,
      returnedLoans,
    }
  }, [transactions])

  const getStatusBadge = (transaction: Transaction) => {
    if (transaction.type === "entrada") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <Package className="h-3 w-3 mr-1" />
          Donación
        </Badge>
      )
    }

    // Verificar si está vencido
    const returnDate = transaction.returnDate || transaction.return_date;
    const isOverdue = returnDate && isAfter(new Date(), parseISO(returnDate));

    if (isOverdue && transaction.status === "activo") {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      )
    }

    switch (transaction.status) {
      case "activo":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )
      case "completado":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Devuelto
          </Badge>
        )
      case "vencido":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const handleUpdateReturnDate = async (transactionId: string) => {
    if (!newReturnDate) {
      toast.error("Selecciona una nueva fecha")
      return
    }

    try {
      await onUpdateReturnDate(transactionId, format(newReturnDate, "yyyy-MM-dd"))
      setEditingReturnDate(null)
      setNewReturnDate(undefined)
      toast.success("Fecha de devolución actualizada")
    } catch (error) {
      toast.error("Error al actualizar la fecha")
    }
  }

  const startEditingReturnDate = (transaction: Transaction) => {
    setEditingReturnDate(transaction.id)
    const returnDate = transaction.returnDate || transaction.return_date;
    setNewReturnDate(returnDate ? parseISO(returnDate) : new Date())
  }

  const cancelEditingReturnDate = () => {
    setEditingReturnDate(null)
    setNewReturnDate(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">En curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueLoans}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.returnedLoans}</div>
            <p className="text-xs text-muted-foreground">Completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donaciones</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalDonations}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de transacciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Transacciones ({filteredTransactions.length})
          </CardTitle>
          <CardDescription>Historial de préstamos y donaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por artículo, profesor o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="prestamo">Préstamos</SelectItem>
                  <SelectItem value="entrada">Donaciones</SelectItem>
                  <SelectItem value="devolucion">Devoluciones</SelectItem>
                  <SelectItem value="salida">Salidas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="completado">Devueltos</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Devolución</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const returnDate = transaction.returnDate || transaction.return_date;
                  const isOverdue = returnDate && isAfter(new Date(), parseISO(returnDate));
                  const canMarkReturned = transaction.type === "prestamo" && transaction.status === "activo"
                  const isEditingDate = editingReturnDate === transaction.id

                  return (
                    <TableRow key={transaction.id} className={isOverdue ? "bg-red-50" : ""}>
                      <TableCell className="font-medium">{transaction.itemName || transaction.item_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {transaction.teacherName || transaction.teacher_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "prestamo" ? "default" : "secondary"}>
                          {transaction.type === "prestamo" ? "Préstamo" : 
                           transaction.type === "entrada" ? "Donación" : 
                           transaction.type === "devolucion" ? "Devolución" : 
                           transaction.type === "salida" ? "Salida" : "Otro"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {transaction.quantity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {transaction.date ? format(parseISO(transaction.date), "dd/MM/yyyy", { locale: es }) : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {returnDate ? (
                          isEditingDate ? (
                            <div className="flex items-center gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                                    <CalendarIcon className="h-3 w-3" />
                                    {newReturnDate ? format(newReturnDate, "dd/MM/yyyy") : "Seleccionar"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={newReturnDate}
                                    onSelect={setNewReturnDate}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <Button size="sm" onClick={() => handleUpdateReturnDate(transaction.id)}>
                                ✓
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEditingReturnDate}>
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                                {format(parseISO(returnDate), "dd/MM/yyyy", { locale: es })}
                              </span>
                              {canMarkReturned && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditingReturnDate(transaction)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(transaction)}</TableCell>
                      <TableCell>
                        {transaction.notes ? (
                          <span className="text-sm text-muted-foreground" title={transaction.notes}>
                            {transaction.notes.length > 30
                              ? `${transaction.notes.substring(0, 30)}...`
                              : transaction.notes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex space-x-2 justify-center">
                          {canMarkReturned && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMarkReturned(transaction.id)}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Devolver
                            </Button>
                          )}
                          {onViewDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(transaction)}
                            >
                              Ver detalles
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("¿Estás seguro de que quieres eliminar esta transacción?")) {
                                onDeleteTransaction(transaction.id);
                              }
                            }}
                            className="gap-1 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron transacciones</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay transacciones registradas"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
