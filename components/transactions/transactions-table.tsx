import { Transaction, TransactionStatus, TransactionType } from "@/src/types/inventory.types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, FileText, ArrowUpDown } from "lucide-react"
import { useState } from "react"

type SortField = 'date' | 'itemName' | 'teacherName' | 'status'
type SortOrder = 'asc' | 'desc'

interface TransactionsTableProps {
  transactions: Transaction[]
  onViewDetails: (transaction: Transaction) => void
}

export function TransactionsTable({ transactions, onViewDetails }: TransactionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Activo</Badge>
      case 'returned':
        return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Devuelto</Badge>
      case 'overdue':
        return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Vencido</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: TransactionType) => {
    return type === 'loan' ? 'Préstamo' : 'Donación'
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'itemName':
        comparison = a.itemName.localeCompare(b.itemName)
        break
      case 'teacherName':
        comparison = a.teacherName.localeCompare(b.teacherName)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <div 
                className="flex items-center cursor-pointer hover:text-primary"
                onClick={() => handleSort('date')}
              >
                Fecha
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div 
                className="flex items-center cursor-pointer hover:text-primary"
                onClick={() => handleSort('itemName')}
              >
                Artículo
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div 
                className="flex items-center cursor-pointer hover:text-primary"
                onClick={() => handleSort('teacherName')}
              >
                Profesor
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>
              <div 
                className="flex items-center cursor-pointer hover:text-primary"
                onClick={() => handleSort('status')}
              >
                Estado
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {format(new Date(transaction.date), 'PP', { locale: es })}
              </TableCell>
              <TableCell>{transaction.itemName}</TableCell>
              <TableCell>{transaction.teacherName}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{getTypeLabel(transaction.type)}</TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewDetails(transaction)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                No hay transacciones registradas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
