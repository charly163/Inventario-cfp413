"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, User, Package, ArrowRight, Search, SortAsc } from "lucide-react"
import type { Transaction } from "@/app/page"

interface TransactionsListProps {
  transactions: Transaction[]
  onMarkReturned?: (transactionId: string) => void
  onExtendLoan?: (transactionId: string, newReturnDate: string) => void
}

export default function TransactionsList({ transactions, onMarkReturned, onExtendLoan }: TransactionsListProps) {
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterBy, setFilterBy] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "returned":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "default"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "loan" ? "outline" : "secondary"
  }

  // Filtrar transacciones
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.teacherName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "loans" && transaction.type === "loan") ||
      (filterBy === "donations" && transaction.type === "donation") ||
      (filterBy === "active" && transaction.status === "active") ||
      (filterBy === "returned" && transaction.status === "returned") ||
      (filterBy === "overdue" && transaction.status === "overdue")

    return matchesSearch && matchesFilter
  })

  // Ordenar transacciones
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "teacher":
        comparison = a.teacherName.localeCompare(b.teacherName)
        break
      case "item":
        comparison = a.itemName.localeCompare(b.itemName)
        break
      case "quantity":
        comparison = a.quantity - b.quantity
        break
      case "status":
        comparison = a.status.localeCompare(b.status)
        break
      default:
        comparison = 0
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const handleMarkReturned = (transactionId: string) => {
    if (onMarkReturned) {
      onMarkReturned(transactionId)
    }
  }

  const handleExtendLoan = (transactionId: string) => {
    const today = new Date()
    const defaultDate = `${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear()}`

    const newReturnDate = prompt(`Ingrese la nueva fecha de devolución (DD-MM-YYYY):`, defaultDate)
    if (newReturnDate && onExtendLoan) {
      // Convertir DD-MM-YYYY a YYYY-MM-DD para almacenamiento
      const [day, month, year] = newReturnDate.split("-")
      const isoDate = `${year}-${month}-${day}`
      onExtendLoan(transactionId, isoDate)
    }
  }

  return (
    <div className="space-y-4">
      {/* Controles de filtrado y ordenamiento */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por artículo o profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="loans">Préstamos</SelectItem>
              <SelectItem value="donations">Donaciones</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="returned">Devueltos</SelectItem>
              <SelectItem value="overdue">Vencidos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="teacher">Profesor</SelectItem>
              <SelectItem value="item">Artículo</SelectItem>
              <SelectItem value="quantity">Cantidad</SelectItem>
              <SelectItem value="status">Estado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <SortAsc className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Lista de transacciones */}
      {sortedTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || filterBy !== "all"
                ? "No se encontraron transacciones con los filtros aplicados."
                : "No se han registrado transacciones aún."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{transaction.itemName}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getTypeColor(transaction.type)}>
                      {transaction.type === "loan" ? "préstamo" : "donación"}
                    </Badge>
                    <Badge variant={getStatusColor(transaction.status)}>
                      {transaction.status === "active"
                        ? "activo"
                        : transaction.status === "returned"
                          ? "devuelto"
                          : transaction.status === "overdue"
                            ? "vencido"
                            : transaction.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{transaction.teacherName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{transaction.quantity} unidades</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
                  {transaction.returnDate && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{new Date(transaction.returnDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>

                {transaction.notes && (
                  <p className="text-sm text-muted-foreground border-t pt-2">{transaction.notes}</p>
                )}

                {transaction.type === "loan" && transaction.status === "active" && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleMarkReturned(transaction.id)}>
                      Marcar Devuelto
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleExtendLoan(transaction.id)}>
                      Extender Préstamo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        Mostrando {sortedTransactions.length} de {transactions.length} transacciones
      </div>
    </div>
  )
}
