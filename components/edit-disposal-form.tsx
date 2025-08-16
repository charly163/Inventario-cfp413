"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Edit } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Item, Disposal } from "@/app/page"

interface EditDisposalFormProps {
  disposal: Disposal
  items: Item[]
  onUpdateDisposal: (updatedDisposal: Disposal, originalQuantity: number) => Promise<void>
  onClose: () => void
}

const disposalReasons = [
  { value: "damaged", label: "Dañado" },
  { value: "expired", label: "Vencido" },
  { value: "worn-out", label: "Desgastado" },
  { value: "obsolete", label: "Obsoleto" },
  { value: "other", label: "Otro" },
]

export default function EditDisposalForm({ disposal, items, onUpdateDisposal, onClose }: EditDisposalFormProps) {
  const [quantity, setQuantity] = useState(disposal.quantity.toString())
  const [reason, setReason] = useState(disposal.reason)
  const [date, setDate] = useState<Date>(new Date(disposal.date))
  const [notes, setNotes] = useState(disposal.notes || "")
  const [loading, setLoading] = useState(false)

  const originalQuantity = disposal.quantity
  const selectedItem = items.find((item) => item.id === disposal.itemId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const quantityNum = Number.parseInt(quantity)
    if (!quantityNum || quantityNum <= 0) {
      toast.error("Ingresa una cantidad válida")
      return
    }

    if (!reason) {
      toast.error("Selecciona un motivo de baja")
      return
    }

    setLoading(true)

    try {
      const updatedDisposal: Disposal = {
        ...disposal,
        quantity: quantityNum,
        reason: reason as any,
        date: format(date, "yyyy-MM-dd"),
        notes: notes.trim() || undefined,
      }

      await onUpdateDisposal(updatedDisposal, originalQuantity)
      onClose()
    } catch (error) {
      console.error("Error updating disposal:", error)
      toast.error("Error al actualizar la baja")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Baja de Artículo
          </DialogTitle>
          <DialogDescription>Modifica los detalles de la baja registrada.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del artículo */}
          <div className="p-3 bg-slate-50 rounded-lg border">
            <div className="text-sm space-y-1">
              <p>
                <strong>Artículo:</strong> {disposal.itemName}
              </p>
              {selectedItem && (
                <>
                  <p>
                    <strong>Categoría:</strong> {selectedItem.category}
                  </p>
                  <p>
                    <strong>Stock actual:</strong> {selectedItem.quantity} unidades
                  </p>
                  {selectedItem.brand && (
                    <p>
                      <strong>Marca:</strong> {selectedItem.brand}
                    </p>
                  )}
                  {selectedItem.location && (
                    <p>
                      <strong>Ubicación:</strong> {selectedItem.location}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Cantidad dada de baja</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ingresa la cantidad"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Cantidad original: {originalQuantity}</p>
          </div>

          <div>
            <Label htmlFor="reason">Motivo de la baja</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el motivo" />
              </SelectTrigger>
              <SelectContent>
                {disposalReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fecha de baja</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Selecciona fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe el estado del artículo, motivo específico, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Actualizando..." : "Actualizar Baja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
