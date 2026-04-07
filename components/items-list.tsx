"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Package, Wrench, DollarSign, ArrowUpDown, Filter, Eye, History } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import AddItemForm from "./add-item-form"
import { Item, Transaction } from "@/types/inventory.types"
import type { AppSettings } from "@/app/page"

interface ItemsListProps {
  items: Item[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onUpdateItem: (id: string, updates: Partial<Item>) => Promise<void>
  openEditDialog: (item: Item) => void
  openViewDialog: (item: Item) => void
  openTransactionDialog: (item: Item) => void
  openHistoryDialog: (item: Item) => void
  transactions: Transaction[]
  lowStockThreshold: number
  settings: AppSettings
  onAddItem: (item: Omit<Item, "id" | "created_at" | "updated_at">) => Promise<void>
}

type SortField = "name" | "category" | "quantity" | "type" | "brand" | "condition" | "location" | "cost"
type SortDirection = "asc" | "desc"

export default function ItemsList({
  items,
  searchTerm,
  onSearchChange,
  onUpdateItem,
  openEditDialog,
  openViewDialog,
  openTransactionDialog,
  openHistoryDialog,
  transactions,
  lowStockThreshold,
  settings,
  onAddItem,
}: ItemsListProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [conditionFilter, setConditionFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Funciones para calcular cantidades disponibles y prestadas
  const getLoanedQuantity = (itemId: string): number => {
    return transactions
      .filter(t => (t.item_id || t.itemId) === itemId && t.status === "activo")
      .reduce((total, t) => total + t.quantity, 0)
  }

  const getAvailableQuantity = (item: Item): number => {
    return Math.max(0, item.quantity - getLoanedQuantity(item.id))
  }

  // Filtrar y ordenar items
  const filteredAndSortedItems = useMemo(() => {
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
      const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter
      const matchesLocation = locationFilter === "all" || item.location === locationFilter
      const matchesSource = sourceFilter === "all" || (item as any).source === sourceFilter

      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesCondition && matchesLocation && matchesSource
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
        case "type":
          aValue = a.type
          bValue = b.type
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
  }, [items, searchTerm, typeFilter, categoryFilter, statusFilter, conditionFilter, locationFilter, sourceFilter, sortField, sortDirection])

  // Estadísticas
  const stats = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
    const lowStockItems = items.filter(
      (item) => item.quantity < lowStockThreshold && item.quantity > 0 && item.type === "insumo",
    ).length
    const outOfStockItems = items.filter((item) => item.quantity === 0).length

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
    }
  }, [items, lowStockThreshold])

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(items.map((item) => item.category))].sort()
    return uniqueCategories
  }, [items])

  const conditions = useMemo(() => [...new Set(items.map(i => i.condition).filter(Boolean))].sort(), [items])
  const locations = useMemo(() => [...new Set(items.map(i => i.location).filter(Boolean))].sort(), [items])
  const sources = useMemo(() => [...new Set(items.map(i => (i as any).source).filter(Boolean))].sort(), [items])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (item: Item) => {
    const loaned = getLoanedQuantity(item.id)
    const available = getAvailableQuantity(item)
    
    if (item.quantity === 0) {
      if (transactions.some(t => (t.item_id === item.id || t.itemId === item.id) && t.type === 'salida')) {
         return <Badge className="bg-slate-100 text-slate-800 border-slate-300">Fuera por Donación/Baja</Badge>
      }
      return <Badge className="bg-red-100 text-red-800 border-red-300">Sin Stock</Badge>
    }
    
    if (loaned > 0) {
      if (available === 0) {
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Todo Prestado</Badge>
      }
      return (
        <div className="flex flex-col gap-1 items-center">
          <Badge className="bg-green-100 text-green-800 border-green-300 w-fit">Disponible</Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 w-fit">{loaned} Prestados</Badge>
        </div>
      )
    }

    if (item.quantity < lowStockThreshold && item.type === "insumo") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Stock Bajo</Badge>
    }
    
    return <Badge className="bg-green-100 text-green-800 border-green-300">En Taller</Badge>
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
            <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">{filteredAndSortedItems.length} mostrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(stats.totalValue).toFixed(2)}</div>
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
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Todos los Artículos ({filteredAndSortedItems.length})
              </CardTitle>
              <CardDescription>Gestiona todo el inventario del pañol</CardDescription>
            </div>
            <AddItemForm onAddItem={onAddItem} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="herramienta">Herramientas</SelectItem>
                    <SelectItem value="insumo">Insumos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Categoría</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Condición</Label>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {conditions.map((c: any) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Ubicación</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {locations.map((l: any) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fuente</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {sources.map((s: any) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="low-stock">Stock Bajo</SelectItem>
                    <SelectItem value="out-of-stock">Sin Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SortButton field="type">Tipo</SortButton>
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
                    <SortButton field="quantity">Cantidad</SortButton>
                  </TableHead>
                  <TableHead className="text-center">
                    <SortButton field="cost">Costo</SortButton>
                  </TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(item.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.brand || "-"}</TableCell>
                    <TableCell>{getConditionBadge(item.condition)}</TableCell>
                    <TableCell>{item.location || "-"}</TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col cursor-help items-center whitespace-nowrap">
                              <span className="font-bold">{item.quantity} unidades</span>
                              <span className={cn("text-[10px]", getAvailableQuantity(item) > 0 ? "text-green-600" : "text-red-500")}>
                                {getAvailableQuantity(item)} en taller
                              </span>
                              {getLoanedQuantity(item.id) > 0 && (
                                <span className="text-[10px] text-blue-600 font-medium">
                                  {getLoanedQuantity(item.id)} prestados
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="w-64">
                            <div className="text-xs space-y-2 p-1">
                              <p className="font-bold border-b pb-1">Distribución de {item.name}</p>
                              <div className="grid grid-cols-2 gap-1 mb-2">
                                <span>Stock Total:</span>
                                <span className="font-medium text-right">{item.quantity}</span>
                                <span className="text-green-600">En Taller:</span>
                                <span className="font-medium text-right text-green-600">{getAvailableQuantity(item)}</span>
                                <span className="text-blue-600">En Préstamo:</span>
                                <span className="font-medium text-right text-blue-600">{getLoanedQuantity(item.id)}</span>
                              </div>
                              
                              {getLoanedQuantity(item.id) > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="font-bold text-blue-700 mb-1">Responsables:</p>
                                  <ul className="space-y-1">
                                    {transactions
                                      .filter(t => (t.item_id === item.id || t.itemId === item.id) && t.status === "activo" && t.type === "prestamo")
                                      .map((t, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-blue-50 p-1 rounded">
                                          <span>{t.teacher_name || t.teacherName}</span>
                                          <Badge variant="outline" className="h-4 text-[10px] px-1">{t.quantity}</Badge>
                                        </li>
                                      ))
                                    }
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">{typeof item.cost === 'number' ? `$${item.cost.toFixed(2)}` : (item.cost ? `$${Number(item.cost).toFixed(2)}` : "-")}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(item)}</TableCell>
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
                                disabled={(item.status as any) === "dado_de_baja"}
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
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron artículos</p>
              <p className="text-sm">
                {searchTerm || typeFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Agrega artículos para comenzar"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
