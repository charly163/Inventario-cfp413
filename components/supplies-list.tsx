"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Package2, Package, ArrowUpDown, Filter, AlertTriangle } from "lucide-react"
import AddItemForm from "./add-item-form"
import type { Item, Transaction, AppSettings } from "@/app/page"

interface SuppliesListProps {
  items: Item[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onUpdateItem: (id: string, updates: Partial<Item>) => Promise<void>
  onEditItem: (item: Item) => void
  transactions: Transaction[]
  lowStockThreshold: number
  settings: AppSettings
  onAddItem: (item: Omit<Item, "id">) => Promise<void>
  getLoanedQuantity: (itemId: string) => number
  getAvailableQuantity: (item: Item) => number
}

type SortField = "name" | "category" | "quantity" | "available" | "loaned" | "brand" | "condition" | "location" | "cost"
type SortDirection = "asc" | "desc"

export default function SuppliesList({
  items,
  searchTerm,
  onSearchChange,
  onUpdateItem,
  onEditItem,
  transactions,
  lowStockThreshold,
  settings,
  onAddItem,
  getLoanedQuantity,
  getAvailableQuantity,
}: SuppliesListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Filtrar y ordenar insumos
  const filteredAndSortedSupplies = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "category":
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case "quantity":
          aValue = a.quantity
          bValue = b.quantity
          break
        case "available":
          aValue = getAvailableQuantity(a)
          bValue = getAvailableQuantity(b)
          break
        case "loaned":
          aValue = getLoanedQuantity(a.id)
          bValue = getLoanedQuantity(b.id)
          break
        case "brand":
          aValue = (a.brand || "").toLowerCase()
          bValue = (b.brand || "").toLowerCase()
          break
        case "condition":
          aValue = a.condition
          bValue = b.condition
          break
        case "location":
          aValue = (a.location || "").toLowerCase()
          bValue = (b.location || "").toLowerCase()
          break
        case "cost":
          aValue = a.cost || 0
          bValue = b.cost || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [
    items,
    searchTerm,
    categoryFilter,
    statusFilter,
    sortField,
    sortDirection,
    getLoanedQuantity,
    getAvailableQuantity,
  ])

  // Estadísticas
  const stats = useMemo(() => {
    const totalSupplies = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAvailable = items.reduce((sum, item) => sum + getAvailableQuantity(item), 0)
    const totalLoaned = items.reduce((sum, item) => sum + getLoanedQuantity(item.id), 0)
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
    const lowStockItems = items.filter((item) => item.quantity < lowStockThreshold && item.quantity > 0).length
    const outOfStockItems = items.filter((item) => item.quantity === 0).length

    return {
      totalSupplies,
      totalAvailable,
      totalLoaned,
      totalValue,
      lowStockItems,
      outOfStockItems,
    }
  }, [items, getLoanedQuantity, getAvailableQuantity, lowStockThreshold])

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(items.map((item) => item.category))].sort()
    return uniqueCategories
  }, [items])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (item: Item) => {
    switch (item.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Normal</Badge>
      case "low-stock":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Stock Bajo
          </Badge>
        )
      case "out-of-stock":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Sin Stock
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getConditionBadge = (condition: string) => {
    const variants = {
      nuevo: "bg-green-100 text-green-800 border-green-300",
      usado: "bg-blue-100 text-blue-800 border-blue-300",
      regular: "bg-yellow-100 text-yellow-800 border-yellow-300",
      malo: "bg-red-100 text-red-800 border-red-300",
    }

    return (
      <Badge variant="outline" className={variants[condition as keyof typeof variants]}>
        {condition}
      </Badge>
    )
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={() => handleSort(field)}>
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </Button>
  )

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insumos</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSupplies}</div>
            <p className="text-xs text-muted-foreground">{filteredAndSortedSupplies.length} mostrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalAvailable}</div>
            <p className="text-xs text-muted-foreground">En pañol</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uso</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalLoaned}</div>
            <p className="text-xs text-muted-foreground">Prestados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems + stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Insumos ({filteredAndSortedSupplies.length})
              </CardTitle>
              <CardDescription>Gestiona los insumos y materiales consumibles</CardDescription>
            </div>
            <AddItemForm onAddItem={onAddItem} settings={settings} defaultType="insumo" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Normal</SelectItem>
                  <SelectItem value="low-stock">Stock Bajo</SelectItem>
                  <SelectItem value="out-of-stock">Sin Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="name">Nombre</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="category">Categoría</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="brand">Marca</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="condition">Condición</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="location">Ubicación</SortButton>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortButton field="quantity">Total</SortButton>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortButton field="available">Disponible</SortButton>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortButton field="loaned">En Uso</SortButton>
                  </TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSupplies.map((item) => {
                  const availableQuantity = getAvailableQuantity(item)
                  const loanedQuantity = getLoanedQuantity(item.id)

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.brand || "-"}</TableCell>
                      <TableCell>{getConditionBadge(item.condition)}</TableCell>
                      <TableCell>{item.location || "-"}</TableCell>
                      <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={availableQuantity > 0 ? "default" : "secondary"}
                          className={
                            availableQuantity > 0
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          }
                        >
                          {availableQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {loanedQuantity > 0 ? (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                            {loanedQuantity}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(item)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => onEditItem(item)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedSupplies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron insumos</p>
              <p className="text-sm">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Agrega insumos para comenzar"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
