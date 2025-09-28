
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { redemptionsService, customersService } from '@/services/database';
import { Redemption, RedemptionItem, RedemptionStatus, Customer } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';
import { pointsHistoryService } from '@/services/points-history';

// تحديث نقاط العميل بناءً على عمليات الاستبدال
const updateCustomerPoints = async (customerId: string, queryClient: any) => {
  try {
    console.log(`Updating customer points for ${customerId}`);
    
    // الحصول على بيانات العميل
    const customer = await customersService.getById(customerId);
    
    if (!customer) {
      console.error(`Customer with ID ${customerId} not found`);
      return;
    }
    
    // الحصول على جميع عمليات الاستبدال للعميل
    const redemptions = await redemptionsService.getByCustomerId(customerId);
    
    // حساب النقاط المستبدلة فقط للعمليات غير الملغية
    let totalPointsRedeemed = 0;
    let latestRedemptionDate = null;
    redemptions.forEach(redemption => {
      if (redemption.status !== RedemptionStatus.CANCELLED) {
        totalPointsRedeemed += redemption.totalPointsRedeemed;
        // تحديث أحدث تاريخ استبدال
        if (redemption.date) {
          const redemptionDate = new Date(redemption.date);
          if (!latestRedemptionDate || redemptionDate > latestRedemptionDate) {
            latestRedemptionDate = redemptionDate;
          }
        }
      }
    });
    
    // الحصول على سجل التعديلات اليدوية للنقاط
    let manualPointsAdjustments = { added: 0, deducted: 0 };
    let latestManualAdjustmentDate = null;
    
    try {
      const pointsHistory = await pointsHistoryService.getByCustomerId(customerId);
      
      pointsHistory.forEach(entry => {
        if (entry.type === 'manual_add') {
          manualPointsAdjustments.added += entry.points;
        } else if (entry.type === 'manual_deduct') {
          manualPointsAdjustments.deducted += Math.abs(entry.points);
        }
        
        // تحديث أحدث تاريخ تعديل يدوي
        if (entry.created_at) {
          const adjustmentDate = new Date(entry.created_at);
          if (!latestManualAdjustmentDate || adjustmentDate > latestManualAdjustmentDate) {
            latestManualAdjustmentDate = adjustmentDate;
          }
        }
      });
      console.log(`Manual point adjustments for ${customerId}:`, manualPointsAdjustments);
    } catch (error) {
      console.error('Error fetching points history:', error);
      // Continue without points history if service isn't available
    }
    
    // الحصول على النقاط المكتسبة من الفواتير
    let earnedFromInvoices = 0;
    if (typeof import('@/hooks/useInvoices').then === 'function') {
      try {
        // Fix: Replace the incorrect customersService.getInvoices with dynamic import of invoice service
        const { invoicesService } = await import('@/services/database');
        const invoices = await invoicesService.getByCustomerId(customerId);
        earnedFromInvoices = invoices.reduce((sum, invoice) => sum + (invoice.pointsEarned || 0), 0);
      } catch (error) {
        console.error('Error fetching invoices for points calculation:', error);
      }
    }
    
    // تحديد أحدث تاريخ تفاعل
    let lastActive = null;
    const dates = [latestRedemptionDate, latestManualAdjustmentDate].filter(Boolean);
    
    if (dates.length > 0) {
      lastActive = new Date(Math.max(...dates.map(d => d instanceof Date ? d.getTime() : new Date(d).getTime())));
    }
    
    // تطبيق التعديلات اليدوية على إجمالي النقاط
    const adjustedPointsEarned = earnedFromInvoices + manualPointsAdjustments.added;
    const adjustedPointsRedeemed = totalPointsRedeemed + manualPointsAdjustments.deducted;
    
    // تحديث بيانات العميل
    const updatedCustomer = {
      ...customer,
      pointsRedeemed: adjustedPointsRedeemed,
      pointsEarned: adjustedPointsEarned,
      currentPoints: adjustedPointsEarned - adjustedPointsRedeemed,
      lastActive: lastActive ? lastActive.toISOString() : customer.lastActive || null
    };
    
    // تحديث بيانات العميل في قاعدة البيانات
    await customersService.update(updatedCustomer);
    
    // تحديث الذاكرة المؤقتة
    queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    
    console.log(`Updated customer points for ${customerId}:`, {
      pointsRedeemed: adjustedPointsRedeemed,
      pointsEarned: adjustedPointsEarned,
      currentPoints: adjustedPointsEarned - adjustedPointsRedeemed,
      lastActive: lastActive ? lastActive.toISOString() : customer.lastActive || null
    });
  } catch (error) {
    console.error('Error updating customer points:', error);
  }
};

