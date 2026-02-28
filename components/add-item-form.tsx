"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Package } from "lucide-react"
import { toast } from "sonner"
import { Item } from "@/types/inventory.types"
// import { supabase } from "@/lib/supabase"
import { getCategories, getLocations, getSources, getConditions } from "@/lib/database"

interface AddItemFormProps {
  onAddItem: (item: Omit<Item, "id" | "created_at" | "updated_at">) => Promise<void>
  defaultType?: "herramienta" | "insumo"
}

export function AddItemForm({ onAddItem, defaultType }: AddItemFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("")
  const [minStock, setMinStock] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"herramienta" | "insumo">(defaultType || "herramienta")
  const [source, setSource] = useState("")
  const [cost, setCost] = useState("")
  const [acquisitionDate, setAcquisitionDate] = useState("")
  const [brand, setBrand] = useState("")
  const [condition, setCondition] = useState<"nuevo" | "usado" | "regular" | "malo">("nuevo")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Error", { description: "El nombre es requerido" })
      return
    }

    if (!category) {
      toast.error("Error", { description: "Selecciona una categoría" })
      return
    }

    if (!location) {
      toast.error("Error", { description: "Selecciona una ubicación" })
      return
    }

    if (!source) {
      toast.error("Error", { description: "La fuente es requerida" })
      return
    }

    if (!acquisitionDate) {
      toast.error("Error", { description: "La fecha de adquisición es requerida" })
      return
    }

    const quantityNum = Number.parseInt(quantity) || 0
    const minStockNum = Number.parseInt(minStock) || 0
    const costNum = cost ? Number.parseFloat(cost) : null

    if (isNaN(quantityNum) || quantityNum < 0) {
      toast.error("Error", { description: "La cantidad debe ser un número válido" })
      return
    }

    setLoading(true)

    try {
      let imageUrl = null

      // TODO: Implementar almacenamiento para Neon/Netlify (Cloudinary, AWS S3, etc.)
      if (image) {
        console.warn("La subida de imágenes no está disponible actualmente en Neon. Se requiere un proveedor de almacenamiento externo.");
        toast.info("Aviso", { description: "La subida de imágenes estará disponible pronto. El item se creará sin imagen." });
      }

      const newItem: Omit<Item, 'id' | 'created_at' | 'updated_at'> = {
        name: name.trim(),
        category,
        quantity: quantityNum,
        location,
        description: description.trim() || null,
        status: "active",
        source,
        cost: costNum,
        acquisition_date: acquisitionDate,
        brand: brand || null,
        condition,
        type,
        image: imageUrl,
      }

      await onAddItem(newItem)

      // Reset form
      setName("")
      setCategory("")
      setQuantity("")
      setMinStock("")
      setLocation("")
      setDescription("")
      setSource("")
      setCost("")
      setAcquisitionDate("")
      setBrand("")
      setCondition("nuevo")
      setImage(null)
      setImagePreview(null)
      setOpen(false)
      toast.success("Ítem agregado correctamente")
    } catch (error) {
      console.error("Error adding item:", error)
      toast.error("Error", { description: "Error al agregar el artículo" })
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
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Select value={location} onValueChange={setLocation} required>
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
              <Input id="cost" type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="acquisitionDate">Fecha de adquisición</Label>
              <Input id="acquisitionDate" type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="condition">Condición</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
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

            <div className="space-y-2">
              <Label htmlFor="image">Imagen</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-20 w-20 object-cover rounded border"
                  />
                </div>
              )}
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