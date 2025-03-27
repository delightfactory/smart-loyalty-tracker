
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customersService } from '@/services/database';

const PointsRedemptionChart = () => {
  // استخراج بيانات العملاء من قاعدة البيانات
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll()
  });

  // حساب بيانات النقاط
  const getPointsData = () => {
    if (!customers) return [];
    
    const totalEarned = customers.reduce((sum, customer) => sum + customer.pointsEarned, 0);
    const totalRedeemed = customers.reduce((sum, customer) => sum + customer.pointsRedeemed, 0);
    
    return [
      { name: 'النقاط المكتسبة', value: totalEarned - totalRedeemed, color: '#3B82F6' },
      { name: 'النقاط المستبدلة', value: totalRedeemed, color: '#22C55E' }
    ].filter(item => item.value > 0);
  };

  const pointsData = getPointsData();

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>معدل استبدال النقاط</CardTitle>
        <CardDescription>النقاط المكتسبة مقابل المستبدلة</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري تحميل البيانات...</span>
          </div>
        ) : pointsData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pointsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pointsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'النقاط']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">لا توجد بيانات نقاط متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsRedemptionChart;
