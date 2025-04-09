
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Customer } from '@/lib/types';
import { canRedeemPoints } from '@/lib/calculations';
import { useInvoices } from '@/hooks/useInvoices';
import { useState, useEffect } from 'react';

interface CustomerRedemptionButtonProps {
  customer: Customer;
}

const CustomerRedemptionButton = ({ customer }: CustomerRedemptionButtonProps) => {
  const navigate = useNavigate();
  const { getByCustomerId } = useInvoices();
  const { data: customerInvoices = [], isLoading } = getByCustomerId(customer.id);
  const [hasUnpaidInvoices, setHasUnpaidInvoices] = useState(false);
  
  useEffect(() => {
    if (customerInvoices && customerInvoices.length > 0) {
      const unpaid = customerInvoices.some(invoice => 
        invoice.status === 'غير مدفوع' || 
        invoice.status === 'مدفوع جزئياً' || 
        invoice.status === 'متأخر'
      );
      console.log(`Customer ${customer.id} has unpaid invoices:`, unpaid);
      setHasUnpaidInvoices(unpaid);
    }
  }, [customerInvoices, customer.id]);
  
  const handleRedemption = () => {
    navigate(`/create-redemption/${customer.id}`);
  };
  
  // تحقق من أن العميل لديه نقاط كافية (على الأقل نقطة واحدة) للاستبدال
  // وأنه لا توجد فواتير غير مدفوعة
  const customerPoints = Number(customer.currentPoints) || 0;
  const canRedeem = customerPoints > 0 && !hasUnpaidInvoices;
  
  return (
    <Button
      variant="outline"
      className={canRedeem ? "text-amber-600" : "text-muted-foreground opacity-70"}
      onClick={handleRedemption}
      disabled={!canRedeem || isLoading}
      title={!canRedeem ? (
        hasUnpaidInvoices 
          ? "لا يمكن الاستبدال: العميل لديه فواتير غير مدفوعة" 
          : "لا يمكن الاستبدال: العميل لا يملك نقاط كافية للاستبدال"
      ) : "استبدال النقاط"}
    >
      <Star className="h-4 w-4 ml-2" />
      استبدال النقاط
    </Button>
  );
};

export default CustomerRedemptionButton;
