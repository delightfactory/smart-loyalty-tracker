
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Customer } from '@/lib/types';
import { canRedeemPoints } from '@/lib/calculations';

interface CustomerRedemptionButtonProps {
  customer: Customer;
}

const CustomerRedemptionButton = ({ customer }: CustomerRedemptionButtonProps) => {
  const navigate = useNavigate();
  
  const handleRedemption = () => {
    navigate(`/create-redemption/${customer.id}`);
  };
  
  const canRedeem = canRedeemPoints(customer.id, 1);
  
  return (
    <Button
      variant="outline"
      className={canRedeem ? "text-amber-600" : "text-muted-foreground opacity-70"}
      onClick={handleRedemption}
      disabled={!canRedeem}
      title={!canRedeem ? "لا يمكن الاستبدال: إما أن الرصيد غير كافٍ أو يوجد فواتير غير مدفوعة" : "استبدال النقاط"}
    >
      <Star className="h-4 w-4 ml-2" />
      استبدال النقاط
    </Button>
  );
};

export default CustomerRedemptionButton;
