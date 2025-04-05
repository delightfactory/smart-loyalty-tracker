
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/services/database';
import { Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRealtime } from './use-realtime';

export function useCustomers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // إعداد التحديثات في الوقت الفعلي للعملاء
  useRealtime('customers');
  
  const getAll = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        return await customersService.getAll();
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        toast({
          title: 'خطأ',
          description: `حدث خطأ أثناء جلب العملاء: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
    }
  });
  
  const getById = (id: string) => useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      try {
        return await customersService.getById(id);
      } catch (error: any) {
        console.error(`Error fetching customer ${id}:`, error);
        toast({
          title: 'خطأ',
          description: `حدث خطأ أثناء جلب العميل: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!id
  });
  
  const addCustomer = useMutation({
    mutationFn: (customer: Omit<Customer, 'id'>) => {
      // التأكد من أن جميع القيم العددية هي أرقام وليست سلاسل نصية
      const normalizedCustomer: Omit<Customer, 'id'> = {
        ...customer,
        currentPoints: Number(customer.currentPoints || 0),
        pointsEarned: Number(customer.pointsEarned || 0),
        pointsRedeemed: Number(customer.pointsRedeemed || 0),
        classification: Number(customer.classification || 0),
        level: Number(customer.level || 0),
        creditBalance: Number(customer.creditBalance || 0)
      };
      
      console.log('Adding customer (normalized):', normalizedCustomer);
      return customersService.create(normalizedCustomer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
    mutationFn: (customer: Customer) => {
      // التأكد من أن جميع القيم العددية هي أرقام وليست سلاسل نصية
      const normalizedCustomer: Customer = {
        ...customer,
        currentPoints: Number(customer.currentPoints || 0),
        pointsEarned: Number(customer.pointsEarned || 0),
        pointsRedeemed: Number(customer.pointsRedeemed || 0),
        classification: Number(customer.classification || 0),
        level: Number(customer.level || 0),
        creditBalance: Number(customer.creditBalance || 0)
      };
      
      console.log('Updating customer (normalized):', normalizedCustomer);
      return customersService.update(normalizedCustomer);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
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
    getAll,
    getById,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
}
