'use client'

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Package2, Package, ArrowUpDown, Filter, AlertTriangle, Eye, History, Wrench, DollarSign, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AddItemForm from "./add-item-form"
import { Item, Transaction } from "@/types/inventory.types"
import type { AppSettings } from "@/app/page"

interface SuppliesListProps {
  items: Item[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onUpdateItem: (id: string, updates: Partial<Item>) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
  onEditItem: (item: Item) => void
  openViewDialog?: (item: Item) => void
  openTransactionDialog?: (item: Item) => void
  onViewHistory?: (item: Item) => void
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
  onDeleteItem,
  onEditItem,
  openViewDialog,
  openTransactionDialog,
  onViewHistory,
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
    if (item.quantity === 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Sin Stock</Badge>
    } else if (item.quantity < lowStockThreshold) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Stock Bajo</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Disponible</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "herramienta" ? (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
        <Wrench className="h-3 w-3 mr-1" />
        Herramienta
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        <Package className="h-3 w-3 mr-1" />
        Insumo
      </Badge>
    )
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

  const SortButton = ({ field, children, onSort }: { field: SortField; children: React.ReactNode; onSort: (field: SortField) => void }) => {
    const handleClick = () => onSort(field)

    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-auto p-0 font-medium" 
        onClick={handleClick}
      >
        <span className="flex items-center gap-1">
          {children}
          <ArrowUpDown className="h-3 w-3" />
        </span>
      </Button>
    );
  };

  const MemoizedSortButton = React.memo(SortButton);

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar insumos..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
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
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Disponible</SelectItem>
              <SelectItem value="low-stock">Stock Bajo</SelectItem>
              <SelectItem value="out-of-stock">Sin Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSupplies}</div>
            <p className="text-xs text-muted-foreground">{filteredAndSortedSupplies.length} mostrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">Inventario completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Insumos por reponer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Artículos agotados</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Insumos</CardTitle>
              <CardDescription>Lista de insumos en el inventario</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AddItemForm onAddItem={onAddItem} settings={settings} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="hidden md:table-cell">Marca</TableHead>
                  <TableHead className="hidden md:table-cell">Condición</TableHead>
                  <TableHead className="hidden md:table-cell">
                    <MemoizedSortButton field="location" onSort={handleSort}>
                      Ubicación
                    </MemoizedSortButton>
                  </TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="hidden md:table-cell">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSupplies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      No se encontraron insumos que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedSupplies.map((item) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[180px]">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getTypeBadge(item.type)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.brand || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.condition ? getConditionBadge(item.condition) : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.location || 'No especificada'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span>{item.quantity} unidades</span>
                          <span className="text-xs text-muted-foreground">
                            {getAvailableQuantity(item)} disponibles
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.cost ? `$${item.cost.toLocaleString('es-AR')}` : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getStatusBadge(item)}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            {/* Botón Ver Detalles */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" aria-label="Ver detalles" onClick={() => openViewDialog?.(item)} className="gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden lg:inline">Ver detalles</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalles completos</TooltipContent>
                            </Tooltip>

                            {/* Botón Editar */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" aria-label="Editar" onClick={() => onEditItem(item)} className="gap-1">
                                  <Edit className="h-4 w-4" />
                                  <span className="hidden lg:inline">Editar</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar datos</TooltipContent>
                            </Tooltip>

                            {/* Botón Transacción */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  aria-label="Nueva transacción"
                                  onClick={() => openTransactionDialog?.(item)}
                                  disabled={item.quantity === 0}
                                >
                                  <Package className="h-4 w-4" />
                                  <span className="hidden lg:inline">Transacción</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Nueva transacción</TooltipContent>
                            </Tooltip>

                            {/* Botón Historial */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" aria-label="Ver historial" onClick={() => onViewHistory?.(item)} className="gap-1">
                                  <History className="h-4 w-4" />
                                  <span className="hidden lg:inline">Historial</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver historial</TooltipContent>
                            </Tooltip>

                            {/* Botón Eliminar */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" aria-label="Eliminar" onClick={() => {
                                  if (window.confirm("¿Estás seguro de que quieres eliminar este ítem?")) {
                                    onDeleteItem(item.id);
                                  }
                                }} className="gap-1 text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden lg:inline">Eliminar</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar ítem</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
  );
}