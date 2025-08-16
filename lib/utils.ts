import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear fechas
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

// Función para formatear fechas con hora
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Función para formatear moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

// Función para formatear números
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-AR").format(num)
}

// Función para capitalizar texto
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Función para generar ID único
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Función para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función para truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

// Función para obtener iniciales
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Función para calcular días entre fechas
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Función para verificar si una fecha está vencida
export function isOverdue(date: string | Date): boolean {
  const today = new Date()
  const targetDate = new Date(date)
  return targetDate < today
}

// Función para obtener el estado de un préstamo
export function getLoanStatus(returnDate?: string, status?: string): "active" | "returned" | "overdue" {
  if (status === "returned") return "returned"
  if (!returnDate) return "active"
  return isOverdue(returnDate) ? "overdue" : "active"
}

// Función para filtrar elementos por texto
export function filterByText<T>(items: T[], searchTerm: string, fields: (keyof T)[]): T[] {
  if (!searchTerm.trim()) return items

  const term = searchTerm.toLowerCase()
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field]
      return value && String(value).toLowerCase().includes(term)
    }),
  )
}

// Función para ordenar elementos
export function sortBy<T>(items: T[], field: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal === bVal) return 0

    const comparison = aVal < bVal ? -1 : 1
    return direction === "asc" ? comparison : -comparison
  })
}

// Función para agrupar elementos
export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}

// Función para debounce
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Función para throttle
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Función para exportar a CSV
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>,
): void {
  if (!data.length) return

  const csvHeaders = headers
    ? Object.keys(headers)
        .map((key) => headers[key])
        .join(",")
    : Object.keys(data[0]).join(",")

  const csvRows = data.map((row) =>
    Object.values(row)
      .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : String(value)))
      .join(","),
  )

  const csvContent = [csvHeaders, ...csvRows].join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Función para validar formularios
export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} es requerido`
  }
  return null
}

export function validateNumber(value: any, fieldName: string, min?: number, max?: number): string | null {
  const num = Number(value)
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`
  }
  if (min !== undefined && num < min) {
    return `${fieldName} debe ser mayor o igual a ${min}`
  }
  if (max !== undefined && num > max) {
    return `${fieldName} debe ser menor o igual a ${max}`
  }
  return null
}

// Función para manejar errores
export function handleError(error: any): string {
  if (error?.message) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Ha ocurrido un error inesperado"
}

// Función para generar colores aleatorios
export function generateColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

// Función para obtener contraste de color
export function getContrastColor(hexColor: string): string {
  const r = Number.parseInt(hexColor.substr(1, 2), 16)
  const g = Number.parseInt(hexColor.substr(3, 2), 16)
  const b = Number.parseInt(hexColor.substr(5, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? "#000000" : "#FFFFFF"
}

// Función para formatear tamaño de archivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Función para generar slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
