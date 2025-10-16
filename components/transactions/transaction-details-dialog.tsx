import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Transaction, TransactionStatus, TransactionType } from "@/types/inventory.types"

interface TransactionDetailsDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function TransactionDetailsDialog({ transaction, isOpen, onClose }: TransactionDetailsDialogProps) {
  if (!transaction) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Transacción</DialogTitle>
          <DialogDescription>
            Información detallada de la transacción
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Artículo</h4>
              <p className="mt-1">{transaction.itemName}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Profesor</h4>
              <p className="mt-1">{transaction.teacherName}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Tipo de Transacción</h4>
              <p className="mt-1">{getTypeLabel(transaction.type)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Cantidad</h4>
              <p className="mt-1">{transaction.quantity}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Fecha</h4>
              <p className="mt-1">
                {format(new Date(transaction.date), 'PPPP', { locale: es })}
              </p>
            </div>
            
            {transaction.returnDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  {transaction.type === 'loan' ? 'Fecha de Devolución' : 'Fecha de Registro'}
                </h4>
                <p className="mt-1">
                  {format(new Date(transaction.returnDate), 'PPPP', { locale: es })}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Estado</h4>
              <div className="mt-1">{getStatusBadge(transaction.status)}</div>
            </div>
            
            {transaction.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Notas</h4>
                <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {transaction.notes}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
