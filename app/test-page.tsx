"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Página de Prueba</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Inventario CFP 413</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Esta es una página de prueba para verificar si hay problemas con el renderizado.</p>
          <Button>Botón de Prueba</Button>
        </CardContent>
      </Card>
    </div>
  )
}