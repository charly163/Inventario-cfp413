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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import type { Item, Disposal } from "@/app/page"

interface AddDisposalFormProps {
  items: Item[]
  onAddDisposal: (disposal: Omit<Disposal, "id">) => void
}

export default function AddDisposalForm({ items, onAddDisposal }: AddDisposalFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    itemId: "",
    quantity: "",
    reason: "damaged" as "damaged" | "expired" | "worn-out" | "obsolete" | "other",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const selectedItem = items.find((item) => item.id === formData.itemId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem) return

    const newDisposal: Omit<Disposal, "id"> = {
      itemId: formData.itemId,
      itemName: selectedItem.name,
      quantity: Number.parseInt(formData.quantity),
      reason: formData.reason,
      date: formData.date,
      notes: formData.notes || undefined,
    }

    onAddDisposal(newDisposal)
    setOpen(false)
    setFormData({
      itemId: "",
      quantity: "",
      reason: "damaged",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trash2 className="h-4 w-4 mr-2" />
          Registrar Baja
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Baja de Artículo</DialogTitle>
          <DialogDescription>
            Registrar artículos dañados, vencidos o que necesitan ser dados de baja.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Artículo *</Label>
            <Select
              value={formData.itemId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, itemId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar un artículo" />
              </SelectTrigger>
              <SelectContent>
                {items
                  .filter((item) => item.quantity > 0)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.quantity} disponibles)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedItem?.quantity || 1}
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                required
              />
              {selectedItem && (
                <p className="text-xs text-muted-foreground">Máx: {selectedItem.quantity} disponibles</p>
              )}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.itemId}>
              Registrar Baja
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
