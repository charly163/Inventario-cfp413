"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { FileText, Download, CalendarIcon, TrendingUp, Package, Users, AlertTriangle, Wrench } from "lucide-react"
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import type { Item, Transaction, Disposal } from "@/types/inventory.types"

interface ReportsSectionProps {
  items: Item[]
  transactions: Transaction[]
  disposals: Disposal[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function ReportsSection({ items, transactions, disposals }: ReportsSectionProps) {
  const [reportType, setReportType] = useState("overview")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filtrar datos por rango de fechas
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.date)
      return isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to })
    })
  }, [transactions, dateRange])

  const filteredDisposals = useMemo(() => {
    return disposals.filter((disposal) => {
      const disposalDate = parseISO(disposal.date)
      return isWithinInterval(disposalDate, { start: dateRange.from, end: dateRange.to })
    })
  }, [disposals, dateRange])

  // Datos para gráficos
  const categoryData = useMemo(() => {
    const categoryCount = items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.quantity
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }))
  }, [items])

  const typeData = useMemo(() => {
    const herramientas = items
      .filter((item) => item.type === "herramienta")
      .reduce((sum, item) => sum + item.quantity, 0)
    const insumos = items.filter((item) => item.type === "insumo").reduce((sum, item) => sum + item.quantity, 0)

    return [
      { name: "Herramientas", value: herramientas },
      { name: "Insumos", value: insumos },
    ]
  }, [items])

  const transactionTrends = useMemo(() => {
    const monthlyData: Record<string, { loans: number; donations: number }> = {}

    filteredTransactions.forEach((transaction) => {
      const month = format(parseISO(transaction.date), "MMM yyyy", { locale: es })
      if (!monthlyData[month]) {
        monthlyData[month] = { loans: 0, donations: 0 }
      }
      if (transaction.type === "loan") {
        monthlyData[month].loans += transaction.quantity
      } else {
        monthlyData[month].donations += transaction.quantity
      }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      préstamos: data.loans,
      donaciones: data.donations,
    }))
  }, [filteredTransactions])

  // Estadísticas generales
  const stats = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
    const activeLoans = transactions.filter((t) => t.status === "active" && t.type === "loan").length
    const overdueLoans = transactions.filter((t) => t.status === "overdue").length
    const lowStockItems = items.filter((item) => item.status === "low-stock").length
    const outOfStockItems = items.filter((item) => item.status === "out-of-stock").length

    return {
      totalItems,
      totalValue,
      activeLoans,
      overdueLoans,
      lowStockItems,
      outOfStockItems,
    }
  }, [items, transactions])

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      toast.error("No hay datos para exportar")
      return
    }

    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row) => Object.values(row).join(","))
    const csvContent = [headers, ...rows].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Reporte exportado correctamente")
  }

  const exportInventoryReport = () => {
    const reportData = items.map((item) => ({
      Nombre: item.name,
      Tipo: item.type,
      Categoría: item.category,
      Cantidad: item.quantity,
      Estado: item.status,
      Marca: item.brand || "",
      Condición: item.condition,
      Ubicación: item.location || "",
      Costo: item.cost || 0,
      "Fecha Adquisición": item.acquisitionDate,
      Fuente: item.source,
    }))

    exportToCSV(reportData, `inventario_${format(new Date(), "yyyy-MM-dd")}`)
  }

  const exportTransactionsReport = () => {
    const reportData = filteredTransactions.map((transaction) => ({
      Artículo: transaction.itemName,
      Profesor: transaction.teacherName,
      Cantidad: transaction.quantity,
      Tipo: transaction.type === "loan" ? "Préstamo" : "Donación",
      Fecha: transaction.date,
      "Fecha Devolución": transaction.returnDate || "",
      Estado: transaction.status,
      Notas: transaction.notes || "",
    }))

    exportToCSV(
      reportData,
      `transacciones_${format(dateRange.from, "yyyy-MM-dd")}_${format(dateRange.to, "yyyy-MM-dd")}`,
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reportes y Estadísticas
          </CardTitle>
          <CardDescription>Analiza el rendimiento y estado del inventario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Resumen General</SelectItem>
                <SelectItem value="inventory">Inventario</SelectItem>
                <SelectItem value="transactions">Transacciones</SelectItem>
                <SelectItem value="disposals">Bajas</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <CalendarIcon className="h-4 w-4" />
                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to })
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button onClick={exportInventoryReport} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar Inventario
              </Button>

              <Button onClick={exportTransactionsReport} variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Exportar Transacciones
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      {reportType === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">En inventario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Number(stats.totalValue).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Valor del inventario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLoans}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueLoans > 0 && <span className="text-red-600">{stats.overdueLoans} vencidos</span>}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.lowStockItems + stats.outOfStockItems}</div>
                <p className="text-xs text-muted-foreground">Stock bajo/agotado</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Artículos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {transactionTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Transacciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transactionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="préstamos" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="donaciones" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Reporte de Inventario */}
      {reportType === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Inventario</CardTitle>
            <CardDescription>Estado actual de todos los artículos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artículo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={item.type === "herramienta" ? "bg-blue-50" : "bg-green-50"}>
                          {item.type === "herramienta" ? (
                            <Wrench className="h-3 w-3 mr-1" />
                          ) : (
                            <Package className="h-3 w-3 mr-1" />
                          )}
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={item.status === "active" ? "default" : "destructive"}
                          className={
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : item.status === "low-stock"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {item.status === "active"
                            ? "Activo"
                            : item.status === "low-stock"
                              ? "Stock Bajo"
                              : "Sin Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.cost ? `$${(Number(item.cost) * Number(item.quantity)).toFixed(2)}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporte de Transacciones */}
      {reportType === "transactions" && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Transacciones</CardTitle>
            <CardDescription>
              Transacciones del {format(dateRange.from, "dd/MM/yyyy")} al {format(dateRange.to, "dd/MM/yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.itemName}</TableCell>
                      <TableCell>{transaction.teacherName}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "loan" ? "default" : "secondary"}>
                          {transaction.type === "loan" ? "Préstamo" : "Donación"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{transaction.quantity}</TableCell>
                      <TableCell>{format(parseISO(transaction.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {transaction.returnDate ? format(parseISO(transaction.returnDate), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            transaction.status === "active"
                              ? "default"
                              : transaction.status === "returned"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {transaction.status === "active"
                            ? "Activo"
                            : transaction.status === "returned"
                              ? "Devuelto"
                              : "Vencido"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporte de Bajas */}
      {reportType === "disposals" && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Bajas</CardTitle>
            <CardDescription>
              Bajas registradas del {format(dateRange.from, "dd/MM/yyyy")} al {format(dateRange.to, "dd/MM/yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artículo</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisposals.map((disposal) => (
                    <TableRow key={disposal.id}>
                      <TableCell className="font-medium">{disposal.itemName}</TableCell>
                      <TableCell className="text-center">{disposal.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {disposal.reason === "damaged"
                            ? "Dañado"
                            : disposal.reason === "expired"
                              ? "Vencido"
                              : disposal.reason === "worn-out"
                                ? "Desgastado"
                                : disposal.reason === "obsolete"
                                  ? "Obsoleto"
                                  : "Otro"}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(parseISO(disposal.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{disposal.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
