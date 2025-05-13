import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/services/database';
import { updateCustomerDataBasedOnInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/auth-types';

const UpdateCustomersButton = () => {
  const { hasRole } = useAuth();
  // إخفاء الزر لغير الإدمن
  if (!hasRole(UserRole.ADMIN)) return null;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // جلب جميع العملاء
      const customers = await customersService.getAll();
      let updated = 0;
      for (const customer of customers) {
        await updateCustomerDataBasedOnInvoices(customer.id, queryClient);
        updated++;
      }
      toast({
        title: 'تم تحديث بيانات العملاء',
        description: `تم تحديث بيانات ${updated} عميل بنجاح!`,
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحديث بيانات العملاء',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-2"
      onClick={handleUpdate}
      disabled={loading}
      title="تحديث بيانات العملاء"
    >
      <RefreshCw className={`ml-1 ${loading ? 'animate-spin' : ''}`} size={18} />
      {loading ? '...جاري التحديث' : 'تحديث البيانات'}
    </Button>
  );
};

export default UpdateCustomersButton;
