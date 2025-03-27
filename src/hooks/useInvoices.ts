
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '@/services/database';
import { Invoice } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function useInvoices() {
  const queryClient = useQueryClient();
  
  const getAll = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesService.getAll()
  });
  
  const getById = (id: string) => useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesService.getById(id),
    enabled: !!id
  });
  
  const getByCustomerId = (customerId: string) => useQuery({
    queryKey: ['invoices', 'customer', customerId],
    queryFn: () => invoicesService.getByCustomerId(customerId),
    enabled: !!customerId
  });
  
  const addInvoice = useMutation({
    mutationFn: (invoice: Omit<Invoice, 'id'>) => invoicesService.create(invoice),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
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
    getAll,
    getById,
    getByCustomerId,
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
}
