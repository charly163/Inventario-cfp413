"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save } from 'lucide-react'
import type { AppSettings } from "@/app/page"

interface SettingsPanelProps {
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => void
}

export default function SettingsPanel({ settings, onUpdateSettings }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [newCategory, setNewCategory] = useState("")
  const [newSource, setNewSource] = useState("")
  const [newTeacher, setNewTeacher] = useState("")
  const [newLocation, setNewLocation] = useState("")

  const handleSave = () => {
    onUpdateSettings(localSettings)
  }

  const addCategory = () => {
    if (newCategory.trim() && !localSettings.categories.includes(newCategory.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }))
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }))
  }

  const addSource = () => {
    if (newSource.trim() && !localSettings.sources.includes(newSource.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()],
      }))
      setNewSource("")
    }
  }

  const removeSource = (source: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      sources: prev.sources.filter((s) => s !== source),
    }))
  }

  const addTeacher = () => {
    if (newTeacher.trim() && !localSettings.teachers.includes(newTeacher.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        teachers: [...prev.teachers, newTeacher.trim()],
      }))
      setNewTeacher("")
    }
  }

  const removeTeacher = (teacher: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t !== teacher),
    }))
  }

  const addLocation = () => {
    if (newLocation.trim() && !localSettings.locations.includes(newLocation.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()],
      }))
      setNewLocation("")
    }
  }

  const removeLocation = (location: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l !== location),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Bajo */}
        <Card>
          <CardHeader>
            <CardTitle>Umbral de Stock Bajo</CardTitle>
            <CardDescription>Define cuándo un artículo se considera con stock bajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Cantidad mínima</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                value={localSettings.lowStockThreshold}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    lowStockThreshold: Number.parseInt(e.target.value) || 10,
                  }))
                }
              />
              <p className="text-sm text-muted-foreground">
                Los artículos con menos de {localSettings.lowStockThreshold} unidades se marcarán como "Stock Bajo"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categorías */}
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
            <CardDescription>Gestiona las categorías disponibles para los artículos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nueva categoría"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
              />
              <Button onClick={addCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {localSettings.categories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <button onClick={() => removeCategory(category)} className="ml-1 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orígenes */}
        <Card>
          <CardHeader>
            <CardTitle>Orígenes de Adquisición</CardTitle>
            <CardDescription>Gestiona los orígenes disponibles para los artículos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo origen"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSource()}
              />
              <Button onClick={addSource} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {localSettings.sources.map((source) => (
                <Badge key={source} variant="outline" className="flex items-center gap-1">
                  {source}
                  <button onClick={() => removeSource(source)} className="ml-1 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profesores */}
        <Card>
          <CardHeader>
            <CardTitle>Profesores</CardTitle>
            <CardDescription>Gestiona la lista de profesores para préstamos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo profesor (ej. Prof. García, María)"
                value={newTeacher}
                onChange={(e) => setNewTeacher(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTeacher()}
              />
              <Button onClick={addTeacher} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {localSettings.teachers.map((teacher) => (
                <Badge key={teacher} variant="outline" className="flex items-center gap-1">
                  {teacher}
                  <button onClick={() => removeTeacher(teacher)} className="ml-1 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ubicaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicaciones</CardTitle>
            <CardDescription>Gestiona las ubicaciones disponibles para los artículos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nueva ubicación (ej. Estante A-1)"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
              <Button onClick={addLocation} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {localSettings.locations.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <button onClick={() => removeLocation(location)} className="ml-1 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>Estadísticas y configuración actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Categorías configuradas:</p>
                <p className="text-muted-foreground">{localSettings.categories.length}</p>
              </div>
              <div>
                <p className="font-medium">Orígenes configurados:</p>
                <p className="text-muted-foreground">{localSettings.sources.length}</p>
              </div>
              <div>
                <p className="font-medium">Profesores registrados:</p>
                <p className="text-muted-foreground">{localSettings.teachers.length}</p>
              </div>
              <div>
                <p className="font-medium">Ubicaciones configuradas:</p>
                <p className="text-muted-foreground">{localSettings.locations.length}</p>
              </div>
              <div>
                <p className="font-medium">Umbral stock bajo:</p>
                <p className="text-muted-foreground">{localSettings.lowStockThreshold} unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
