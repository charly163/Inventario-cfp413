"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Item, Disposal } from "@/app/page"

interface EditDisposalFormProps {
  disposal: Disposal
  items: Item[]
  onUpdateDisposal: (disposal: Disposal, originalQuantity: number) => void
  onClose: () => void
}

export default function EditDisposalForm({ disposal, items, onUpdateDisposal, onClose }: EditDisposalFormProps) {
  const [formData, setFormData] = useState({
    quantity: disposal.quantity.toString(),
    reason: disposal.reason,
    date: disposal.date,
    notes: disposal.notes || "",
  })

  const originalQuantity = disposal.quantity

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedDisposal: Disposal = {
      ...disposal,
      quantity: Number.parseInt(formData.quantity),
      reason: formData.reason as "damaged" | "expired" | "worn-out" | "obsolete" | "other",
      date: formData.date,
      notes: formData.notes || undefined,
    }

    onUpdateDisposal(updatedDisposal, originalQuantity)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Baja de Artículo</DialogTitle>
          <DialogDescription>Modificar la información de la baja del artículo "{disposal.itemName}".</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Artículo</Label>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="font-medium">{disposal.itemName}</p>
              <p className="text-sm text-muted-foreground">Este campo no se puede modificar</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">Cantidad original: {originalQuantity} unidades</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón *</Label>
            <Select
              value={formData.reason}
              onValueChange={(value: typeof formData.reason) => setFormData((prev) => ({ ...prev, reason: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damaged">Dañado</SelectItem>
                <SelectItem value="expired">Vencido</SelectItem>
                <SelectItem value="worn-out">Desgastado</SelectItem>
                <SelectItem value="obsolete">Obsoleto</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha de Baja *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Describir la condición o razón para la baja..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
