"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react"
import type { Item, Transaction, Disposal } from "@/app/page"

interface ReportsSectionProps {
  items: Item[]
  transactions: Transaction[]
  disposals: Disposal[]
}

export default function ReportsSection({ items, transactions, disposals }: ReportsSectionProps) {
  // Calculate statistics
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0)
  const donatedItems = items.filter((item) => item.source === "DONACIONES").length
  const purchasedItems = items.filter((item) => item.source !== "DONACIONES").length

  const activeLoans = transactions.filter((t) => t.status === "active" && t.type === "loan")
  const totalLoaned = activeLoans.reduce((sum, t) => sum + t.quantity, 0)

  const totalDisposed = disposals.reduce((sum, d) => sum + d.quantity, 0)
  const disposalReasons = disposals.reduce(
    (acc, d) => {
      const reasonText = getReasonText(d.reason)
      acc[reasonText] = (acc[reasonText] || 0) + d.quantity
      return acc
    },
    {} as Record<string, number>,
  )

  // Category breakdown
  const categoryStats = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0 }
      }
      acc[item.category].count += item.quantity
      acc[item.category].value += (item.cost || 0) * item.quantity
      return acc
    },
    {} as Record<string, { count: number; value: number }>,
  )

  // Recent activity
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const recentDisposals = disposals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  function getReasonText(reason: string) {
    switch (reason) {
      case "damaged":
        return "Dañado"
      case "expired":
        return "Vencido"
      case "worn-out":
        return "Desgastado"
      case "obsolete":
        return "Obsoleto"
      case "other":
        return "Otro"
      default:
        return reason
    }
  }

  const exportReport = () => {
    // Crear datos del reporte
    const reportData = {
      fecha: new Date().toLocaleDateString(),
      resumen: {
        totalArticulos: totalItems,
        valorTotal: totalValue,
        articulosDonados: donatedItems,
        articulosComprados: purchasedItems,
        prestamosActivos: activeLoans.length,
        totalPrestado: totalLoaned,
        totalDadosDeBaja: totalDisposed,
      },
      categorias: categoryStats,
      razonesDesBaja: disposalReasons,
      transaccionesRecientes: recentTransactions.map((t) => ({
        articulo: t.itemName,
        profesor: t.teacherName,
        cantidad: t.quantity,
        tipo: t.type === "loan" ? "Préstamo" : "Donación",
        fecha: new Date(t.date).toLocaleDateString(),
        estado: t.status === "active" ? "Activo" : t.status === "returned" ? "Devuelto" : "Vencido",
      })),
      bajasRecientes: recentDisposals.map((d) => ({
        articulo: d.itemName,
        cantidad: d.quantity,
        razon: getReasonText(d.reason),
        fecha: new Date(d.date).toLocaleDateString(),
        notas: d.notes || "",
      })),
    }

    // Convertir a CSV
    const csvContent = generateCSV(reportData)

    // Descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `reporte_inventario_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateCSV = (data: any) => {
    let csv = "REPORTE DE INVENTARIO - CFP 413\n"
    csv += `Fecha de generación: ${data.fecha}\n\n`

    // Resumen
    csv += "RESUMEN GENERAL\n"
    csv += "Concepto,Valor\n"
    csv += `Total de Artículos,${data.resumen.totalArticulos}\n`
    csv += `Valor Total,$${data.resumen.valorTotal.toFixed(2)}\n`
    csv += `Artículos Donados,${data.resumen.articulosDonados}\n`
    csv += `Artículos Comprados,${data.resumen.articulosComprados}\n`
    csv += `Préstamos Activos,${data.resumen.prestamosActivos}\n`
    csv += `Total Prestado,${data.resumen.totalPrestado}\n`
    csv += `Total Dados de Baja,${data.resumen.totalDadosDeBaja}\n\n`

    // Categorías
    csv += "INVENTARIO POR CATEGORÍA\n"
    csv += "Categoría,Cantidad,Valor\n"
    Object.entries(data.categorias).forEach(([category, stats]: [string, any]) => {
      csv += `${category},${stats.count},$${stats.value.toFixed(2)}\n`
    })
    csv += "\n"

    // Transacciones recientes
    csv += "TRANSACCIONES RECIENTES\n"
    csv += "Artículo,Profesor,Cantidad,Tipo,Fecha,Estado\n"
    data.transaccionesRecientes.forEach((t: any) => {
      csv += `${t.articulo},${t.profesor},${t.cantidad},${t.tipo},${t.fecha},${t.estado}\n`
    })
    csv += "\n"

    // Bajas recientes
    csv += "BAJAS RECIENTES\n"
    csv += "Artículo,Cantidad,Razón,Fecha,Notas\n"
    data.bajasRecientes.forEach((d: any) => {
      csv += `${d.articulo},${d.cantidad},${d.razon},${d.fecha},"${d.notas}"\n`
    })

    return csv
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resumen de Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Total de artículos en stock</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {donatedItems} donados
              </Badge>
              <Badge variant="outline" className="text-xs">
                {purchasedItems} comprados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Solo artículos comprados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artículos en Préstamo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoaned}</div>
            <p className="text-xs text-muted-foreground">{activeLoans.length} préstamos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artículos Dados de Baja</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDisposed}</div>
            <p className="text-xs text-muted-foreground">{disposals.length} eventos de baja</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario por Categoría</CardTitle>
            <CardDescription>Desglose de artículos y valor por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-muted-foreground">{stats.count} artículos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${stats.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disposal Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Bajas</CardTitle>
            <CardDescription>Desglose de razones de baja</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(disposalReasons).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{reason}</Badge>
                  </div>
                  <span className="font-medium">{count} artículos</span>
                </div>
              ))}
              {Object.keys(disposalReasons).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No se han registrado bajas aún</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>Últimos préstamos y donaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{transaction.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.teacherName} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={transaction.type === "loan" ? "default" : "secondary"}>
                    {transaction.type === "loan" ? "préstamo" : "donación"}
                  </Badge>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No se han registrado transacciones aún</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Disposals */}
        <Card>
          <CardHeader>
            <CardTitle>Bajas Recientes</CardTitle>
            <CardDescription>Últimas bajas de artículos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDisposals.map((disposal) => (
                <div key={disposal.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{disposal.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {disposal.quantity} unidades • {new Date(disposal.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{getReasonText(disposal.reason)}</Badge>
                </div>
              ))}
              {recentDisposals.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No se han registrado bajas aún</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
