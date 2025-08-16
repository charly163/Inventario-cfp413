"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Disposal } from "@/app/page"

interface DisposalsListProps {
  disposals: Disposal[]
  onEditDisposal: (disposal: Disposal) => void
}

const reasonLabels = {
  damaged: "Dañado",
  expired: "Vencido",
  "worn-out": "Desgastado",
  obsolete: "Obsoleto",
  other: "Otro",
}

const reasonColors = {
  damaged: "bg-red-100 text-red-800 border-red-300",
  expired: "bg-orange-100 text-orange-800 border-orange-300",
  "worn-out": "bg-yellow-100 text-yellow-800 border-yellow-300",
  obsolete: "bg-gray-100 text-gray-800 border-gray-300",
  other: "bg-blue-100 text-blue-800 border-blue-300",
}

export default function DisposalsList({ disposals, onEditDisposal }: DisposalsListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDisposals = disposals.filter(
    (disposal) =>
      disposal.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disposal.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disposal.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalQuantityDisposed = disposals.reduce((sum, disposal) => sum + disposal.quantity, 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Bajas de Artículos ({filteredDisposals.length})
              </CardTitle>
              <CardDescription>
                Registro de artículos dados de baja • Total: {totalQuantityDisposed} unidades
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar bajas por artículo, motivo o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisposals.map((disposal) => (
                  <TableRow key={disposal.id}>
                    <TableCell className="font-medium">{disposal.itemName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {disposal.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={reasonColors[disposal.reason as keyof typeof reasonColors]}>
                        {reasonLabels[disposal.reason as keyof typeof reasonLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(disposal.date), "dd/MM/yyyy", { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {disposal.notes ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]" title={disposal.notes}>
                            {disposal.notes}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditDisposal(disposal)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDisposals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No se encontraron bajas</p>
              <p className="text-sm">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay bajas registradas"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
