"use client"

import React, { useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Item } from "@/types/inventory.types"

interface ItemDetailsDialogProps {
    item: Item | null
    isOpen: boolean
    onClose: () => void
}

export default function ItemDetailsDialog({ item, isOpen, onClose }: ItemDetailsDialogProps) {
    if (!item) return null
    const [isImageEnlarged, setIsImageEnlarged] = useState(false);

    const formatDate = (value?: string | null) => {
        if (!value) return "-"
        try {
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) return value
            return d.toLocaleDateString()
        } catch {
            return value
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[680px]">
                <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                    <DialogDescription>Detalles completos del artículo</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Detail label="ID" value={item.id} />
                    <Detail label="Categoría" value={item.category} />
                    <Detail label="Tipo" value={item.type} />
                    <Detail label="Estado" value={String(item.status)} />
                    <Detail label="Cantidad" value={String(item.quantity)} />
                    <Detail label="Ubicación" value={item.location || "-"} />
                    <Detail label="Fuente" value={(item as any).source || "-"} />
                    <Detail label="Costo" value={item.cost != null ? `${item.cost}` : "-"} />
                    <Detail label="Fecha de adquisición" value={formatDate((item as any).acquisition_date as any)} />
                    <Detail label="Marca" value={item.brand || "-"} />
                    <Detail label="Condición" value={item.condition || "-"} />
                    <Detail label="Creado" value={formatDate(item.created_at)} />
                    <Detail label="Actualizado" value={formatDate(item.updated_at)} />
                </div>

                {((item as any).image || (item as any).image_url) && (
                    <div className="mt-4">
                        <div className="text-sm font-medium mb-1">Imagen</div>
                        <img src={(item as any).image || (item as any).image_url} alt={item.name} className="rounded-lg border w-32 h-32 object-cover cursor-pointer" onClick={() => setIsImageEnlarged(true)} />
                        {isImageEnlarged && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsImageEnlarged(false)}>
                                <img src={(item as any).image || (item as any).image_url} alt={item.name} className="rounded-lg max-w-[90vw] max-h-[90vh]" />
                            </div>
                        )}
                    </div>
                )}

                {item.description && (
                    <div className="mt-4">
                        <div className="text-sm font-medium mb-1">Descripción</div>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <Badge variant="outline" className="justify-start whitespace-pre-wrap break-words h-auto py-1">
                {value}
            </Badge>
        </div>
    )
}



