import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePayments } from '@/hooks/usePayments';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { useToast } from '@/components/ui/use-toast';
import { PaymentType } from '@/lib/types';

const paymentSchema = z.object({
  id: z.string(),
  customerId: z.string({ required_error: 'يجب اختيار العميل' }),
  invoiceId: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'يجب إدخال مبلغ أكبر من صفر' }),
  paymentDate: z.string().min(1, { message: 'يجب تحديد تاريخ الدفع' }),
  method: z.string().min(1, { message: 'يجب تحديد طريقة الدفع' }),
  notes: z.string().optional(),
});

type EditPaymentFormValues = z.infer<typeof paymentSchema>;

interface EditPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  paymentId: string;
}

const EditPaymentDialog: React.FC<EditPaymentDialogProps> = ({ open, onClose, paymentId }) => {
  const { toast } = useToast();
  const { getById, updatePayment } = usePayments();
  const { getAll: getAllCustomers } = useCustomers();
  const { getByCustomerId } = useInvoices();

  const { data: customers = [] } = getAllCustomers;
  const { data: payment, isLoading: isLoadingPayment } = getById(paymentId);
  const { data: invoices = [], isLoading: isLoadingInvoices } = getByCustomerId(payment?.customerId || '');

  const form = useForm<EditPaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      id: paymentId,
      customerId: '',
      invoiceId: '',
      amount: 0,
      paymentDate: new Date().toISOString().slice(0, 10),
      method: 'نقداً',
      notes: '',
    },
  });

  useEffect(() => {
    if (payment) {
      form.reset({
        id: payment.id,
        customerId: payment.customerId,
        invoiceId: payment.invoiceId || '',
        amount: payment.amount,
        paymentDate: new Date(payment.date).toISOString().slice(0, 10),
        method: payment.method,
        notes: payment.notes || '',
      });
    }
  }, [payment]);

  const onSubmit = (data: EditPaymentFormValues) => {
    updatePayment.mutate(
      {
        id: data.id,
        customerId: data.customerId,
        invoiceId: data.invoiceId || '',
        amount: data.amount,
        date: new Date(data.paymentDate),
        method: data.method,
        notes: data.notes || '',
        type: PaymentType.PAYMENT,
      },
      {
        onSuccess: () => {
          toast({ title: 'تم تحديث الدفعة بنجاح' });
          onClose();
        },
        onError: (error: Error) => {
          toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل الدفعة</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">العميل</label>
            <Select
              value={form.getValues('customerId')}
              onValueChange={(val) => {
                form.setValue('customerId', val);
                form.setValue('invoiceId', '');
              }}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر العميل" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.watch('customerId') && (
            <div>
              <label className="block mb-1 font-semibold">الفاتورة</label>
              <Select
                value={form.getValues('invoiceId')}
                onValueChange={(val) => form.setValue('invoiceId', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الفاتورة (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.id.slice(-6)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="block mb-1 font-semibold">المبلغ</label>
            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  className="ltr"
                />
              )}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">التاريخ</label>
            <Input
              type="date"
              value={form.getValues('paymentDate')}
              onChange={(e) => form.setValue('paymentDate', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">طريقة الدفع</label>
            <Select
              value={form.getValues('method')}
              onValueChange={(val) => form.setValue('method', val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الطريقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نقداً">نقداً</SelectItem>
                <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                <SelectItem value="شيك">شيك</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">ملاحظات</label>
            <Input
              value={form.getValues('notes')}
              onChange={(e) => form.setValue('notes', e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={updatePayment.isPending || isLoadingPayment}
            >
              {updatePayment.isPending ? 'جاري التحديث...' : 'تحديث الدفعة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;
