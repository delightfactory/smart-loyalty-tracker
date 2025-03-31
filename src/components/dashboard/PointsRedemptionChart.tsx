
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
import { PointsRedemptionChartProps } from './DashboardCardProps';
import { useEffect, useState } from 'react';

const PointsRedemptionChart = (props: PointsRedemptionChartProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // استخراج بيانات العملاء من قاعدة البيانات
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        return await customersService.getAll();
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    },
    enabled: isMounted && !props?.data
  });

  useEffect(() => {
    setIsMounted(true);
    
    // إعداد بيانات الرسم البياني عند تحميل البيانات
    if (props.data) {
      setChartData(props.data);
    } else if (customers && customers.length > 0) {
      const totalEarned = customers.reduce((sum, customer) => sum + customer.pointsEarned, 0);
      const totalRedeemed = customers.reduce((sum, customer) => sum + customer.pointsRedeemed, 0);
      
      const data = [
        { name: 'النقاط المكتسبة', value: totalEarned - totalRedeemed, color: '#3B82F6' },
        { name: 'النقاط المستبدلة', value: totalRedeemed, color: '#22C55E' }
      ].filter(item => item.value > 0);
      
      setChartData(data);
    }

    return () => {
      setIsMounted(false);
    };
  }, [props.data, customers]);

  if (!isMounted) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>معدل استبدال النقاط</CardTitle>
          <CardDescription>النقاط المكتسبة مقابل المستبدلة</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

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
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
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
