import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Transaction, TransactionStatus, TransactionType, Item } from "@/types/inventory.types"
import { getTeachers } from "@/lib/database"

interface TransactionFormProps {
  item?: Item
  transaction?: Transaction
  onSubmit: (data: TransactionFormData) => void
  onCancel: () => void
  isSubmitting: boolean
}

export type TransactionFormData = {
  itemId: string
  itemName: string
  teacherId: string
  teacherName: string
  quantity: number
  type: TransactionType
  date: Date
  returnDate?: Date
  status: TransactionStatus
  notes?: string
}

export function TransactionForm({ item, transaction, onSubmit, onCancel, isSubmitting }: TransactionFormProps) {
  const isEdit = !!transaction
  const [selectedType, setSelectedType] = useState<TransactionType>(transaction?.type || 'loan')
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const fetchedTeachers = await getTeachers();
      setTeachers(fetchedTeachers.map(t => ({ id: t.id, name: `${t.first_name} ${t.last_name}` })));
    };
    fetchTeachers();
  }, []);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      itemId: transaction?.itemId || item?.id || '',
      itemName: transaction?.itemName || item?.name || '',
      teacherId: (transaction as any)?.teacher_id || '',
      teacherName: transaction?.teacherName || '',
      quantity: transaction?.quantity || 1,
      type: transaction?.type || 'loan',
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      returnDate: transaction?.returnDate ? new Date(transaction.returnDate) : undefined,
      status: transaction?.status || 'active',
      notes: transaction?.notes || ''
    }
  })

  const watchQuantity = watch("quantity")
  const watchType = watch("type")
  const watchDate = watch("date")

  useEffect(() => {
    if (item) {
      setValue('itemId', item.id)
      setValue('itemName', item.name)
      setValue('quantity', 1, { shouldValidate: true })
    }
  }, [item, setValue])

  useEffect(() => {
    setSelectedType(watchType)
  }, [watchType])

  const maxQuantity = item ? item.quantity + (transaction?.quantity || 0) : 0
  const availableQuantity = item ? item.quantity : 0

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit({
      ...data,
      quantity: Number(data.quantity),
      date: data.date,
      returnDate: data.returnDate
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="itemName">Artículo</Label>
          <Input
            id="itemName"
            value={watch('itemName')}
            disabled
            className="bg-gray-50"
          />
          <input type="hidden" {...register('itemId')} />
          <input type="hidden" {...register('itemName')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacherId">Profesor</Label>
          <Select
            onValueChange={(value) => {
              setValue('teacherId', value);
              const selectedTeacher = teachers.find(t => t.id === value);
              if (selectedTeacher) {
                setValue('teacherName', selectedTeacher.name);
              }
            }}
            defaultValue={watch('teacherId')}
          >
            <SelectTrigger className={errors.teacherId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Seleccionar profesor" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teacherId && (
            <p className="text-sm text-red-500">{errors.teacherId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Transacción</Label>
          <Select
            value={watchType}
            onValueChange={(value: TransactionType) => {
              setValue('type', value)
              if (value === 'donation') {
                setValue('status', 'returned')
              } else {
                setValue('status', 'active')
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loan">Préstamo</SelectItem>
              <SelectItem value="donation">Donación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={maxQuantity}
            {...register('quantity', {
              required: 'La cantidad es requerida',
              min: { value: 1, message: 'La cantidad debe ser al menos 1' },
              max: { value: maxQuantity, message: `La cantidad no puede ser mayor a ${maxQuantity}` },
              valueAsNumber: true
            })}
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
          {item && (
            <p className="text-xs text-gray-500">
              Disponible: {availableQuantity} {availableQuantity === 1 ? 'unidad' : 'unidades'}
              {transaction && ` (${transaction.quantity} en esta transacción)`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchDate ? format(watchDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watchDate}
                onSelect={(date) => date && setValue('date', date)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {selectedType === 'loan' && (
          <div className="space-y-2">
            <Label>Fecha de Devolución</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch('returnDate') && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('returnDate') 
                    ? format(watch('returnDate') as Date, "PPP", { locale: es })
                    : <span>Seleccionar fecha de devolución</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('returnDate') || undefined}
                  onSelect={(date) => date && setValue('returnDate', date)}
                  initialFocus
                  locale={es}
                  disabled={(date) => date < (watch('date') || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {isEdit && (
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={watch('status')}
              onValueChange={(value: TransactionStatus) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="returned">Devuelto</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Notas adicionales sobre la transacción"
          {...register('notes')}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar Transacción' : 'Crear Transacción'}
        </Button>
      </div>
    </form>
  )
}