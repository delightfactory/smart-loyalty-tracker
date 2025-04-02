
import { Redemption, Product, RedemptionStatus } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  Star, 
  AlertTriangle, 
  XCircle,
  Link 
} from 'lucide-react';
import { getProductById } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RedemptionDetailsCardProps {
  redemption: Redemption;
  onCancel?: () => void;
  onPrint?: () => void;
  showActions?: boolean;
}

const RedemptionDetailsCard = ({ 
  redemption,
  onCancel,
  onPrint,
  showActions = true
}: RedemptionDetailsCardProps) => {
  const getStatusBadge = (status: RedemptionStatus) => {
    switch(status) {
      case RedemptionStatus.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            مكتمل
          </Badge>
        );
      case RedemptionStatus.PENDING:
        return (
          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            قيد الانتظار
          </Badge>
        );
      case RedemptionStatus.CANCELLED:
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            ملغي
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              تفاصيل عملية الاستبدال
            </CardTitle>
            {getStatusBadge(redemption.status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(redemption.date)}</span>
          </div>
          
          <div className="border rounded-lg p-3 bg-slate-50">
            <h4 className="font-medium text-sm text-slate-600 mb-2 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-1" />
              المنتجات المستبدلة
            </h4>
            <div className="space-y-3">
              {redemption.items.map((item, index) => {
                const product = getProductById(item.productId);
                return (
                  <div key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{product?.name || 'منتج غير معروف'}</p>
                      <p className="text-xs text-muted-foreground">{product?.brand || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">الكمية: {item.quantity}</p>
                      <p className="text-xs flex items-center justify-end">
                        <Star className="h-3 w-3 text-amber-500 mr-1" />
                        {item.totalPointsRequired} نقطة
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">إجمالي النقاط المستبدلة:</span>
            <span className="text-lg font-bold text-amber-600">{redemption.totalPointsRedeemed} نقطة</span>
          </div>
          
          {redemption.status === RedemptionStatus.PENDING && (
            <div className={cn(
              "p-3 rounded-lg text-sm flex items-center mt-2",
              "bg-amber-50 text-amber-800 border border-amber-200"
            )}>
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>هذه العملية قيد الانتظار. سيتم تجهيز المنتجات وإخطار العميل عند الانتهاء.</span>
            </div>
          )}
          
          {redemption.status === RedemptionStatus.CANCELLED && (
            <div className={cn(
              "p-3 rounded-lg text-sm flex items-center mt-2",
              "bg-red-50 text-red-800 border border-red-200"
            )}>
              <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>تم إلغاء عملية الاستبدال هذه.</span>
            </div>
          )}
        </CardContent>
        
        {showActions && (
          <CardFooter className="flex gap-2 justify-between border-t pt-4">
            <div className="flex gap-2">
              {redemption.status === RedemptionStatus.PENDING && onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel} className="text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  إلغاء الاستبدال
                </Button>
              )}
              
              {onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint}>
                  <Link className="h-4 w-4 mr-1" />
                  طباعة الإيصال
                </Button>
              )}
            </div>
            
            {redemption.status === RedemptionStatus.COMPLETED && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                تم الاستلام
              </Badge>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default RedemptionDetailsCard;
