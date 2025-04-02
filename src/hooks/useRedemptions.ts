
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redemptionsService } from '@/services/database';
import { Redemption, RedemptionItem, RedemptionStatus } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';
import { useCustomers } from './useCustomers';

export function useRedemptions() {
  const queryClient = useQueryClient();
  const { getById: getCustomerById, updateCustomer } = useCustomers();
  
  // Set up realtime updates for redemptions
  useRealtime('redemptions');
  
  const getAll = useQuery({
    queryKey: ['redemptions'],
    queryFn: () => redemptionsService.getAll()
  });
  
  const getById = (id: string) => useQuery({
    queryKey: ['redemptions', id],
    queryFn: () => redemptionsService.getById(id),
    enabled: !!id
  });
  
  const getByCustomerId = (customerId: string) => useQuery({
    queryKey: ['redemptions', 'customer', customerId],
    queryFn: () => redemptionsService.getByCustomerId(customerId),
    enabled: !!customerId
  });
  
  const addRedemption = useMutation({
    mutationFn: ({ redemption, items }: { redemption: Omit<Redemption, 'id'>, items: Omit<RedemptionItem, 'id'>[] }) => 
      redemptionsService.create(redemption, items),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      toast({
        title: 'تم تسجيل عملية الاستبدال بنجاح',
        description: 'تم تسجيل عملية استبدال النقاط بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تسجيل عملية الاستبدال: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updateRedemption = useMutation({
    mutationFn: (redemption: Redemption) => redemptionsService.update(redemption),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', data.id] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', data.customerId] });
      
      // تحديث نقاط العميل عند تغيير حالة الاستبدال
      const customerQuery = getCustomerById(data.customerId);
      const customer = customerQuery.data;
      
      if (customer) {
        const oldRedemptionQuery = getById(data.id);
        const oldRedemption = oldRedemptionQuery.data;
        
        if (oldRedemption && oldRedemption.status !== data.status) {
          let updatedCustomer = { ...customer };
          
          // إذا تم تغيير الحالة من "مكتمل" إلى حالة أخرى، يتم إعادة النقاط للعميل
          if (oldRedemption.status === RedemptionStatus.COMPLETED && 
              data.status !== RedemptionStatus.COMPLETED) {
            updatedCustomer.pointsRedeemed -= data.totalPointsRedeemed;
            updatedCustomer.currentPoints = updatedCustomer.pointsEarned - updatedCustomer.pointsRedeemed;
          } 
          // إذا تم تغيير الحالة من حالة أخرى إلى "مكتمل"، يتم خصم النقاط من العميل
          else if (oldRedemption.status !== RedemptionStatus.COMPLETED && 
                  data.status === RedemptionStatus.COMPLETED) {
            updatedCustomer.pointsRedeemed += data.totalPointsRedeemed;
            updatedCustomer.currentPoints = updatedCustomer.pointsEarned - updatedCustomer.pointsRedeemed;
          }
          
          // تحديث بيانات العميل
          updateCustomer.mutate(updatedCustomer);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      toast({
        title: 'تم تحديث عملية الاستبدال بنجاح',
        description: 'تم تحديث معلومات عملية استبدال النقاط بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث عملية الاستبدال: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteRedemption = useMutation({
    mutationFn: (id: string) => redemptionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم حذف عملية الاستبدال بنجاح',
        description: 'تم حذف عملية استبدال النقاط بنجاح من النظام',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف عملية الاستبدال: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    getAll,
    getById,
    getByCustomerId,
    addRedemption,
    updateRedemption,
    deleteRedemption
  };
}
