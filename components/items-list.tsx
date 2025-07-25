"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  Package,
  DollarSign,
  Calendar,
  User,
  Clock,
  Wrench,
  Package2,
  Search,
  Filter,
  X,
  SortAsc,
} from "lucide-react"
import type { Item, Transaction, AppSettings } from "@/app/page"
import AddItemForm from "@/components/add-item-form"

interface ItemsListProps {
  items: Item[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onUpdateItem: (id: string, updates: Partial<Item>) => void
  onEditItem: (item: Item) => void
  transactions: Transaction[]
  lowStockThreshold: number
  settings: AppSettings
  onAddItem: (item: Item) => void
}

interface FilterState {
  category: string
  source: string
  type: string
  dateFrom: string
  dateTo: string
}

export default function ItemsList({
  items,
  searchTerm,
  onSearchChange,
  onUpdateItem,
  onEditItem,
  transactions,
  lowStockThreshold,
  settings,
  onAddItem,
}: ItemsListProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    source: "all",
    type: "all",
    dateFrom: "",
    dateTo: "",
  })
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "low-stock":
        return "destructive"
      case "out-of-stock":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusText = (item: Item) => {
    if (item.quantity === 0) return "Sin Stock"
    if (item.quantity < lowStockThreshold) return "Stock Bajo"
    return "En Stock"
  }

  // Función para obtener préstamos activos de un artículo
  const getActiveLoans = (itemId: string) => {
    return transactions.filter(
      (transaction) => transaction.itemId === itemId && transaction.type === "loan" && transaction.status === "active",
    )
  }

  // Función para calcular total de unidades prestadas
  const getTotalLoanedQuantity = (itemId: string) => {
    const activeLoans = getActiveLoans(itemId)
    return activeLoans.reduce((total, loan) => total + loan.quantity, 0)
  }

  // Función para filtrar artículos
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = filters.category === "all" || item.category === filters.category
    const matchesSource = filters.source === "all" || item.source === filters.source
    const matchesType = filters.type === "all" || item.type === filters.type

    const matchesDateFrom = !filters.dateFrom || new Date(item.acquisitionDate) >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || new Date(item.acquisitionDate) <= new Date(filters.dateTo)

    return matchesSearch && matchesCategory && matchesSource && matchesType && matchesDateFrom && matchesDateTo
  })

  // Ordenar artículos
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "category":
        comparison = a.category.localeCompare(b.category)
        break
      case "quantity":
        comparison = a.quantity - b.quantity
        break
      case "date":
        comparison = new Date(a.acquisitionDate).getTime() - new Date(b.acquisitionDate).getTime()
        break
      default:
        comparison = 0
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const clearFilters = () => {
    setFilters({
      category: "all",
      source: "all",
      type: "all",
      dateFrom: "",
      dateTo: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "all" && filter !== "")

  return (
    <div className="space-y-4">
      {/* Header with search and controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos por nombre, categoría, marca o ubicación..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "bg-blue-50 border-blue-300" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && <span className="ml-1 text-xs bg-blue-600 text-white rounded-full px-1">•</span>}
          </Button>
        </div>
        <AddItemForm onAddItem={onAddItem} settings={settings} />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {settings.categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Origen</label>
                <Select
                  value={filters.source}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {settings.sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="herramienta">Herramienta</SelectItem>
                    <SelectItem value="insumo">Insumo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha desde</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha hasta</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sorting and Results count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Mostrando {sortedItems.length} de {items.length} artículos
          {hasActiveFilters && " (filtrados)"}
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="category">Categoría</SelectItem>
              <SelectItem value="quantity">Cantidad</SelectItem>
              <SelectItem value="date">Fecha</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <SortAsc className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((item) => {
          const activeLoans = getActiveLoans(item.id)
          const totalLoaned = getTotalLoanedQuantity(item.id)

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.type === "herramienta" ? (
                        <Wrench className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Package2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEditItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image */}
                {item.image && (
                  <div className="mt-2">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.quantity} unidades</span>
                    {totalLoaned > 0 && (
                      <span className="text-sm text-muted-foreground">({totalLoaned} prestadas)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(getStatusText(item).toLowerCase().replace(" ", "-"))}>
                      {getStatusText(item)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>

                {/* Información de préstamos activos */}
                {activeLoans.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-blue-700">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">En Préstamo:</span>
                    </div>
                    {activeLoans.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-blue-800">{loan.teacherName}</p>
                          <div className="flex items-center gap-1 text-blue-600">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(loan.date).toLocaleDateString()}</span>
                            {loan.returnDate && (
                              <span className="text-xs">→ {new Date(loan.returnDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          {loan.quantity} unidades
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Información adicional del artículo */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.brand && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Marca:</span>
                      <span className="text-muted-foreground">{item.brand}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Estado:</span>
                    <Badge
                      variant={
                        item.condition === "nuevo"
                          ? "default"
                          : item.condition === "usado"
                            ? "secondary"
                            : item.condition === "regular"
                              ? "outline"
                              : "destructive"
                      }
                      className="text-xs"
                    >
                      {item.condition}
                    </Badge>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1 col-span-2">
                      <span className="font-medium">Ubicación:</span>
                      <span className="text-muted-foreground">{item.location}</span>
                    </div>
                  )}
                </div>

                {item.cost && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">${item.cost} c/u</span>
                    <span className="text-xs text-muted-foreground">
                      (Total: ${(item.cost * item.quantity).toFixed(2)})
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {item.source} el {new Date(item.acquisitionDate).toLocaleDateString()}
                  </span>
                </div>

                {item.description && <p className="text-sm text-muted-foreground border-t pt-2">{item.description}</p>}

                <div className="flex gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    {item.source}
                  </Badge>
                  {activeLoans.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeLoans.length} préstamo{activeLoans.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sortedItems.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "No se encontraron artículos con los filtros aplicados."
                  : "No hay artículos registrados aún."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 bg-transparent">
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
