"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Package, Wrench, DollarSign, ArrowUpDown, Filter, Eye, History, Hammer, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddItemForm from "./add-item-form"
import { Item, Transaction } from "@/src/types/inventory.types"
import type { AppSettings } from "@/app/page"

interface ToolsListProps {
  items: Item[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onUpdateItem: (id: string, updates: Partial<Item>) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
  openEditDialog: (item: Item) => void
  openViewDialog: (item: Item) => void
  openTransactionDialog: (item: Item) => void
  openHistoryDialog: (item: Item) => void
  transactions: Transaction[]
  lowStockThreshold: number
  settings: AppSettings
  onAddItem: (item: Omit<Item, "id">) => Promise<void>
  getLoanedQuantity: (itemId: string) => number
  getAvailableQuantity: (item: Item) => number
}

type SortField = "name" | "category" | "quantity" | "type" | "brand" | "condition" | "location" | "cost" | "available" | "loaned"
type SortDirection = "asc" | "desc"

const ToolsList: React.FC<ToolsListProps> = ({
  items,
  searchTerm,
  onSearchChange,
  onUpdateItem,
  onDeleteItem,
  openEditDialog,
  openViewDialog,
  openTransactionDialog,
  openHistoryDialog,
  transactions,
  lowStockThreshold,
  settings,
  onAddItem,
  getLoanedQuantity,
  getAvailableQuantity,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Filtrar y ordenar herramientas
  const filteredAndSortedTools = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || item.type === typeFilter
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesType && matchesCategory && matchesStatus
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
    typeFilter,
    categoryFilter,
    statusFilter,
    sortField,
    sortDirection,
    getLoanedQuantity,
    getAvailableQuantity,
  ])

  // Estadísticas
  const stats = useMemo(() => {
    const filteredItems = typeFilter === 'all' 
      ? items 
      : items.filter(item => item.type === typeFilter);
      
    const totalTools = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = filteredItems.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
    const lowStockItems = filteredItems.filter(
      (item) => item.quantity < lowStockThreshold && item.quantity > 0
    ).length
    const outOfStockItems = filteredItems.filter((item) => item.quantity === 0).length

    return {
      totalTools,
      totalValue,
      lowStockItems,
      outOfStockItems,
    }
  }, [items, lowStockThreshold, typeFilter])

  // Obtener categorías únicas basadas en el filtro de tipo
  const categories = useMemo(() => {
    const filteredItems = typeFilter === 'all' 
      ? items 
      : items.filter(item => item.type === typeFilter);
      
    const uniqueCategories = [...new Set(filteredItems.map((item) => item.category))].sort()
    return uniqueCategories
  }, [items, typeFilter])

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

