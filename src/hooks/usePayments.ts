import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/services/database';
import { Payment } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';
import { updateCustomerDataBasedOnInvoices } from './useInvoices';

export function usePayments() {
  const queryClient = useQueryClient();
  
  // إعداد التحديثات في الوقت الفعلي للمدفوعات
  useRealtime('payments');
  
  const getAll = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.getAll()
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
    mutationFn: (payment: Omit<Payment, 'id'>) => {
      console.log('Adding payment (original):', payment);
      
      // التأكد من أننا نعمل مع كائن دفعة صحيح مع نوع Date
      let processedPayment = { ...payment };
      
      if (typeof processedPayment.date === 'string') {
        processedPayment.date = new Date(processedPayment.date);
      }
      
      // التأكد من تحويل جميع القيم الرقمية بشكل صحيح
      processedPayment = {
        ...processedPayment,
        amount: Number(processedPayment.amount || 0)
      };
      
      console.log('Adding payment (processed):', processedPayment);
      return paymentsService.create(processedPayment);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'customer', data.customerId] });
      
      if (data.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['payments', 'invoice', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // تحديث رصيد العميل بشكل لحظي بعد الدفع
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم تسجيل الدفعة بنجاح',
        description: 'تم تسجيل الدفعة بنجاح وتحديث حالة الفاتورة',
      });
    },
    onError: (error: Error) => {
      console.error('Error adding payment:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تسجيل الدفعة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updatePayment = useMutation({
    mutationFn: (payment: Payment) => {
      console.log('Updating payment (original):', payment);
      
      // التأكد من تحويل جميع القيم الرقمية بشكل صحيح
      const processedPayment = {
        ...payment,
        amount: Number(payment.amount || 0)
      };
      
      // التأكد من نوع التاريخ
      if (typeof processedPayment.date === 'string') {
        processedPayment.date = new Date(processedPayment.date);
      }
      
      console.log('Updating payment (processed):', processedPayment);
      return paymentsService.update(processedPayment);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'customer', data.customerId] });
      
      if (data.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['payments', 'invoice', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices', data.invoiceId] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      // تحديث رصيد العميل بشكل لحظي بعد تعديل الدفعة
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم تحديث الدفعة بنجاح',
        description: 'تم تحديث معلومات الدفعة بنجاح',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating payment:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث الدفعة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const deletePayment = useMutation({
    mutationFn: (id: string & { customerId?: string }) => paymentsService.delete(id),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      // تحديث جميع البيانات المتعلقة بالعملاء والفواتير
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      // تحديث رصيد العميل بشكل لحظي بعد حذف الدفعة
      // يجب تمرير customerId بشكل صريح عند الحذف إذا كان متاحًا
      if ((variables as any)?.customerId) {
        await updateCustomerDataBasedOnInvoices((variables as any).customerId, queryClient);
      }
      toast({
        title: 'تم حذف الدفعة بنجاح',
        description: 'تم حذف الدفعة بنجاح من النظام',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting payment:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف الدفعة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    getAll,
    getByCustomerId,
    getByInvoiceId,
    addPayment,
    updatePayment,
    deletePayment
  };
}
