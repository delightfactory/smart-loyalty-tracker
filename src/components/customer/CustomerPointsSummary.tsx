
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Award, TrendingUp } from 'lucide-react';
import { Customer } from '@/lib/types';

interface CustomerPointsSummaryProps {
  customer: Customer;
}

const CustomerPointsSummary = ({ customer }: CustomerPointsSummaryProps) => {
  const pointsPercentage = customer.pointsEarned > 0 
    ? (customer.currentPoints / customer.pointsEarned) * 100 
    : 0;
  
  const tierLabels = ['عادي', 'فضي', 'ذهبي', 'بلاتيني', 'VIP'];
  const currentTier = customer.level > 0 && customer.level <= tierLabels.length 
    ? tierLabels[customer.level - 1] 
    : 'عادي';
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>نقاط الولاء</CardTitle>
        <CardDescription>رصيد النقاط والاستبدال</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">النقاط المكتسبة</span>
              <span className="font-medium">{customer.pointsEarned}</span>
            </div>
            <Progress value={100} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">النقاط المستبدلة</span>
              <span className="font-medium">{customer.pointsRedeemed}</span>
            </div>
            <Progress 
              value={(customer.pointsRedeemed / Math.max(customer.pointsEarned, 1)) * 100} 
              className="h-2 bg-green-100" 
              indicatorClassName="bg-green-500" 
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">نسبة الاستخدام</span>
              <span className="font-medium">
                {customer.pointsEarned > 0 
                  ? `${Math.round((customer.pointsRedeemed / customer.pointsEarned) * 100)}%`
                  : '0%'
                }
              </span>
            </div>
            <Progress 
              value={(customer.pointsRedeemed / Math.max(customer.pointsEarned, 1)) * 100} 
              className="h-2 bg-amber-100" 
              indicatorClassName="bg-amber-500" 
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 mt-2 border-t">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="font-medium">الرصيد الحالي</span>
            </div>
            <span className="text-2xl font-bold">{customer.currentPoints}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Award className="h-5 w-5 text-amber-500" />
              <span className="font-medium">المستوى</span>
            </div>
            <span className="text-lg font-medium">{currentTier}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="font-medium">التصنيف</span>
            </div>
            <span className="text-lg font-medium text-amber-500">
              {'★'.repeat(customer.classification) + '☆'.repeat(5 - customer.classification)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPointsSummary;
