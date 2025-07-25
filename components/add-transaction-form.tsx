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
import { Plus, Search } from "lucide-react"
import type { Item, Transaction, AppSettings } from "@/app/page"

interface AddTransactionFormProps {
  items: Item[]
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void
  settings: AppSettings
}

export default function AddTransactionForm({ items, onAddTransaction, settings }: AddTransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    itemId: "",
    teacherName: "",
    quantity: "",
    type: "loan" as "loan" | "donation",
    date: new Date().toISOString().split("T")[0],
    returnDate: "",
    notes: "",
  })

  // Filtrar artículos basados en el término de búsqueda
  const filteredItems = items.filter(
    (item) =>
      item.quantity > 0 &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  const selectedItem = items.find((item) => item.id === formData.itemId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem) return

    const newTransaction: Omit<Transaction, "id"> = {
      itemId: formData.itemId,
      itemName: selectedItem.name,
      teacherName: formData.teacherName,
      quantity: Number.parseInt(formData.quantity),
      type: formData.type,
      date: formData.date,
      returnDate: formData.returnDate || undefined,
      status: "active",
      notes: formData.notes || undefined,
    }

    onAddTransaction(newTransaction)
    setOpen(false)
    setFormData({
      itemId: "",
      teacherName: "",
      quantity: "",
      type: "loan",
      date: new Date().toISOString().split("T")[0],
      returnDate: "",
      notes: "",
    })
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Transacción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Transacción</DialogTitle>
          <DialogDescription>Registrar un préstamo o donación a un profesor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Artículo *</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículo por nombre, categoría o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 mb-2"
              />
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md">
              {filteredItems.length > 0 ? (
                <div className="divide-y">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 cursor-pointer hover:bg-gray-100 ${
                        formData.itemId === item.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, itemId: item.id }))}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>{item.category}</span>
                        <span>{item.quantity} disponibles</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? "No se encontraron artículos" : "Busque un artículo para comenzar"}
                </div>
              )}
            </div>
            {selectedItem && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <p className="font-medium">Artículo seleccionado: {selectedItem.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.quantity} unidades disponibles • {selectedItem.category}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherName">Nombre del Profesor *</Label>
            <Select
              value={formData.teacherName}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, teacherName: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesor" />
              </SelectTrigger>
              <SelectContent>
                {settings.teachers.map((teacher) => (
                  <SelectItem key={teacher} value={teacher}>
                    {teacher}
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
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "loan" | "donation") => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan">Préstamo</SelectItem>
                  <SelectItem value="donation">Donación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de Transacción *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            {formData.type === "loan" && (
              <div className="space-y-2">
                <Label htmlFor="returnDate">Devolución Esperada</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, returnDate: e.target.value }))}
                  min={formData.date}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales sobre esta transacción..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.itemId || !formData.teacherName}>
              Registrar Transacción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
