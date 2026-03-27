import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Item, Transaction } from "@/types/inventory.types"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export const generateInventoryPdf = (items: Item[], type: "herramientas" | "insumos") => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  // Title
  const title = type === "herramientas" ? "Reporte de Inventario - Herramientas" : "Reporte de Inventario - Insumos"
  doc.setFontSize(18)
  doc.text(title, 14, 20)

  // Date
  doc.setFontSize(10)
  doc.text(`Fecha de generación: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 14, 28)

  // Table header
  const tableColumn = [
    "Nombre",
    "Categoría",
    "Marca",
    "Condición",
    "Ubicación",
    "Cantidad",
    "Costo Unit.",
    "Valor Total",
    "Fuente",
    "Adquisición",
    "Estado"
  ]

  // Table rows
  const tableRows = items.map((item) => {
    const cost = item.cost ? Number(item.cost) : 0
    const totalValue = cost * item.quantity
    
    return [
      item.name,
      item.category,
      item.brand || "-",
      item.condition || "-",
      item.location || "-",
      item.quantity.toString(),
      cost > 0 ? `$${cost.toLocaleString('es-AR')}` : "-",
      totalValue > 0 ? `$${totalValue.toLocaleString('es-AR')}` : "-",
      (item as any).source || "-",
      item.acquisition_date ? format(new Date(item.acquisition_date), "dd/MM/yyyy") : "-",
      item.status === "active" ? "Activo" : item.status === "low-stock" ? "Stock Bajo" : "Sin Stock"
    ]
  })

  // Generate Table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 35 },
  })

  // Save the PDF
  const filename = `inventario_${type}_${format(new Date(), "yyyyMMdd")}.pdf`
  doc.save(filename)
}

export const generateLoanReceiptPdf = (transaction: Transaction) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  const drawReceipt = (yOffset: number, title: string) => {
    // Header
    doc.setFontSize(16)
    doc.setTextColor(41, 128, 185)
    doc.text("CFP 413 - SISTEMA DE INVENTARIO", pageWidth / 2, yOffset, { align: "center" })
    
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text("COMPROBANTE DE PRÉSTAMO / ENTREGA", pageWidth / 2, yOffset + 10, { align: "center" })
    doc.setFontSize(9)
    doc.text(`Copia: ${title}`, pageWidth - margin, yOffset + 10, { align: "right" })

    // Line
    doc.setDrawColor(200)
    doc.line(margin, yOffset + 15, pageWidth - margin, yOffset + 15)

    // Details Grid
    doc.setFontSize(10)
    doc.text("DATOS DEL PRÉSTAMO", margin, yOffset + 25)
    
    // Left Column
    doc.setFont("helvetica", "bold")
    doc.text("Profesor:", margin, yOffset + 35)
    doc.setFont("helvetica", "normal")
    doc.text(transaction.teacher_name || (transaction as any).teacherName || "-", margin + 30, yOffset + 35)
    
    doc.setFont("helvetica", "bold")
    doc.text("Curso/Taller:", margin, yOffset + 42)
    doc.setFont("helvetica", "normal")
    doc.text(transaction.course_name || "-", margin + 30, yOffset + 42)

    // Right Column (simulated by X offset)
    doc.setFont("helvetica", "bold")
    const rightColX = 120
    doc.text("Fecha:", rightColX, yOffset + 35)
    doc.setFont("helvetica", "normal")
    doc.text(transaction.date ? format(parseISO(transaction.date), "dd/MM/yyyy") : "-", rightColX + 40, yOffset + 35)
    
    doc.setFont("helvetica", "bold")
    doc.text("Devolución prevista:", rightColX, yOffset + 42)
    doc.setFont("helvetica", "normal")
    const retDate = transaction.return_date || (transaction as any).returnDate
    doc.text(retDate ? format(parseISO(retDate), "dd/MM/yyyy") : "No aplica", rightColX + 40, yOffset + 42)

    // Item Table
    autoTable(doc, {
      startY: yOffset + 50,
      head: [["ID Artículo", "Descripción del Artículo", "Cantidad", "Estado Inicial"]],
      body: [[
        transaction.item_id || (transaction as any).itemId || "-",
        transaction.item_name || (transaction as any).itemName || "-",
        transaction.quantity.toString(),
        "En buen estado"
      ]],
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    // Notes
    const finalY = (doc as any).lastAutoTable.finalY || yOffset + 70
    if (transaction.notes) {
      doc.setFont("helvetica", "bold")
      doc.text("Notas:", margin, finalY + 10)
      doc.setFont("helvetica", "normal")
      doc.text(transaction.notes, margin, finalY + 15, { maxWidth: pageWidth - (margin * 2) })
    }

    // Terms
    doc.setFontSize(8)
    doc.setTextColor(100)
    const termsY = finalY + 30
    doc.text("Declaro haber recibido el equipamiento descripto en perfectas condiciones y me comprometo a su cuidado", margin, termsY)
    doc.text("y devolución en la fecha estipulada.", margin, termsY + 4)

    // Signature lines
    doc.setDrawColor(0)
    doc.line(margin, termsY + 25, margin + 60, termsY + 25)
    doc.text("Firma del Profesor", margin + 10, termsY + 30)

    doc.line(pageWidth - margin - 60, termsY + 25, pageWidth - margin, termsY + 25)
    doc.text("Firma Responsable", pageWidth - margin - 50, termsY + 30)
  }

  // Draw two identical receipts on one A4 (Half page each)
  drawReceipt(20, "ORIGINAL")
  
  // Cut line
  ;(doc as any).setLineDash([2, 2], 0)
  doc.line(0, 148, pageWidth, 148)
  ;(doc as any).setLineDash([], 0)

  drawReceipt(165, "DUPLICADO")

  // Save/Download
  const filename = `comprobante_${transaction.id.substring(0, 8)}.pdf`
  doc.save(filename)
}
