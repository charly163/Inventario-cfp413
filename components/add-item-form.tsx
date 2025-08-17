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
import { Plus, Package } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Item, AppSettings } from "@/app/page"

interface AddItemFormProps {
  onAddItem: (item: Omit<Item, "id">) => Promise<void>
  settings: AppSettings
  defaultType?: "herramienta" | "insumo"
}

export function AddItemForm({ onAddItem, settings, defaultType }: AddItemFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("")
  const [minStock, setMinStock] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"herramienta" | "insumo">(defaultType || "herramienta")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Selecciona una categoría",
        variant: "destructive",
      })
      return
    }

    if (!location) {
      toast({
        title: "Error",
        description: "Selecciona una ubicación",
        variant: "destructive",
      })
      return
    }

    const quantityNum = Number.parseInt(quantity) || 0
    const minStockNum = Number.parseInt(minStock) || 0

    if (quantityNum < 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser un número válido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const newItem: Omit<Item, "id"> = {
        name: name.trim(),
        category,
        quantity: quantityNum,
        minStock: minStockNum,
        location,
        description: description.trim() || "",
        status: "disponible",
        addedDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
        type,
      }

      await onAddItem(newItem)

      // Reset form
      setName("")
      setCategory("")
      setQuantity("")
      setMinStock("")
      setLocation("")
      setDescription("")
      setType(defaultType || "herramienta")
      setOpen(false)

      toast({
        title: "Éxito",
        description: "Artículo agregado correctamente",
      })
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: "Error",
        description: "Error al agregar el artículo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar {defaultType === "insumo" ? "Insumo" : defaultType === "herramienta" ? "Herramienta" : "Artículo"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Agregar Nuevo Artículo
          </DialogTitle>
          <DialogDescription>Completa la información del artículo para agregarlo al inventario.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  <SelectValue placeholder="Selecciona categoría" />
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
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Select value={location} onValueChange={setLocation} required>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Package className="h-4 w-4" />
              {loading ? "Agregando..." : "Agregar Artículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddItemForm
