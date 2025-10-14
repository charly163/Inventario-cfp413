"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { History, Calendar, User, Package, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { format, parseISO, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import { Item, Transaction } from "@/src/types/inventory.types"

interface ToolHistoryModalProps {
  item: Item | null
  transactions: Transaction[]
  isOpen: boolean
  onClose: () => void
}

export default function ToolHistoryModal({ item, transactions, isOpen, onClose }: ToolHistoryModalProps) {
  // Filtrar transacciones para este artículo
  const itemTransactions = useMemo(() => {
    if (!item) return []

    return transactions
      .filter((transaction) => (transaction.itemId === item.id || transaction.item_id === item.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [item, transactions])

  // Estadísticas del artículo
  const stats = useMemo(() => {
    if (!item || itemTransactions.length === 0) {
      return {
        totalLoans: 0,
        totalDonations: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalQuantityLoaned: 0,
        totalQuantityDonated: 0,
        currentlyLoaned: 0,
      }
    }

    // Filtrar transacciones de préstamos (tipo 'prestamo')
    const loans = itemTransactions.filter((t) => t.type === 'prestamo')
    // Filtrar transacciones de donaciones (tipo 'entrada' con notas que indiquen donación)
    const donations = itemTransactions.filter((t) => t.type === 'entrada' && t.notes?.toLowerCase().includes('donación'))
    // Préstamos activos (tipo 'prestamo' con estado 'activo')
    const activeLoans = loans.filter((t) => t.status === 'activo')
    // Préstamos vencidos (tipo 'prestamo' con estado 'vencido' o fecha de retorno pasada)
    const overdueLoans = loans.filter((t) => 
      t.status === 'vencido' || 
      (t.return_date && isAfter(new Date(), parseISO(t.return_date)))
    )

    // Calcular cantidades totales
    const totalQuantityLoaned = loans.reduce((sum, t) => sum + (t.quantity || 0), 0)
    const totalQuantityDonated = donations.reduce((sum, t) => sum + (t.quantity || 0), 0)
    const currentlyLoaned = activeLoans.reduce((sum, t) => sum + (t.quantity || 0), 0)

    return {
      totalLoans: loans.length,
      totalDonations: donations.length,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      totalQuantityLoaned,
      totalQuantityDonated,
      currentlyLoaned,
    }
  }, [item, itemTransactions])

  const getStatusBadge = (transaction: Transaction) => {
    // Mostrar etiqueta de donación para entradas con notas de donación
    if (transaction.type === 'entrada' && transaction.notes?.toLowerCase().includes('donación')) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Donación</Badge>
    }

    // Mostrar etiqueta de entrada/salida para otros tipos de transacciones
    if (transaction.type === 'entrada') {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Entrada</Badge>
    }
    if (transaction.type === 'salida') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Salida</Badge>
    }

    // Para préstamos, mostrar el estado correspondiente
    if (transaction.type === 'prestamo') {
      // Verificar si está vencido
      const isOverdue = transaction.return_date && isAfter(new Date(), parseISO(transaction.return_date))
      
      if (isOverdue || transaction.status === 'vencido') {
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 animate-pulse">
            <AlertCircle className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        )
      }
      
      if (transaction.status === 'activo' || transaction.status === 'pendiente') {
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        )
      }
      
      if (transaction.status === 'completado' || transaction.notes?.toLowerCase().includes('devuelto')) {
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Devuelto
          </Badge>
        )
      }
    }
    
    // Estado por defecto
    return <Badge variant="outline">{transaction.status || 'Desconocido'}</Badge>
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de {item.name}
          </DialogTitle>
          <DialogDescription>Registro completo de préstamos y donaciones de este artículo</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del artículo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Artículo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Nombre:</span> {item.name}
                </div>
                <div>
                  <span className="font-medium">Categoría:</span> {item.category}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span>{" "}
                  <Badge variant="outline" className={item.type === "herramienta" ? "bg-blue-50" : "bg-green-50"}>
                    {item.type}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Stock actual:</span> {item.quantity} unidades
                </div>
              </div>
              <div className="space-y-2">
                {item.brand && (
                  <div>
                    <span className="font-medium">Marca:</span> {item.brand}
                  </div>
                )}
                {item.location && (
                  <div>
                    <span className="font-medium">Ubicación:</span> {item.location}
                  </div>
                )}
                <div>
                  <span className="font-medium">Condición:</span>{" "}
                  <Badge
                    variant="outline"
                    className={
                      item.condition === "nuevo"
                        ? "bg-green-50 text-green-700"
                        : item.condition === "usado"
                          ? "bg-blue-50 text-blue-700"
                          : item.condition === "regular"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                    }
                  >
                    {item.condition}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Actualmente prestado:</span> {stats.currentlyLoaned} unidades
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLoans}</div>
                <p className="text-xs text-muted-foreground">{stats.totalQuantityLoaned} unidades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Donaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDonations}</div>
                <p className="text-xs text-muted-foreground">{stats.totalQuantityDonated} unidades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.activeLoans}</div>
                <p className="text-xs text-muted-foreground">{stats.currentlyLoaned} unidades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueLoans}</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Historial de transacciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historial de Transacciones ({itemTransactions.length})
              </CardTitle>
              <CardDescription>Registro cronológico de todos los préstamos y donaciones</CardDescription>
            </CardHeader>
            <CardContent>
              {itemTransactions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Profesor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead>Devolución</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(parseISO(transaction.date), "dd/MM/yyyy", { locale: es })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {transaction.teacherName || transaction.teacher_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === "loan" ? "default" : "secondary"}>
                              {transaction.type === "loan" ? "Préstamo" : "Donación"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {transaction.quantity}
                            </div>
                          </TableCell>
                          <TableCell>
                            {transaction.returnDate ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(parseISO(transaction.returnDate), "dd/MM/yyyy", { locale: es })}
                              </div>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Sin historial</p>
                  <p className="text-sm">Este artículo no tiene transacciones registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
