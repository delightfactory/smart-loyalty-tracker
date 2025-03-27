
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/services/database';
import { Customer } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';

export function useCustomers() {
  const queryClient = useQueryClient();
  
  // إعداد التحديثات في الوقت الفعلي للعملاء
  useRealtime('customers');
  
  const getAll = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll()
  });
  
  const getById = (id: string) => useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersService.getById(id),
    enabled: !!id
  });
  
  const addCustomer = useMutation({
    mutationFn: (customer: Omit<Customer, 'id'>) => {
      // التأكد من أن جميع القيم العددية هي أرقام وليست سلاسل نصية
      const normalizedCustomer: Omit<Customer, 'id'> = {
        ...customer,
        currentPoints: Number(customer.currentPoints),
        pointsEarned: Number(customer.pointsEarned),
        pointsRedeemed: Number(customer.pointsRedeemed),
        classification: Number(customer.classification),
        level: Number(customer.level),
        creditBalance: Number(customer.creditBalance)
      };
      
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
        currentPoints: Number(customer.currentPoints),
        pointsEarned: Number(customer.pointsEarned),
        pointsRedeemed: Number(customer.pointsRedeemed),
        classification: Number(customer.classification),
        level: Number(customer.level),
        creditBalance: Number(customer.creditBalance)
      };
      
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
