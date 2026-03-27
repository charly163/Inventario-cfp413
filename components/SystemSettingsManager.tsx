"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { AppSettings } from "@/app/page"

interface SystemSettingsManagerProps {
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => Promise<void>
}

export default function SystemSettingsManager({ settings, onUpdateSettings }: SystemSettingsManagerProps) {
  const [loading, setLoading] = useState(false)
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold.toString())

  const handleSave = async () => {
    const value = parseInt(lowStockThreshold, 10)
    if (isNaN(value) || value < 0) {
      toast.error("El umbral de stock bajo debe ser un número válido mayor o igual a 0")
      return
    }

    setLoading(true)
    try {
      await onUpdateSettings({
        ...settings,
        lowStockThreshold: value
      })
      toast.success("Configuración actualizada correctamente")
    } catch (error) {
      toast.error("Error al actualizar la configuración")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Global</CardTitle>
        <CardDescription>Parámetros generales del sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">Umbral de Stock Bajo</Label>
          <div className="flex gap-2">
            <Input
              id="lowStockThreshold"
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleSave} disabled={loading}>
              Guardar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            El sistema avisará cuando la cantidad de un insumo o herramienta baje de este valor.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
