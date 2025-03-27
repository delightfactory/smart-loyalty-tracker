
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/services/database';
import { Payment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function usePayments() {
  const queryClient = useQueryClient();
  
  const getAll = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.getAll()
  });
  
  const getById = (id: string) => useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsService.getById(id),
    enabled: !!id
  });
  
  const getByCustomerId = (customerId: string) => useQuery({
    queryKey: ['payments', 'customer', customerId],
    queryFn: () => paymentsService.getByCustomerId(customerId),
    enabled: !!customerId
  });
  
  const getByInvoiceId = (invoiceId: string) => useQuery({
    queryKey: ['payments', 'invoice', invoiceId],
    queryFn: () => paymentsService.getByInvoiceId(invoiceId),
    enabled: !!invoiceId
  });
  
  const addPayment = useMutation({
    mutationFn: (payment: Omit<Payment, 'id'>) => paymentsService.create(payment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'customer', data.customerId] });
      if (data.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['payments', 'invoice', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      toast({
        title: 'تم تسجيل الدفعة بنجاح',
        description: 'تم تسجيل الدفعة بنجاح وتحديث حالة الفاتورة',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تسجيل الدفعة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updatePayment = useMutation({
    mutationFn: (payment: Payment) => paymentsService.update(payment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'customer', data.customerId] });
      if (data.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['payments', 'invoice', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      toast({
        title: 'تم تحديث الدفعة بنجاح',
        description: 'تم تحديث معلومات الدفعة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث الدفعة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const deletePayment = useMutation({
    mutationFn: (id: string) => paymentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      // تحديث جميع البيانات المتعلقة بالعملاء والفواتير
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'تم حذف الدفعة بنجاح',
        description: 'تم حذف الدفعة بنجاح من النظام',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف الدفعة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    getAll,
    getById,
    getByCustomerId,
    getByInvoiceId,
    addPayment,
    updatePayment,
    deletePayment
  };
}