export function useRedemptions() {
  const queryClient = useQueryClient();
  
  // إعداد التحديثات في الوقت الفعلي لعمليات الاستبدال والعملاء والفواتير والمدفوعات
  useRealtime('redemptions');
  useRealtime('customers');
  useRealtime('invoices');
  useRealtime('payments');
  
  // إسترجاع كل عمليات الاستبدال
  const getAll = useQuery({
    queryKey: ['redemptions'],
    queryFn: () => redemptionsService.getAll()
  });
  
  /**
   * جلب الاستبدالات بتصفح محكوم بالخادم
   */
  const getPaginated = (params: {
    pageIndex: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) => useQuery<{ items: Redemption[]; total: number }, Error>({
    queryKey: [
      'redemptions',
      'paginated',
      params.pageIndex,
      params.pageSize,
      params.searchTerm,
      params.statusFilter,
      params.dateFrom,
      params.dateTo,
      params.sortBy,
      params.sortDir
    ],
    queryFn: () => redemptionsService.getPaginated(
      params.pageIndex,
      params.pageSize,
      params.searchTerm,
      params.statusFilter,
      params.dateFrom,
      params.dateTo,
      params.sortBy,
      params.sortDir
    )
  });
  
  // إسترجاع عمليات الاستبدال لعميل محدد
  const getByCustomerId = (customerId: string) => useQuery({
    queryKey: ['redemptions', 'customer', customerId],
    queryFn: () => redemptionsService.getByCustomerId(customerId),
    enabled: !!customerId
  });
  
  // إسترجاع عملية استبدال محددة بالمعرف
  const getById = (id: string) => useQuery({
    queryKey: ['redemptions', id],
    queryFn: () => redemptionsService.getById(id),
    enabled: !!id
  });
  
  // إضافة عملية استبدال جديدة
  const addRedemption = useMutation({
    mutationFn: ({ redemption, items }: { 
      redemption: Omit<Redemption, 'id'>, 
      items: Omit<RedemptionItem, 'id'>[] 
    }) => {
      console.log('Adding redemption:', redemption);
      console.log('Redemption items:', items);
      
      // التأكد من نوع التاريخ
      let processedRedemption = { ...redemption };
      if (typeof processedRedemption.date === 'string') {
        processedRedemption.date = new Date(processedRedemption.date);
      }
      
      return redemptionsService.create(processedRedemption, items);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', data.customerId] });
      
      // تحديث نقاط العميل بعد إضافة الاستبدال
      await updateCustomerPoints(data.customerId, queryClient);
      
      toast({
        title: 'تم تسجيل عملية الاستبدال بنجاح',
        description: `تم تسجيل استبدال النقاط برقم ${data.id}`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error adding redemption:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تسجيل عملية الاستبدال: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // تحديث عملية استبدال
  const updateRedemption = useMutation({
    mutationFn: (redemption: Redemption) => {
      console.log('Updating redemption:', redemption);
      
      // التأكد من نوع التاريخ
      let processedRedemption = { ...redemption };
      if (typeof processedRedemption.date === 'string') {
        processedRedemption.date = new Date(processedRedemption.date);
      }
      
      return redemptionsService.update(processedRedemption);
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', data.id] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', data.customerId] });
      
      // تحديث نقاط العميل بعد تعديل الاستبدال
      await updateCustomerPoints(data.customerId, queryClient);
      
      // تحديث بيانات العميل بناءً على الفواتير أيضًا لضمان دقة آخر نشاط
      if (typeof import('@/hooks/useInvoices').then === 'function') {
        // dynamic import to avoid circular dependency
        const { updateCustomerDataBasedOnInvoices } = await import('@/hooks/useInvoices');
        await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      }
      
      toast({
        title: 'تم تحديث عملية الاستبدال بنجاح',
        description: `تم تحديث عملية الاستبدال برقم ${data.id}`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating redemption:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث عملية الاستبدال: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // حذف عملية استبدال
  const deleteRedemption = useMutation({
    mutationFn: (params: { id: string; customerId: string; status: RedemptionStatus }) => {
      console.log('Deleting redemption:', params);
      return redemptionsService.delete(params.id).then(() => params);
    },
    onSuccess: async (params) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', params.customerId] });
      
      // تحديث نقاط العميل بعد حذف الاستبدال
      await updateCustomerPoints(params.customerId, queryClient);
      
      toast({
        title: 'تم حذف عملية الاستبدال بنجاح',
        description: 'تم حذف عملية الاستبدال من النظام',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting redemption:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف عملية الاستبدال: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    getAll,
    getPaginated,
    getByCustomerId,
    getById,
    addRedemption,
    updateRedemption,
    deleteRedemption
  };
}
