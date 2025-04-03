
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService, customersService } from '@/services/database';
import { Invoice, InvoiceItem, InvoiceStatus } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';
import { useCustomers } from './useCustomers';

// Custom hook for fetching all invoices
export function useAllInvoices() {
  useRealtime('invoices');
  
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Custom hook for fetching a single invoice
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Custom hook for fetching customer invoices
export function useCustomerInvoices(customerId: string) {
  return useQuery({
    queryKey: ['invoices', 'customer', customerId],
    queryFn: () => invoicesService.getByCustomerId(customerId),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// تحقق من حالة الفواتير وتحديث بيانات العميل
const updateCustomerDataBasedOnInvoices = async (customerId: string, queryClient: any) => {
  // الحصول على جميع فواتير العميل
  const invoices = await invoicesService.getByCustomerId(customerId);
  
  // حساب النقاط الإجمالية المكتسبة والمستبدلة
  let totalPointsEarned = 0;
  let totalPointsRedeemed = 0;
  let totalCreditBalance = 0;
  
  // حساب الرصيد المستحق (الآجل)
  invoices.forEach(invoice => {
    totalPointsEarned += invoice.pointsEarned;
    totalPointsRedeemed += invoice.pointsRedeemed;
    
    // حساب الرصيد الآجل للفواتير غير المدفوعة أو المدفوعة جزئياً
    if (invoice.status === InvoiceStatus.UNPAID || 
        invoice.status === InvoiceStatus.PARTIALLY_PAID || 
        invoice.status === InvoiceStatus.OVERDUE) {
      
      // حساب المبلغ المدفوع
      const paidAmount = invoice.payments?.reduce((sum, payment) => {
        return payment.type === 'payment' ? sum + payment.amount : sum - payment.amount;
      }, 0) || 0;
      
      // إضافة المبلغ المتبقي إلى الرصيد الآجل
      totalCreditBalance += (invoice.totalAmount - paidAmount);
    }
  });
  
  // تحديث بيانات العميل
  const { getById } = useCustomers();
  const customerQuery = getById(customerId);
  
  if (customerQuery.data) {
    const customer = customerQuery.data;
    customer.pointsEarned = totalPointsEarned;
    customer.pointsRedeemed = totalPointsRedeemed;
    customer.currentPoints = totalPointsEarned - totalPointsRedeemed;
    customer.creditBalance = totalCreditBalance;
    
    // تحديث بيانات العميل في قاعدة البيانات - هنا نستخدم customersService بدلاً من invoicesService
    await customersService.updateCustomerData(customer);
    
    // تحديث الذاكرة المؤقتة
    queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  }
};

// Mutation hooks for invoice operations
export function useInvoiceMutations() {
  const queryClient = useQueryClient();
  
  const addInvoice = useMutation({
    mutationFn: ({ invoice, items }: { invoice: Omit<Invoice, 'id'>, items: Omit<InvoiceItem, 'id'>[] }) => 
      invoicesService.create(invoice, items),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      
      // تحديث بيانات العميل بعد إضافة فاتورة جديدة
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم إنشاء الفاتورة بنجاح',
        description: `تم إنشاء الفاتورة رقم ${data.id} بنجاح`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء إنشاء الفاتورة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updateInvoice = useMutation({
    mutationFn: (invoice: Invoice) => invoicesService.update(invoice),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      
      // تحديث بيانات العميل بعد تحديث الفاتورة
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم تحديث الفاتورة بنجاح',
        description: `تم تحديث الفاتورة رقم ${data.id} بنجاح`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث الفاتورة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteInvoice = useMutation({
    mutationFn: async (invoice: { id: string; customerId: string }) => {
      await invoicesService.delete(invoice.id);
      return invoice;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      
      // تحديث بيانات العميل بعد حذف الفاتورة
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم حذف الفاتورة بنجاح',
        description: `تم حذف الفاتورة رقم ${data.id} بنجاح`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف الفاتورة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
}

// Main hook that combines all invoice hooks
export function useInvoices() {
  // Set up realtime updates for invoices
  useRealtime('invoices');
  
  const getAll = useAllInvoices();
  const getById = useInvoice;
  const getByCustomerId = useCustomerInvoices;
  const { addInvoice, updateInvoice, deleteInvoice } = useInvoiceMutations();
  
  return {
    getAll,
    getById,
    getByCustomerId,
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
}
