
import { Star, User, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  // تأكد من أن جميع القيم رقمية
  const currentPoints = Number(customer.currentPoints) || 0;
  const pointsEarned = Number(customer.pointsEarned) || 0;
  const pointsRedeemed = Number(customer.pointsRedeemed) || 0;
  
  // تحقق من إمكانية الاستبدال
  const canRedeem = currentPoints >= totalRedemptionPoints && totalRedemptionPoints > 0;

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
              <span className="font-medium">{pointsEarned}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">النقاط المستبدلة:</span>
            <span className="font-medium">{pointsRedeemed}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">الرصيد الحالي:</span>
            <span className="font-bold text-lg">{currentPoints}</span>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium">النقاط المطلوبة:</span>
            <span className="text-xl font-bold text-amber-600">{totalRedemptionPoints}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">الرصيد المتبقي:</span>
            <span className={cn(
              "text-lg font-bold",
              currentPoints - totalRedemptionPoints >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {currentPoints - totalRedemptionPoints}
            </span>
          </div>
          
          <div className={cn(
            "p-3 rounded-lg text-sm flex items-center mt-4",
            canRedeem
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {canRedeem ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                <span>يمكن إتمام عملية الاستبدال</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                <span>
                  {currentPoints < totalRedemptionPoints 
                    ? "رصيد النقاط غير كافٍ"
                    : (totalRedemptionPoints <= 0 ? "يجب إضافة منتجات للاستبدال" : "لا يمكن إتمام عملية الاستبدال")
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
          disabled={disableConfirm || !canRedeem}
        >
          تأكيد الاستبدال
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RedemptionSummary;
