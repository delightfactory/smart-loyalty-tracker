import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnsService, customersService, updateCustomerCreditBalance } from '@/services/database';
import { Return, ReturnItem, ReturnStatus } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';

export function useReturns() {
  const queryClient = useQueryClient();

  // الاشتراك في التحديثات اللحظية
  useRealtime('returns');
  useRealtime('customers');

  // جلب كل المرتجعات
  const getAll = useQuery({
    queryKey: ['returns'],
    queryFn: () => returnsService.getAll(),
  });

  // جلب المرتجعات لعميل محدد
  const getByCustomerId = (customerId: string) =>
    useQuery({
      queryKey: ['returns', 'customer', customerId],
      queryFn: () => returnsService.getByCustomerId(customerId),
      enabled: !!customerId,
    });

  // جلب مرتجع محدد
  const getById = (id: string) =>
    useQuery({
      queryKey: ['returns', id],
      queryFn: () => returnsService.getById(id),
      enabled: !!id,
    });

  // جلب جميع المرتجعات لفاتورة محددة
  const getByInvoiceId = (invoiceId: string) =>
    useQuery({
      queryKey: ['returns', 'invoice', invoiceId],
      queryFn: () => returnsService.getByInvoiceId(invoiceId),
      enabled: !!invoiceId,
    });

  // إضافة مرتجع جديد
  const addReturn = useMutation({
    mutationFn: ({ ret, items }: { ret: Omit<Return, 'id'>; items: Omit<ReturnItem, 'id'>[] }) =>
      returnsService.create(ret, items),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', 'customer', data.customerId] });
      // تحديث رصيد العميل بعد إنشاء المرتجع (فقط إذا تمت الموافقة)
      if (data.status === ReturnStatus.APPROVED) {
        await updateCustomerCreditBalance(data.customerId);
      }
      toast({
        title: 'تم إنشاء المرتجع بنجاح',
        description: `تم إنشاء المرتجع بالمعرف ${data.id}`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء إنشاء المرتجع: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // تحديث مرتجع
  const updateReturn = useMutation({
    mutationFn: (ret: Return) => returnsService.update(ret),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', 'customer', data.customerId] });
      // تحديث رصيد العميل بعد تعديل المرتجع (فقط إذا تمت الموافقة)
      if (data.status === ReturnStatus.APPROVED) {
        await updateCustomerCreditBalance(data.customerId);
      }
      toast({
        title: 'تم تحديث المرتجع بنجاح',
        description: `تم تحديث المرتجع ${data.id}`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث المرتجع: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // حذف مرتجع مع دعم reverse effect بعد الاعتماد
  const deleteReturn = useMutation({
    mutationFn: ({ id, invoiceId, customerId, status }: { id: string; invoiceId: string; customerId: string; status: ReturnStatus }) =>
      returnsService.delete(id),
    onSuccess: async (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['returns', 'customer', vars.customerId] });
      // تحديث قائمة المرتجعات للفاتورة لعكس كمية المنتج
      queryClient.invalidateQueries({ queryKey: ['returns', 'invoice', vars.invoiceId] });
      // تحديث رصيد العميل بعد حذف المرتجع المعتمد
      if (vars.status === ReturnStatus.APPROVED) {
        await updateCustomerCreditBalance(vars.customerId);
      }
      toast({
        title: 'تم حذف المرتجع بنجاح',
        description: `تم حذف المرتجع ${vars.id}`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في الحذف',
        description: `حدث خطأ أثناء حذف المرتجع: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return { getAll, getByCustomerId, getByInvoiceId, getById, addReturn, updateReturn, deleteReturn };
}
