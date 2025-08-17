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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Plus, Minus, Users, Search, Package } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Item, Transaction, AppSettings } from "@/app/page"

interface SelectedItem {
  item: Item
  quantity: number
}

interface AddMultipleTransactionFormProps {
  items: Item[]
  onAddTransactions: (transactions: Omit<Transaction, "id">[]) => Promise<void>
  settings: AppSettings
  getLoanedQuantity: (itemId: string) => number
  getAvailableQuantity: (item: Item) => number
}

export default function AddMultipleTransactionForm({
  items,
  onAddTransactions,
  settings,
  getLoanedQuantity,
  getAvailableQuantity,
}: AddMultipleTransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [teacherName, setTeacherName] = useState("")
  const [customTeacher, setCustomTeacher] = useState("")
  const [useCustomTeacher, setUseCustomTeacher] = useState(false)
  const [returnDate, setReturnDate] = useState<Date>()
  const [notes, setNotes] = useState("")
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Filtrar solo herramientas disponibles
  const availableTools = items.filter(
    (item) =>
      item.type === "herramienta" &&
      getAvailableQuantity(item) > 0 &&
      (searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleItemToggle = (item: Item, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, { item, quantity: 1 }])
    } else {
      setSelectedItems((prev) => prev.filter((selected) => selected.item.id !== item.id))
    }
  }

  const handleQuantityChange = (itemId: string, change: number) => {
    setSelectedItems((prev) =>
      prev.map((selected) => {
        if (selected.item.id === itemId) {
          const newQuantity = Math.max(1, Math.min(selected.quantity + change, getAvailableQuantity(selected.item)))
          return { ...selected, quantity: newQuantity }
        }
        return selected
      }),
    )
  }

  const isItemSelected = (itemId: string) => {
    return selectedItems.some((selected) => selected.item.id === itemId)
  }

  const getSelectedQuantity = (itemId: string) => {
    const selected = selectedItems.find((selected) => selected.item.id === itemId)
    return selected?.quantity || 1
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      toast.error("Selecciona al menos una herramienta")
      return
    }

    const finalTeacherName = useCustomTeacher ? customTeacher : teacherName
    if (!finalTeacherName.trim()) {
      toast.error("Selecciona o ingresa el nombre del profesor")
      return
    }

    if (!returnDate) {
      toast.error("Selecciona la fecha de devolución")
      return
    }

    setLoading(true)

    try {
      const transactions: Omit<Transaction, "id">[] = selectedItems.map(({ item, quantity }) => ({
        itemId: item.id,
        itemName: item.name,
        teacherName: finalTeacherName,
        quantity,
        type: "loan",
        date: new Date().toISOString().split("T")[0],
        returnDate: format(returnDate, "yyyy-MM-dd"),
        status: "active",
        notes: notes.trim() || undefined,
      }))

      await onAddTransactions(transactions)

      // Reset form
      setTeacherName("")
      setCustomTeacher("")
      setUseCustomTeacher(false)
      setReturnDate(undefined)
      setNotes("")
      setSelectedItems([])
      setSearchTerm("")
      setOpen(false)

      toast.success("Préstamo múltiple registrado", {
        description: `${selectedItems.length} herramientas prestadas a ${finalTeacherName}`,
      })
    } catch (error) {
      console.error("Error adding multiple transactions:", error)
      toast.error("Error al registrar el préstamo múltiple")
    } finally {
      setLoading(false)
    }
  }

  const totalItems = selectedItems.length
  const totalQuantity = selectedItems.reduce((sum, selected) => sum + selected.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Users className="h-4 w-4" />
          Préstamo Múltiple
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Préstamo Múltiple de Herramientas
          </DialogTitle>
          <DialogDescription>Selecciona múltiples herramientas para prestar a un profesor</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Profesor */}
          <div className="space-y-4">
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
              <Label>Fecha de Devolución</Label>
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
          </div>

          <Separator />

          {/* Búsqueda y Selección de Herramientas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Buscar Herramientas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, categoría, marca o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {availableTools.map((item) => {
                const availableQuantity = getAvailableQuantity(item)
                const loanedQuantity = getLoanedQuantity(item.id)
                const isSelected = isItemSelected(item.id)
                const selectedQuantity = getSelectedQuantity(item.id)

                return (
                  <Card
                    key={item.id}
                    className={cn("cursor-pointer transition-colors", isSelected && "ring-2 ring-primary")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleItemToggle(item, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {availableQuantity} disp.
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.category} • {item.brand}
                          </p>
                          <p className="text-xs text-muted-foreground">📍 {item.location}</p>
                          {loanedQuantity > 0 && (
                            <p className="text-xs text-orange-600 mt-1">{loanedQuantity} prestadas</p>
                          )}

                          {isSelected && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={selectedQuantity <= 1}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">{selectedQuantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={selectedQuantity >= availableQuantity}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {availableTools.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron herramientas disponibles</p>
                {searchTerm && <p className="text-sm">Intenta con otros términos de búsqueda</p>}
              </div>
            )}
          </div>

          {/* Resumen del Préstamo */}
          {selectedItems.length > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen del Préstamo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total de herramientas:</span>
                      <span className="ml-2">{totalItems}</span>
                    </div>
                    <div>
                      <span className="font-medium">Cantidad total:</span>
                      <span className="ml-2">{totalQuantity}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Herramientas seleccionadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItems.map(({ item, quantity }) => (
                        <Badge key={item.id} variant="secondary" className="text-xs">
                          {item.name} ({quantity})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre el préstamo..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || selectedItems.length === 0} className="gap-2">
              {loading ? "Registrando..." : `Registrar Préstamo (${totalItems})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
