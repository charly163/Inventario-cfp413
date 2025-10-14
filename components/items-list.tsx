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
import AddItemForm from "./add-item-form"
import { Item, Transaction } from "@/src/types/inventory.types"
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
  onAddItem: (item: Omit<Item, "id">) => Promise<void>
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
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

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
  }, [items, searchTerm, typeFilter, categoryFilter, statusFilter, sortField, sortDirection])

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
        return <Badge className="bg-green-100 text-green-800 border-green-300">Activo</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Stock Bajo</Badge>
      case "out-of-stock":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Sin Stock</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
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
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
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
            <AddItemForm onAddItem={onAddItem} settings={settings} />
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

            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
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
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
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
                    <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.cost ? `$${item.cost.toFixed(2)}` : "-"}</TableCell>
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
                                disabled={item.status === "dado_de_baja"}
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
