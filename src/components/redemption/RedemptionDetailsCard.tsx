
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Redemption, RedemptionStatus } from '@/lib/types';
import { Calendar, Printer, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface RedemptionDetailsCardProps {
  redemption: Redemption;
  onCancel?: () => void;
  onPrint?: () => void;
}

const RedemptionDetailsCard = ({ redemption, onCancel, onPrint }: RedemptionDetailsCardProps) => {
  // Fetch products to get their details
  const { getAll } = useProducts();
  const { data: products = [] } = getAll;
  
  // Format date to local date string
  const formattedDate = new Date(redemption.date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get status display elements
  const getStatusDisplay = () => {
    switch(redemption.status) {
      case RedemptionStatus.COMPLETED:
        return {
          text: 'مكتمل',
          bgColor: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 mr-2" />
        };
      case RedemptionStatus.PENDING:
        return {
          text: 'قيد الانتظار',
          bgColor: 'bg-amber-100 text-amber-800',
          icon: <Clock className="h-4 w-4 mr-2" />
        };
      case RedemptionStatus.CANCELLED:
        return {
          text: 'ملغي',
          bgColor: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="h-4 w-4 mr-2" />
        };
      default:
        return {
          text: 'غير معروف',
          bgColor: 'bg-gray-100 text-gray-800',
          icon: <Clock className="h-4 w-4 mr-2" />
        };
    }
  };
  
  const statusDisplay = getStatusDisplay();
  
  // Ensure total points is displayed as a number
  const totalPointsRedeemed = Number(redemption.totalPointsRedeemed) || 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50">
        <div className="flex justify-between items-center">
          <CardTitle>تفاصيل الاستبدال</CardTitle>
          <Badge className={statusDisplay.bgColor}>
            <div className="flex items-center">
              {statusDisplay.icon}
              {statusDisplay.text}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الاستبدال</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">العناصر المستبدلة</h3>
            {redemption.items.length > 0 ? (
              <div className="space-y-2 mt-3">
                {redemption.items.map((item, index) => {
                  // Find product details
                  const product = products.find(p => p.id === item.productId);
                  const productName = product ? product.name : 'منتج غير معروف';
                  const pointsRequired = Number(item.pointsRequired) || 0;
                  const totalPointsRequired = Number(item.totalPointsRequired) || 0;
                  const quantity = Number(item.quantity) || 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="border rounded-md p-3 bg-slate-50"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{productName}</span>
                        <span>{pointsRequired} × {quantity} = {totalPointsRequired} نقطة</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد عناصر</p>
            )}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>إجمالي النقاط المستبدلة:</span>
              <span className="text-amber-600">{totalPointsRedeemed} نقطة</span>
            </div>
          </div>
          
          {redemption.status === RedemptionStatus.CANCELLED && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">تم إلغاء عملية الاستبدال</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 flex gap-3 justify-end">
        {onPrint && (
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            طباعة الإيصال
          </Button>
        )}
        {onCancel && redemption.status === RedemptionStatus.PENDING && (
          <Button variant="destructive" size="sm" onClick={onCancel}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            إلغاء الاستبدال
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RedemptionDetailsCard;
