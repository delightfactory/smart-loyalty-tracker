
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { RevenueChartProps } from './DashboardCardProps';
import { useEffect, useState } from 'react';

const RevenueChart = ({ 
  data, 
  formatCurrency, 
  type = 'area', 
  title = 'تقرير الإيرادات', 
  description = 'تحليل الإيرادات الشهرية' 
}: RevenueChartProps) => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#333' : '#eee'} 
              />
              <XAxis 
                dataKey="name" 
                stroke={theme === 'dark' ? '#888' : '#333'}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}ك`} 
                stroke={theme === 'dark' ? '#888' : '#333'}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'الإيرادات']} 
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="الإيرادات"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
