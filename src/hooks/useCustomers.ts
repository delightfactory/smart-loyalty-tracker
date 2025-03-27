
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/services/database';
import { Customer } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

export function useCustomers() {
  const queryClient = useQueryClient();
  
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
    mutationFn: (customer: Omit<Customer, 'id'>) => customersService.create(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم إضافة العميل بنجاح',
        description: 'تمت إضافة العميل الجديد بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء إضافة العميل: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updateCustomer = useMutation({
    mutationFn: (customer: Customer) => customersService.update(customer),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] });
      toast({
        title: 'تم تحديث العميل بنجاح',
        description: 'تم تحديث معلومات العميل بنجاح',
      });
    },
    onError: (error: Error) => {
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
