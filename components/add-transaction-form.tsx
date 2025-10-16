"use client"

import React, { useState, useEffect } from "react"
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
import { CalendarIcon, Plus, User } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Item, Transaction } from "@/types/inventory.types"
import type { AppSettings } from "@/app/page"
import { getTeachers } from "@/lib/database"

interface AddTransactionFormProps {
  items: Item[]
  onAddTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>
  settings: AppSettings
}

export default function AddTransactionForm({ items, onAddTransaction, settings }: AddTransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [teacherName, setTeacherName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [type, setType] = useState<"loan" | "donation">("loan")
  const [returnDate, setReturnDate] = useState<Date>()
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const fetchedTeachers = await getTeachers();
      setTeachers(fetchedTeachers.map(t => ({ id: t.id, name: `${t.first_name} ${t.last_name}` })));
    };
    fetchTeachers();
  }, []);

  const selectedItem = items.find((item) => item.id === selectedItemId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem) {
      toast.error("Selecciona un artículo")
      return
    }

    if (!teacherId.trim()) {
      toast.error("Selecciona un profesor")
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
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        teacher_id: teacherId,
        teacher_name: teacherName,
        quantity: quantityNum,
        type,
        date: new Date().toISOString().split("T")[0],
        return_date: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
        status: "active",
        notes: notes.trim() || undefined,
      }

      await onAddTransaction(transaction)

      // Reset form
      setSelectedItemId("")
      setTeacherId("")
      setTeacherName("")
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

          <div>
            <Label htmlFor="teacher">Profesor</Label>
            <Select
              value={teacherId}
              onValueChange={(value) => {
                setTeacherId(value);
                const selectedTeacher = teachers.find(t => t.id === value);
                if (selectedTeacher) {
                  setTeacherName(selectedTeacher.name);
                }
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un profesor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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