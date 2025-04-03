
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redemptionsService, customersService } from '@/services/database';
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
  
  // دالة لتحديث نقاط العميل بعد عمليات الاستبدال
  const updateCustomerPoints = async (customerId: string) => {
    try {
      // الحصول على بيانات العميل
      const { data: customer } = await customersService.getById(customerId);
      
      if (!customer) {
        console.error(`Customer with ID ${customerId} not found`);
        return;
      }
      
      // الحصول على جميع عمليات الاستبدال المكتملة للعميل
      const redemptions = await redemptionsService.getByCustomerId(customerId);
      const completedRedemptions = redemptions.filter(r => r.status === RedemptionStatus.COMPLETED);
      
      // حساب إجمالي النقاط المستبدلة
      const totalPointsRedeemed = completedRedemptions.reduce(
        (sum, redemption) => sum + redemption.totalPointsRedeemed, 0
      );
      
      // تحديث بيانات العميل
      customer.pointsRedeemed = totalPointsRedeemed;
      customer.currentPoints = customer.pointsEarned - totalPointsRedeemed;
      
      // تحديث بيانات العميل في قاعدة البيانات
      await customersService.updateCustomerData(customer);
      
      // تحديث الذاكرة المؤقتة
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      
      console.log(`Updated customer points for ${customerId}:`, {
        pointsRedeemed: totalPointsRedeemed,
        currentPoints: customer.pointsEarned - totalPointsRedeemed
      });
    } catch (error) {
      console.error('Error updating customer points:', error);
    }
  };
  
  const addRedemption = useMutation({
    mutationFn: ({ redemption, items }: { redemption: Omit<Redemption, 'id'>, items: Omit<RedemptionItem, 'id'>[] }) => 
      redemptionsService.create(redemption, items),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', data.customerId] });
      
      // تحديث نقاط العميل بعد إضافة عملية استبدال
      if (data.status === RedemptionStatus.COMPLETED) {
        await updateCustomerPoints(data.customerId);
      }
      
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
      } else {
        // إذا لم يكن هناك بيانات للعميل في الذاكرة المؤقتة، نستخدم الطريقة العامة لتحديث النقاط
        await updateCustomerPoints(data.customerId);
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
    mutationFn: (redemption: { id: string; customerId: string; status: RedemptionStatus }) => 
      redemptionsService.delete(redemption.id).then(() => redemption),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      
      // إذا كانت عملية الاستبدال مكتملة، يجب تحديث نقاط العميل بعد الحذف
      if (data.status === RedemptionStatus.COMPLETED) {
        await updateCustomerPoints(data.customerId);
      }
      
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
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
