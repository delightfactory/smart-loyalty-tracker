
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pointsHistoryService, PointsHistoryEntry } from '@/services/points-history';
import { customersService } from '@/services/database';
import { Customer } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';

export function usePointsHistory() {
  const queryClient = useQueryClient();
  
  // Enable realtime updates for points_history table
  useRealtime('points_history');
  
  const getByCustomerId = (customerId: string) => useQuery({
    queryKey: ['points_history', customerId],
    queryFn: () => pointsHistoryService.getByCustomerId(customerId),
    enabled: !!customerId
  });
  
  const addManualPoints = useMutation({
    mutationFn: async ({ 
      customerId, 
      points, 
      type, 
      notes 
    }: { 
      customerId: string; 
      points: number; 
      type: 'manual_add' | 'manual_deduct'; 
      notes?: string;
    }) => {
      // Fetch current customer data
      const customer = await customersService.getById(customerId);
      
      // Calculate new points based on the adjustment type
      const adjustedPoints = type === 'manual_add' ? points : -points;
      
      // Create entry in points_history
      await pointsHistoryService.addEntry({
        customer_id: customerId,
        points: adjustedPoints,
        type: type,
        source: 'manual_adjustment',
        notes: notes || ''
      });
      
      // Update customer record with new points totals
      const updatedCustomer: Customer = {
        ...customer,
        // For manual add, we increase pointsEarned; for manual deduct, we increase pointsRedeemed
        pointsEarned: type === 'manual_add' 
          ? customer.pointsEarned + points 
          : customer.pointsEarned,
        pointsRedeemed: type === 'manual_deduct' 
          ? customer.pointsRedeemed + points 
          : customer.pointsRedeemed,
        currentPoints: customer.currentPoints + (type === 'manual_add' ? points : -points)
      };
      
      return await customersService.update(updatedCustomer);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['points_history', data.id] });
      toast({
        title: 'تم تحديث النقاط بنجاح',
        description: 'تم تحديث نقاط العميل بنجاح',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating customer points:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث نقاط العميل: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    getByCustomerId,
    addManualPoints
  };
}
