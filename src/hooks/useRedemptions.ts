
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redemptionsService } from '@/services/database';
import { Redemption } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';

export function useRedemptions() {
  const queryClient = useQueryClient();
  
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
    mutationFn: (redemption: Omit<Redemption, 'id'>) => redemptionsService.create(redemption),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      toast({
        title: 'تم تسجيل عملية الاستبدال بنجاح',
        description: 'تم تسجيل عملية استبدال النقاط بنجاح',
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', data.id] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customerId] });
      toast({
        title: 'تم تحديث عملية الاستبدال بنجاح',
        description: 'تم تحديث معلومات عملية استبدال النقاط بنجاح',
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
