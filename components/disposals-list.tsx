"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Package, AlertTriangle, Edit } from "lucide-react"
import type { Disposal } from "@/app/page"

interface DisposalsListProps {
  disposals: Disposal[]
  onEditDisposal?: (disposal: Disposal) => void
}

export default function DisposalsList({ disposals, onEditDisposal }: DisposalsListProps) {
  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "damaged":
        return "destructive"
      case "expired":
        return "secondary"
      case "worn-out":
        return "outline"
      case "obsolete":
        return "default"
      default:
        return "default"
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "damaged":
      case "expired":
      case "worn-out":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getReasonText = (reason: string) => {
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

  return (
    <div className="space-y-4">
      {disposals.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No se han registrado bajas aún.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {disposals.map((disposal) => (
            <Card key={disposal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{disposal.itemName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getReasonColor(disposal.reason)}>{getReasonText(disposal.reason)}</Badge>
                    {onEditDisposal && (
                      <Button variant="ghost" size="sm" onClick={() => onEditDisposal(disposal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {getReasonIcon(disposal.reason)}
                  <span>{disposal.quantity} unidades dadas de baja</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(disposal.date).toLocaleDateString()}</span>
                </div>

                {disposal.notes && (
                  <p className="text-sm text-muted-foreground border-t pt-2">
                    <strong>Notas:</strong> {disposal.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
