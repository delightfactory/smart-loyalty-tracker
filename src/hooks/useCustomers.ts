
// Update the useCustomers hook to properly expose customers and isLoading

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/services/database';
import { Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRealtime } from './use-realtime';
import { useInvoices } from './useInvoices';
import { pointsHistoryService } from '@/services/points-history';

export function useCustomers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // إعداد التحديثات في الوقت الفعلي للعملاء
  useRealtime('customers');
  useRealtime('points_history');
  
  // استخدم بيانات الفواتير من hook useInvoices.getAll بدلاً من useInvoices مباشرة
  const { getAll: invoicesQuery } = useInvoices();
  const invoices = invoicesQuery?.data ?? [];
  const invoicesLoading = invoicesQuery?.isLoading ?? false;
  
  const getAll = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        const customers = await customersService.getAll();
        // لا تضف حسابات افتراضية هنا، فقط اعتمد على القيم من قاعدة البيانات
        return customers;
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        toast({
          variant: 'destructive',
          title: 'حدث خطأ',
          description: 'تعذر جلب بيانات العملاء',
        });
        return [];
      }
    },
    enabled: !invoicesLoading,
    staleTime: 0 // Always fetch fresh data for accuracy
  });
  
  // Make direct access to data and loading state easier
  const customers = getAll.data || [];
  const isLoading = getAll.isLoading;
  
  const getById = (id: string) => useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      try {
        const customer = await customersService.getById(id);
        // لا تضف حسابات افتراضية هنا، فقط اعتمد على القيم من قاعدة البيانات
        return customer;
      } catch (error: any) {
        console.error(`Error fetching customer ${id}:`, error);
        toast({
          title: 'خطأ',
          description: `حدث خطأ أثناء جلب العميل: ${error.message}`,
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!id && !invoicesLoading
  });
  
  const addCustomer = useMutation({
    mutationFn: async (customerData: Omit<Customer, "id">) => {
      console.log('Adding customer:', customerData);
      return await customersService.create(customerData as Customer);
    },
    onSuccess: (data) => {
      console.log('Customer added successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'تم إضافة العميل بنجاح',
        description: 'تمت إضافة العميل الجديد بنجاح',
      });
    },
    onError: (error: Error) => {
      console.error('Error adding customer:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء إضافة العميل: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updateCustomer = useMutation({
    mutationFn: async (customer: Customer) => {
      console.log('Updating customer:', customer);
      return await customersService.update(customer);
    },
    onSuccess: (data) => {
      console.log('Customer updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] });
      toast({
        title: 'تم تحديث العميل بنجاح',
        description: 'تم تحديث معلومات العميل بنجاح',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating customer:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث العميل: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting customer:', id);
      return await customersService.delete(id);
    },
    onSuccess: (_, variables) => {
      console.log('Customer deleted successfully:', variables);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم حذف العميل بنجاح',
        description: 'تم حذف العميل بنجاح من النظام',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting customer:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف العميل: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    customers,  // Direct access to customers data
    isLoading,  // Direct access to loading state
    getAll,     // For advanced usage
    getById,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}
