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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Package } from "lucide-react"
import { toast } from "sonner"
import type { Item } from "@/types/inventory.types"
import { getCategories, getLocations, getSources, getConditions } from "@/lib/database"

interface EditItemFormProps {
  item: Item
  onUpdateItem: (id: string, updatedItem: Partial<Item>) => Promise<void>
  onClose: () => void
  lowStockThreshold: number
}

export default function EditItemForm({ item, onUpdateItem, onClose, lowStockThreshold }: EditItemFormProps) {
  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [cost, setCost] = useState(item.cost?.toString() || "")
  const [description, setDescription] = useState(item.description || "")
  const [type, setType] = useState<"herramienta" | "insumo">(item.type)
  const [brand, setBrand] = useState(item.brand || "")
  const [condition, setCondition] = useState<"nuevo" | "usado" | "regular" | "malo" | string>(item.condition || "nuevo")
  const [location, setLocation] = useState(item.location || "")
  const [source, setSource] = useState((item as any).source || "")
  const [acquisitionDate, setAcquisitionDate] = useState<string>((item as any).acquisition_date || "")
  const [imageUrl, setImageUrl] = useState((item as any).image_url || (item as any).image || "")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedCategories, fetchedLocations, fetchedSources, fetchedConditions] = await Promise.all([
        getCategories(),
        getLocations(),
        getSources(),
        getConditions(),
      ]);
      setCategories(fetchedCategories);
      setLocations(fetchedLocations);
      setSources(fetchedSources);
      setConditions(fetchedConditions);
    };
    fetchData();
  }, []);

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
      } else if (quantityNum < lowStockThreshold && type === "insumo") {
        status = "low-stock"
      }

      const updatedItem: Partial<Item> = {
        name: name.trim(),
        category,
        quantity: quantityNum,
        cost: costNum,
        description: description.trim() || undefined,
        status,
        type,
        brand: brand.trim() || undefined,
        condition: (condition as any) || undefined,
        location: location.trim() || undefined,
        source: source || undefined,
        acquisition_date: acquisitionDate || undefined,
        image: imageUrl || undefined,
      }

      await onUpdateItem(item.id, updatedItem)
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
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
              <Label htmlFor="source">Fuente</Label>
              <Select value={source} onValueChange={setSource} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una fuente" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
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
              <Label htmlFor="condition">Condición</Label>
              <Select value={condition} onValueChange={(value) => setCondition(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
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
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="acquisitionDate">Fecha de adquisición</Label>
              <Input id="acquisitionDate" type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image">Imagen (URL)</Label>
              <Input id="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..."/>
            </div>
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