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
import { CalendarIcon, Edit, Package } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Item, AppSettings } from "@/app/page"

interface EditItemFormProps {
  item: Item
  settings: AppSettings
  onUpdateItem: (updatedItem: Item) => Promise<void>
  onClose: () => void
}

export default function EditItemForm({ item, settings, onUpdateItem, onClose }: EditItemFormProps) {
  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [source, setSource] = useState(item.source)
  const [cost, setCost] = useState(item.cost?.toString() || "")
  const [acquisitionDate, setAcquisitionDate] = useState<Date>(new Date(item.acquisitionDate))
  const [description, setDescription] = useState(item.description || "")
  const [type, setType] = useState<"herramienta" | "insumo">(item.type)
  const [brand, setBrand] = useState(item.brand || "")
  const [condition, setCondition] = useState<"nuevo" | "usado" | "regular" | "malo">(item.condition)
  const [location, setLocation] = useState(item.location || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    const quantityNum = Number.parseInt(quantity)
    if (isNaN(quantityNum) || quantityNum < 0) {
      toast.error("La cantidad debe ser un número válido")
      return
    }

    const costNum = cost ? Number.parseFloat(cost) : undefined
    if (cost && (isNaN(costNum!) || costNum! < 0)) {
      toast.error("El costo debe ser un número válido")
      return
    }

    setLoading(true)

    try {
      // Determinar el estado basado en la cantidad y tipo
      let status: "active" | "low-stock" | "out-of-stock" = "active"
      if (quantityNum === 0) {
        status = "out-of-stock"
      } else if (quantityNum < settings.lowStockThreshold && type === "insumo") {
        status = "low-stock"
      }

      const updatedItem: Item = {
        ...item,
        name: name.trim(),
        category,
        quantity: quantityNum,
        source,
        cost: costNum,
        acquisitionDate: format(acquisitionDate, "yyyy-MM-dd"),
        description: description.trim() || undefined,
        status,
        type,
        brand: brand.trim() || undefined,
        condition,
        location: location.trim() || undefined,
      }

      await onUpdateItem(updatedItem)
      onClose()
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Error al actualizar el artículo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Artículo
          </DialogTitle>
          <DialogDescription>Modifica la información del artículo en el inventario.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del artículo"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select value={type} onValueChange={(value) => setType(value as "herramienta" | "insumo")} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="herramienta">Herramienta</SelectItem>
                  <SelectItem value="insumo">Insumo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">Fuente *</Label>
              <Select value={source} onValueChange={setSource} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.sources.map((src) => (
                    <SelectItem key={src} value={src}>
                      {src}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Marca del artículo"
              />
            </div>

            <div>
              <Label htmlFor="condition">Condición *</Label>
              <Select value={condition} onValueChange={(value) => setCondition(value as any)} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="malo">Malo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {settings.locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha de adquisición *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !acquisitionDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {acquisitionDate ? format(acquisitionDate, "PPP", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={acquisitionDate}
                    onSelect={(date) => date && setAcquisitionDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada del artículo..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Package className="h-4 w-4" />
              {loading ? "Actualizando..." : "Actualizar Artículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
