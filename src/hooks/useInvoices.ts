
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '@/services/database';
import { Invoice, InvoiceItem } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';

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

// Mutation hooks for invoice operations
export function useInvoiceMutations() {
  const queryClient = useQueryClient();
  
  const addInvoice = useMutation({
    mutationFn: ({ invoice, items }: { invoice: Omit<Invoice, 'id'>, items: Omit<InvoiceItem, 'id'>[] }) => 
      invoicesService.create(invoice, items),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // 重要: 确保刷新所有客户数据
      toast({
        title: 'تم إنشاء الفاتورة بنجاح',
        description: `تم إنشاء الفاتورة رقم ${data.id} بنجاح`,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // 重要: 确保刷新所有客户数据
      toast({
        title: 'تم تحديث الفاتورة بنجاح',
        description: `تم تحديث الفاتورة رقم ${data.id} بنجاح`,
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // 重要: 确保刷新所有客户数据
      toast({
        title: 'تم حذف الفاتورة بنجاح',
        description: `تم حذف الفاتورة رقم ${data.id} بنجاح`,
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
