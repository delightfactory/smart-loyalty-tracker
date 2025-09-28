import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService, customersService, redemptionsService } from '@/services/database';
import { Invoice, InvoiceItem, InvoiceStatus, Customer, PaymentMethod, PaymentType, RedemptionStatus } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';
import { calculateClassificationAndLevel } from '@/lib/customerClassification';
import { pointsHistoryService, PointsHistoryEntry } from '@/services/points-history';

// Custom hook for fetching all invoices
export function useAllInvoices() {
  useRealtime('invoices');
  
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Custom hook for fetching a single invoice
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Custom hook for fetching customer invoices
export function useCustomerInvoices(customerId: string) {
  return useQuery({
    queryKey: ['invoices', 'customer', customerId],
    queryFn: () => invoicesService.getByCustomerId(customerId),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// تحقق من حالة الفواتير وتحديث بيانات العميل
import { paymentsService } from '@/services/database';

export const updateCustomerDataBasedOnInvoices = async (customerId: string, queryClient: any) => {
  try {
    console.log(`Updating customer data for ${customerId} based on invoices`);
    // الحصول على جميع فواتير العميل
    const invoices = await invoicesService.getByCustomerId(customerId);
    // الحصول على بيانات العميل
    const customer = await customersService.getById(customerId);
    if (!customer) {
      console.error(`Customer with ID ${customerId} not found`);
      return;
    }
    
    // حساب النقاط المكتسبة من الفواتير
    let totalPointsEarned = 0;
    let totalCreditBalance = 0;
    let latestInvoiceDate = null;
    
    // Calculate unpaid amount from invoices
    invoices.forEach(invoice => {
      // Add points earned from invoice
      totalPointsEarned += invoice.pointsEarned;
      
      // Calculate credit balance for unpaid or partially paid invoices
      if (invoice.status === InvoiceStatus.UNPAID || 
          invoice.status === InvoiceStatus.PARTIALLY_PAID || 
          invoice.status === InvoiceStatus.OVERDUE) {
        
        // Calculate the paid amount for this invoice
        const paidAmount = invoice.payments?.reduce((sum, payment) => {
          // Add payments, subtract refunds
          return payment.type === PaymentType.PAYMENT ? sum + payment.amount : sum - payment.amount;
        }, 0) || 0;
        
        // Add the remaining balance to the total credit balance
        totalCreditBalance += (invoice.totalAmount - paidAmount);
      }
      
      // Update latest invoice date
      if (invoice.date) {
        const invoiceDate = new Date(invoice.date);
        if (!latestInvoiceDate || invoiceDate > latestInvoiceDate) {
          latestInvoiceDate = invoiceDate;
        }
      }
    });
    
    // Get all standalone payments (not linked to any invoice) for this customer
    let standalonePayments = [];
    try {
      standalonePayments = await paymentsService.getByCustomerId(customerId);
      // Filter payments not linked to any invoice
      standalonePayments = standalonePayments.filter((p: any) => !p.invoiceId);
      console.log(`Found ${standalonePayments.length} standalone payments for customer ${customerId}`);
    } catch (e) {
      console.error(`Error fetching standalone payments for customer ${customerId}:`, e);
      standalonePayments = [];
    }

    // Calculate total standalone payments
    const totalStandalonePayments = standalonePayments.reduce((sum: number, payment: any) => {
      // Consider payment type (payment/refund)
      if (payment.type === PaymentType.PAYMENT) {
        return sum + (payment.amount || 0);
      } else if (payment.type === PaymentType.REFUND) {
        return sum - (payment.amount || 0);
      }
      return sum;
    }, 0);
    
    console.log(`Total standalone payments for customer ${customerId}: ${totalStandalonePayments}`);
    
    // Calculate credit limit: average of last 3 months purchases
    let creditLimit = 0;
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const recentInvoices = invoices.filter(inv => new Date(inv.date) >= threeMonthsAgo);
    if (recentInvoices.length > 0) {
      const total = recentInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      creditLimit = total / 3;
    }
    
    // Get all redemptions for the customer
    let totalPointsRedeemed = 0;
    let latestRedemptionDate = null;
    if (typeof redemptionsService !== 'undefined' && redemptionsService.getByCustomerId) {
      const redemptions = await redemptionsService.getByCustomerId(customerId);
      redemptions.forEach(redemption => {
        if (redemption.status !== RedemptionStatus.CANCELLED) {
          totalPointsRedeemed += redemption.totalPointsRedeemed;
          
          // Update latest redemption date
          if (redemption.date) {
            const redemptionDate = new Date(redemption.date);
            if (!latestRedemptionDate || redemptionDate > latestRedemptionDate) {
              latestRedemptionDate = redemptionDate;
            }
          }
        }
      });
    }
    
    // Get manual points adjustments history
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
        
        // Update latest manual adjustment date
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
    }
    
    // Determine latest activity date
    let lastActive = null;
    const dates = [
      latestInvoiceDate, 
      latestRedemptionDate,
      latestManualAdjustmentDate
    ].filter(Boolean);
    
    if (dates.length > 0) {
      lastActive = new Date(Math.max(...dates.map(d => d instanceof Date ? d.getTime() : new Date(d).getTime())));
    }
    
    // Update customer data
    const { classification, level } = calculateClassificationAndLevel(customer, invoices);
    
    // Apply manual adjustments to total points
    const adjustedPointsEarned = totalPointsEarned + manualPointsAdjustments.added;
    const adjustedPointsRedeemed = totalPointsRedeemed + manualPointsAdjustments.deducted;
    
    // Final credit balance calculation:
    // Credit balance from invoices MINUS standalone payments
    // (Opening balance remains untouched as a separate value)
    const finalCreditBalance = totalCreditBalance - totalStandalonePayments;

    // Update customer with new values
    await customersService.update({
      ...customer,
      pointsEarned: adjustedPointsEarned,
      pointsRedeemed: adjustedPointsRedeemed,
      currentPoints: adjustedPointsEarned - adjustedPointsRedeemed,
      creditBalance: finalCreditBalance, // Only the credit balance without opening balance
      lastActive,
      credit_limit: creditLimit,
      classification,
      level,
    });
    
    // Update cache
    queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['points_history', customerId] });
    
    console.log(`Updated customer data for ${customerId}:`, {
      pointsEarned: adjustedPointsEarned,
      pointsRedeemed: adjustedPointsRedeemed,
      currentPoints: adjustedPointsEarned - adjustedPointsRedeemed,
      creditBalance: finalCreditBalance,
      openingBalance: customer.openingBalance || 0,
      lastActive: lastActive ? lastActive.toISOString() : customer.lastActive || null,
      credit_limit: creditLimit,
    });
  } catch (error) {
    console.error('Error updating customer data based on invoices:', error);
  }
};

// Mutation hooks for invoice operations
export function useInvoiceMutations() {
  const queryClient = useQueryClient();
  
  const addInvoice = useMutation({
    mutationFn: async ({ invoice, items }: { invoice: Omit<Invoice, 'id'>, items: Omit<InvoiceItem, 'id'>[] }) => {
      console.log("Adding invoice with customer ID:", invoice.customerId);
      return invoicesService.create(invoice, items);
    },
    onSuccess: async (data) => {
      console.log("Invoice created successfully with ID:", data.id, "for customer:", data.customerId);
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'paginated'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'aggregates'] });
      
      // تحديث بيانات العميل بعد إضافة فاتورة جديدة
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم إنشاء الفاتورة بنجاح',
        description: `تم إنشاء الفاتورة رقم ${data.id} بنجاح`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating invoice:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء إنشاء الفاتورة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updateInvoice = useMutation({
    mutationFn: (invoice: Invoice) => invoicesService.update(invoice),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'paginated'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'aggregates'] });
      
      // تحديث بيانات العميل بعد تحديث الفاتورة
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم تحديث الفاتورة بنجاح',
        description: `تم تحديث الفاتورة رقم ${data.id} بنجاح`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating invoice:', error);
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', data.customerId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'paginated'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'aggregates'] });
      
      // تحديث بيانات العميل بعد حذف الفاتورة
      await updateCustomerDataBasedOnInvoices(data.customerId, queryClient);
      
      toast({
        title: 'تم حذف الفاتورة بنجاح',
        description: `تم حذف الفاتورة رقم ${data.id} بنجاح`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف الفاتورة: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
}

// Main hook that combines all invoice hooks
export function useInvoices() {
  // Set up realtime updates for invoices, customers, redemptions, and payments
  useRealtime('invoices');
  useRealtime('customers');
  useRealtime('redemptions');
  useRealtime('payments');
  const getAll = useAllInvoices();
  const getById = useInvoice;
  const getByCustomerId = useCustomerInvoices;
  const { addInvoice, updateInvoice, deleteInvoice } = useInvoiceMutations();

  /** دعم pagination من الخادم مع الفرز والفلاتر الجغرافية */
  const getPaginated = (params: {
    pageIndex: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    governorateFilter?: string;
    cityFilter?: string;
  }) =>
    useQuery<{ items: Invoice[]; total: number }, Error>({
      queryKey: [
        'invoices',
        'paginated',
        params.pageIndex,
        params.pageSize,
        params.searchTerm,
        params.statusFilter,
        params.dateFrom,
        params.dateTo,
        params.sortBy,
        params.sortDir,
        params.governorateFilter,
        params.cityFilter,
      ],
      queryFn: () =>
        invoicesService.getPaginated(
          params.pageIndex,
          params.pageSize,
          params.searchTerm,
          params.statusFilter,
          params.dateFrom,
          params.dateTo,
          params.sortBy,
          params.sortDir,
          params.governorateFilter,
          params.cityFilter
        ),
    });

  /** جلب إحصائيات مجمعة للفواتير بناءً على نفس الفلاتر */
  const getAggregates = (params: {
    searchTerm?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
    governorateFilter?: string;
    cityFilter?: string;
  }) =>
    useQuery({
      queryKey: [
        'invoices',
        'aggregates',
        params.searchTerm,
        params.statusFilter,
        params.dateFrom,
        params.dateTo,
        params.governorateFilter,
        params.cityFilter,
      ],
      queryFn: () =>
        invoicesService.getAggregates(
          params.searchTerm,
          params.statusFilter,
          params.dateFrom,
          params.dateTo,
          params.governorateFilter,
          params.cityFilter
        ),
      staleTime: 1000 * 60 * 2, // 2 minutes cache
    });

  return {
    getAll,
    getById,
    getByCustomerId,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getPaginated,
    getAggregates,
  };
}
