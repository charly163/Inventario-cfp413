"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Plus, X, Save, Users, MapPin, Building, Package } from "lucide-react"
import { toast } from "sonner"
import type { AppSettings } from "@/app/page"

interface SettingsPanelProps {
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => Promise<void>
}

export default function SettingsPanel({ settings, onUpdateSettings }: SettingsPanelProps) {
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold.toString())
  const [categories, setCategories] = useState<string[]>(settings.categories)
  const [sources, setSources] = useState<string[]>(settings.sources)
  const [teachers, setTeachers] = useState<string[]>(settings.teachers)
  const [locations, setLocations] = useState<string[]>(settings.locations)
  const [loading, setLoading] = useState(false)

  // Estados para nuevos elementos
  const [newCategory, setNewCategory] = useState("")
  const [newSource, setNewSource] = useState("")
  const [newTeacher, setNewTeacher] = useState("")
  const [newLocation, setNewLocation] = useState("")

  // Actualizar estados cuando cambien las configuraciones
  useEffect(() => {
    setLowStockThreshold(settings.lowStockThreshold.toString())
    setCategories(settings.categories)
    setSources(settings.sources)
    setTeachers(settings.teachers)
    setLocations(settings.locations)
  }, [settings])

  const handleSave = async () => {
    const threshold = Number.parseInt(lowStockThreshold)
    if (isNaN(threshold) || threshold < 1) {
      toast.error("El umbral de stock bajo debe ser un número mayor a 0")
      return
    }

    if (categories.length === 0) {
      toast.error("Debe haber al menos una categoría")
      return
    }

    if (sources.length === 0) {
      toast.error("Debe haber al menos una fuente")
      return
    }

    if (teachers.length === 0) {
      toast.error("Debe haber al menos un profesor")
      return
    }

    setLoading(true)

    try {
      const newSettings: AppSettings = {
        lowStockThreshold: threshold,
        categories: [...categories],
        sources: [...sources],
        teachers: [...teachers],
        locations: [...locations],
      }

      await onUpdateSettings(newSettings)
      toast.success("Configuración guardada correctamente")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setLoading(false)
    }
  }

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Ingresa el nombre de la categoría")
      return
    }

    const categoryUpper = newCategory.trim().toUpperCase()
    if (categories.includes(categoryUpper)) {
      toast.error("Esta categoría ya existe")
      return
    }

    setCategories([...categories, categoryUpper])
    setNewCategory("")
    toast.success("Categoría agregada")
  }

  const removeCategory = (category: string) => {
    if (categories.length <= 1) {
      toast.error("Debe haber al menos una categoría")
      return
    }
    setCategories(categories.filter((c) => c !== category))
    toast.success("Categoría eliminada")
  }

  const addSource = () => {
    if (!newSource.trim()) {
      toast.error("Ingresa el nombre de la fuente")
      return
    }

    const sourceUpper = newSource.trim().toUpperCase()
    if (sources.includes(sourceUpper)) {
      toast.error("Esta fuente ya existe")
      return
    }

    setSources([...sources, sourceUpper])
    setNewSource("")
    toast.success("Fuente agregada")
  }

  const removeSource = (source: string) => {
    if (sources.length <= 1) {
      toast.error("Debe haber al menos una fuente")
      return
    }
    setSources(sources.filter((s) => s !== source))
    toast.success("Fuente eliminada")
  }

  const addTeacher = () => {
    if (!newTeacher.trim()) {
      toast.error("Ingresa el nombre del profesor")
      return
    }

    if (teachers.includes(newTeacher.trim())) {
      toast.error("Este profesor ya existe")
      return
    }

    setTeachers([...teachers, newTeacher.trim()])
    setNewTeacher("")
    toast.success("Profesor agregado")
  }

  const removeTeacher = (teacher: string) => {
    if (teachers.length <= 1) {
      toast.error("Debe haber al menos un profesor")
      return
    }
    setTeachers(teachers.filter((t) => t !== teacher))
    toast.success("Profesor eliminado")
  }

  const addLocation = () => {
    if (!newLocation.trim()) {
      toast.error("Ingresa el nombre de la ubicación")
      return
    }

    if (locations.includes(newLocation.trim())) {
      toast.error("Esta ubicación ya existe")
      return
    }

    setLocations([...locations, newLocation.trim()])
    setNewLocation("")
    toast.success("Ubicación agregada")
  }

  const removeLocation = (location: string) => {
    setLocations(locations.filter((l) => l !== location))
    toast.success("Ubicación eliminada")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>Personaliza las opciones del sistema de inventario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Umbral de Stock Bajo */}
          <div className="space-y-2">
            <Label htmlFor="threshold">Umbral de Stock Bajo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="threshold"
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                Los insumos con menos de esta cantidad mostrarán alerta de stock bajo
              </span>
            </div>
          </div>

          <Separator />

          {/* Categorías */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <Label className="text-base font-semibold">Categorías</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeCategory(category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nueva categoría"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
              />
              <Button onClick={addCategory} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Fuentes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <Label className="text-base font-semibold">Fuentes de Adquisición</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <Badge key={source} variant="secondary" className="flex items-center gap-1">
                  {source}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeSource(source)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nueva fuente"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSource()}
              />
              <Button onClick={addSource} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Profesores */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <Label className="text-base font-semibold">Profesores</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {teachers.map((teacher) => (
                <Badge key={teacher} variant="secondary" className="flex items-center gap-1">
                  {teacher}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeTeacher(teacher)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo profesor"
                value={newTeacher}
                onChange={(e) => setNewTeacher(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTeacher()}
              />
              <Button onClick={addTeacher} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Ubicaciones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <Label className="text-base font-semibold">Ubicaciones</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeLocation(location)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nueva ubicación"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
              <Button onClick={addLocation} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