  // Crear el componente SortButton
  const SortButton = ({ 
    field, 
    children, 
    onSort 
  }: { 
    field: SortField; 
    children: React.ReactNode;
    onSort: (field: SortField) => void;
  }) => {
    const handleClick = () => onSort(field);
    
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

  // Renderizado principal
  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar herramientas..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="herramienta">Herramientas</SelectItem>
              <SelectItem value="insumo">Insumos</SelectItem>
            </SelectContent>
          </Select>
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
            <div className="text-2xl font-bold">{stats.totalTools}</div>
            <p className="text-xs text-muted-foreground">{filteredAndSortedTools.length} mostrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString('es-AR')}</div>
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
              <CardTitle>
                {typeFilter === 'all' 
                  ? 'Todos los ítems' 
                  : typeFilter === 'herramienta' 
                    ? 'Herramientas' 
                    : 'Insumos'}
              </CardTitle>
              <CardDescription>
                {typeFilter === 'all' 
                  ? 'Lista de todos los ítems en el inventario' 
                  : typeFilter === 'herramienta' 
                    ? 'Lista de herramientas en el inventario' 
                    : 'Lista de insumos en el inventario'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AddItemForm onAddItem={onAddItem} defaultType={typeFilter === 'herramienta' ? 'herramienta' : 'insumo'} />
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
                {filteredAndSortedTools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      No se encontraron herramientas que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTools.map((item) => (
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
                                <Button variant="ghost" size="sm" aria-label="Ver detalles" onClick={() => openViewDialog(item)} className="gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden lg:inline">Ver detalles</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalles completos</TooltipContent>
                            </Tooltip>

                            {/* Botón Editar */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" aria-label="Editar" onClick={() => openEditDialog(item)} className="gap-1">
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
                                  onClick={() => openTransactionDialog(item)}
                                  disabled={item.status === 'dado_de_baja' as any}
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
                                <Button variant="ghost" size="sm" aria-label="Ver historial" onClick={() => openHistoryDialog(item)} className="gap-1">
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
        </CardContent>
      </Card>
    </div>
  );
};

// Exportar el componente memoizado
export default React.memo(ToolsList);

"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, History, Wrench, Package, DollarSign, ArrowUpDown, Filter } from "lucide-react"
import AddItemForm from "./add-item-form"
import type { Item, Transaction, AppSettings } from "@/app/page"

interface ToolsListProps {
  items: Item[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onUpdateItem: (id: string, updates: Partial<Item>) => Promise<void>
  onEditItem: (item: Item) => void
  onViewHistory: (item: Item) => void
  transactions: Transaction[]
  settings: AppSettings
  onAddItem: (item: Omit<Item, "id">) => Promise<void>
  getLoanedQuantity: (itemId: string) => number
  getAvailableQuantity: (item: Item) => number
}

type SortField = "name" | "category" | "quantity" | "available" | "loaned" | "brand" | "condition" | "location" | "cost"
type SortDirection = "asc" | "desc"

export default function ToolsList({
  items,
  searchTerm,
  onSearchChange,
  onUpdateItem,
  onEditItem,
  onViewHistory,
  transactions,
  settings,
  onAddItem,
  getLoanedQuantity,
  getAvailableQuantity,
}: ToolsListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Filtrar y ordenar herramientas
  const filteredAndSortedTools = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter

      return matchesSearch && matchesCategory && matchesCondition
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
    conditionFilter,
    sortField,
    sortDirection,
    getLoanedQuantity,
    getAvailableQuantity,
  ])

  // Estadísticas
  const stats = useMemo(() => {
    const totalTools = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAvailable = items.reduce((sum, item) => sum + getAvailableQuantity(item), 0)
    const totalLoaned = items.reduce((sum, item) => sum + getLoanedQuantity(item.id), 0)
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)

    return {
      totalTools,
      totalAvailable,
      totalLoaned,
      totalValue,
    }
  }, [items, getLoanedQuantity, getAvailableQuantity])

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

  const getConditionBadge = (condition: string) => {
    const variants = {
      nuevo: "default",
      usado: "secondary",
      regular: "outline",
      malo: "destructive",
    } as const

    const colors = {
      nuevo: "bg-green-100 text-green-800 border-green-300",
      usado: "bg-blue-100 text-blue-800 border-blue-300",
      regular: "bg-yellow-100 text-yellow-800 border-yellow-300",
      malo: "bg-red-100 text-red-800 border-red-300",
    } as const

    return (
      <Badge
        variant={variants[condition as keyof typeof variants] || "outline"}
        className={colors[condition as keyof typeof colors]}
      >
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
            <CardTitle className="text-sm font-medium">Total Herramientas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTools}</div>
            <p className="text-xs text-muted-foreground">{filteredAndSortedTools.length} mostradas</p>
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
            <CardTitle className="text-sm font-medium">Prestadas</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalLoaned}</div>
            <p className="text-xs text-muted-foreground">En préstamo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Inventario</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Herramientas ({filteredAndSortedTools.length})
              </CardTitle>
              <CardDescription>Gestiona el inventario de herramientas del pañol</CardDescription>
            </div>
            <AddItemForm onAddItem={onAddItem} settings={settings} defaultType="herramienta" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar herramientas..."
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

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="malo">Malo</SelectItem>
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
                    <SortButton field="loaned">Prestadas</SortButton>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortButton field="cost">Costo</SortButton>
                  </TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTools.map((item) => {
                  const availableQuantity = getAvailableQuantity(item)
                  const loanedQuantity = getLoanedQuantity(item.id)

                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewHistory(item)}
                    >
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
                      <TableCell className="text-center">{item.cost ? `$${item.cost.toFixed(2)}` : "-"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditItem(item)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onViewHistory(item)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedTools.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron herramientas</p>
              <p className="text-sm">
                {searchTerm || categoryFilter !== "all" || conditionFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Agrega herramientas para comenzar"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
