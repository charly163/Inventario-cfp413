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
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Plus, User } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Item, Transaction, AppSettings } from "@/app/page"

interface AddTransactionFormProps {
  items: Item[]
  onAddTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>
  settings: AppSettings
}

export default function AddTransactionForm({ items, onAddTransaction, settings }: AddTransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [customTeacher, setCustomTeacher] = useState("")
  const [useCustomTeacher, setUseCustomTeacher] = useState(false)
  const [quantity, setQuantity] = useState("")
  const [type, setType] = useState<"loan" | "donation">("loan")
  const [returnDate, setReturnDate] = useState<Date>()
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedItem = items.find((item) => item.id === selectedItemId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem) {
      toast.error("Selecciona un artículo")
      return
    }

    const finalTeacherName = useCustomTeacher ? customTeacher : teacherName
    if (!finalTeacherName.trim()) {
      toast.error("Selecciona o ingresa el nombre del profesor")
      return
    }

    const quantityNum = Number.parseInt(quantity)
    if (!quantityNum || quantityNum <= 0) {
      toast.error("Ingresa una cantidad válida")
      return
    }

    if (quantityNum > selectedItem.quantity) {
      toast.error(`No hay suficiente stock. Disponible: ${selectedItem.quantity}`)
      return
    }

    if (type === "loan" && !returnDate) {
      toast.error("Selecciona la fecha de devolución para préstamos")
      return
    }

    setLoading(true)

    try {
      const transaction: Omit<Transaction, "id"> = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        teacherName: finalTeacherName,
        quantity: quantityNum,
        type,
        date: new Date().toISOString().split("T")[0],
        returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
        status: "active",
        notes: notes.trim() || undefined,
      }

      await onAddTransaction(transaction)

      // Reset form
      setSelectedItemId("")
      setTeacherName("")
      setCustomTeacher("")
      setUseCustomTeacher(false)
      setQuantity("")
      setType("loan")
      setReturnDate(undefined)
      setNotes("")
      setOpen(false)

      toast.success(`${type === "loan" ? "Préstamo" : "Donación"} registrado correctamente`)
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast.error("Error al registrar la transacción")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Nueva Transacción
          </DialogTitle>
          <DialogDescription>Registra un préstamo o donación de artículos del inventario.</DialogDescription>
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
                  <strong>Stock disponible:</strong> {selectedItem.quantity} unidades
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

          <div className="flex items-center space-x-2">
            <Checkbox id="custom-teacher" checked={useCustomTeacher} onCheckedChange={setUseCustomTeacher} />
            <Label htmlFor="custom-teacher">Ingresar profesor personalizado</Label>
          </div>

          {useCustomTeacher ? (
            <div>
              <Label htmlFor="custom-teacher-name">Nombre del Profesor</Label>
              <Input
                id="custom-teacher-name"
                value={customTeacher}
                onChange={(e) => setCustomTeacher(e.target.value)}
                placeholder="Ingresa el nombre del profesor"
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="teacher">Profesor</Label>
              <Select value={teacherName} onValueChange={setTeacherName} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesor" />
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
          )}

          <div>
            <Label htmlFor="quantity">Cantidad</Label>
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
          </div>

          <div>
            <Label htmlFor="type">Tipo de transacción</Label>
            <Select value={type} onValueChange={(value) => setType(value as "loan" | "donation")} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loan">Préstamo</SelectItem>
                <SelectItem value="donation">Donación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "loan" && (
            <div>
              <Label>Fecha de devolución</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre la transacción..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Registrando..." : `Registrar ${type === "loan" ? "Préstamo" : "Donación"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
