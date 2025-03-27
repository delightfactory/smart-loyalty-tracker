
import { Star, User, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { canRedeemPoints } from '@/lib/calculations';

interface RedemptionSummaryProps {
  customer: Customer | null;
  totalRedemptionPoints: number;
  onConfirm: () => void;
  disableConfirm: boolean;
}

const RedemptionSummary = ({ 
  customer, 
  totalRedemptionPoints,
  onConfirm,
  disableConfirm
}: RedemptionSummaryProps) => {
  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-amber-500" />
            ملخص الاستبدال
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground py-4">
            <p>يرجى اختيار عميل أولاً</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2 text-amber-500" />
          ملخص الاستبدال
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">العميل</p>
              <p className="font-medium">{customer.name}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">النقاط المكتسبة:</span>
              <span className="font-medium">{customer.pointsEarned}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">النقاط المستبدلة:</span>
            <span className="font-medium">{customer.pointsRedeemed}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">الرصيد الحالي:</span>
            <span className="font-bold text-lg">{customer.currentPoints}</span>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium">النقاط المطلوبة:</span>
            <span className="text-xl font-bold text-amber-600">{totalRedemptionPoints}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">الرصيد المتبقي:</span>
            <span className={cn(
              "text-lg font-bold",
              customer.currentPoints - totalRedemptionPoints >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {customer.currentPoints - totalRedemptionPoints}
            </span>
          </div>
          
          <div className={cn(
            "p-3 rounded-lg text-sm flex items-center mt-4",
            canRedeemPoints(customer.id, totalRedemptionPoints) 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {canRedeemPoints(customer.id, totalRedemptionPoints) ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                <span>يمكن إتمام عملية الاستبدال</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                <span>
                  {customer.currentPoints < totalRedemptionPoints 
                    ? "رصيد النقاط غير كافٍ"
                    : "يوجد فواتير غير مدفوعة"
                  }
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={onConfirm}
          disabled={disableConfirm}
        >
          تأكيد الاستبدال
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RedemptionSummary;
