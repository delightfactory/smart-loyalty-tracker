import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService, customersService, redemptionsService } from '@/services/database';
import { Invoice, InvoiceItem, InvoiceStatus, Customer, PaymentMethod, PaymentType, RedemptionStatus } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';
import { calculateClassificationAndLevel } from '@/lib/customerClassification';

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
    invoices.forEach(invoice => {
      totalPointsEarned += invoice.pointsEarned;
      // حساب الرصيد الآجل للفواتير غير المدفوعة أو المدفوعة جزئياً
      if (invoice.status === InvoiceStatus.UNPAID || 
          invoice.status === InvoiceStatus.PARTIALLY_PAID || 
          invoice.status === InvoiceStatus.OVERDUE) {
        // حساب المبلغ المدفوع
        const paidAmount = invoice.payments?.reduce((sum, payment) => {
          return payment.type === PaymentType.PAYMENT ? sum + payment.amount : sum - payment.amount;
        }, 0) || 0;
        // إضافة المبلغ المتبقي إلى الرصيد الآجل
        totalCreditBalance += (invoice.totalAmount - paidAmount);
      }
      // تحديث أحدث تاريخ فاتورة
      if (invoice.date) {
        const invoiceDate = new Date(invoice.date);
        if (!latestInvoiceDate || invoiceDate > latestInvoiceDate) {
          latestInvoiceDate = invoiceDate;
        }
      }
    });
    // حساب قيمة الائتمان (Credit Limit): متوسط مسحوبات العميل آخر 3 شهور
    let creditLimit = 0;
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const recentInvoices = invoices.filter(inv => new Date(inv.date) >= threeMonthsAgo);
    if (recentInvoices.length > 0) {
      const total = recentInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      creditLimit = total / 3;
    }
    // الحصول على جميع عمليات الاستبدال للعميل
    let totalPointsRedeemed = 0;
    let latestRedemptionDate = null;
    if (typeof redemptionsService !== 'undefined' && redemptionsService.getByCustomerId) {
      const redemptions = await redemptionsService.getByCustomerId(customerId);
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
    }
    // تحديد أحدث تاريخ تفاعل
    let lastActive = null;
    if (latestInvoiceDate && latestRedemptionDate) {
      lastActive = latestInvoiceDate > latestRedemptionDate ? latestInvoiceDate : latestRedemptionDate;
    } else if (latestInvoiceDate) {
      lastActive = latestInvoiceDate;
    } else if (latestRedemptionDate) {
      lastActive = latestRedemptionDate;
    }
    // تحديث بيانات العميل
    const { classification, level } = calculateClassificationAndLevel(customer, invoices);
    const updatedCustomer = {
      ...customer,
      pointsEarned: totalPointsEarned,
      pointsRedeemed: totalPointsRedeemed,
      currentPoints: totalPointsEarned - totalPointsRedeemed,
      creditBalance: totalCreditBalance,
      lastActive: lastActive ? lastActive.toISOString() : customer.lastActive || null,
      credit_limit: creditLimit,
      classification,
      level,
    };
    // تحديث بيانات العميل في قاعدة البيانات
    await customersService.update(updatedCustomer);
    // تحديث الذاكرة المؤقتة
    queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    console.log(`Updated customer data for ${customerId}:`, {
      pointsEarned: totalPointsEarned,
      pointsRedeemed: totalPointsRedeemed,
      currentPoints: totalPointsEarned - totalPointsRedeemed,
      creditBalance: totalCreditBalance,
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
  
  return {
    getAll,
    getById,
    getByCustomerId,
    addInvoice,
    updateInvoice,
    deleteInvoice
  };
}
