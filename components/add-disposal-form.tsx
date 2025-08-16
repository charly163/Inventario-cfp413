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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Item, Disposal } from "@/app/page"

interface AddDisposalFormProps {
  items: Item[]
  onAddDisposal: (disposal: Omit<Disposal, "id">) => Promise<void>
}

const disposalReasons = [
  { value: "damaged", label: "Dañado" },
  { value: "expired", label: "Vencido" },
  { value: "worn-out", label: "Desgastado" },
  { value: "obsolete", label: "Obsoleto" },
  { value: "other", label: "Otro" },
]

export default function AddDisposalForm({ items, onAddDisposal }: AddDisposalFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedItem = items.find((item) => item.id === selectedItemId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem) {
      toast.error("Selecciona un artículo")
      return
    }

    const quantityNum = Number.parseInt(quantity)
    if (!quantityNum || quantityNum <= 0) {
      toast.error("Ingresa una cantidad válida")
      return
    }

    if (quantityNum > selectedItem.quantity) {
      toast.error(`No puedes dar de baja más de ${selectedItem.quantity} unidades`)
      return
    }

    if (!reason) {
      toast.error("Selecciona un motivo de baja")
      return
    }

    setLoading(true)

    try {
      const disposal: Omit<Disposal, "id"> = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        quantity: quantityNum,
        reason: reason as any,
        date: format(date, "yyyy-MM-dd"),
        notes: notes.trim() || undefined,
      }

      await onAddDisposal(disposal)

      // Reset form
      setSelectedItemId("")
      setQuantity("")
      setReason("")
      setDate(new Date())
      setNotes("")
      setOpen(false)

      toast.success("Baja registrada correctamente")
    } catch (error) {
      console.error("Error adding disposal:", error)
      toast.error("Error al registrar la baja")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Trash2 className="h-4 w-4" />
          Registrar Baja
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Registrar Baja de Artículo
          </DialogTitle>
          <DialogDescription>
            Registra la baja de artículos dañados, vencidos o que ya no se pueden usar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item">Artículo</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un artículo" />
              </SelectTrigger>
              <SelectContent>
                {items
                  .filter((item) => item.quantity > 0)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.category} (Stock: {item.quantity})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedItem && (
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-sm space-y-1">
                <p>
                  <strong>Artículo:</strong> {selectedItem.name}
                </p>
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
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="quantity">Cantidad a dar de baja</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedItem?.quantity || 1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ingresa la cantidad"
              required
            />
            {selectedItem && (
              <p className="text-xs text-muted-foreground mt-1">Máximo: {selectedItem.quantity} unidades disponibles</p>
            )}
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
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe el estado del artículo, motivo específico, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Registrando..." : "Registrar Baja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
