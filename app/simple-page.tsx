"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimplePage() {
  return (
    <div className="flex min-h-screen flex-col p-8">
      <h1 className="text-3xl font-bold mb-4">Página Simple de Prueba</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tarjeta de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Esta es una página simple para probar si los componentes se renderizan correctamente.</p>
          <Button>Botón de Prueba</Button>
        </CardContent>
      </Card>
    </div>
  )
}