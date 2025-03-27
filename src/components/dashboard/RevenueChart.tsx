
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
import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '@/services/database';
import { Payment } from '@/lib/types';
import { useTheme } from '@/components/ui/theme-provider';

const RevenueChart = () => {
  const { theme } = useTheme();
  
  // استخراج بيانات المدفوعات
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.getAll()
  });

  // تحويل البيانات لتناسب المخطط
  const getChartData = () => {
    if (!payments) return [];
    
    // تجميع المدفوعات حسب الشهر
    const paymentsByMonth = payments.reduce((acc: { [key: string]: any }, payment: Payment) => {
      // استخراج الشهر والسنة
      const date = new Date(payment.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          revenue: 0,
          expenses: 0
        };
      }
      
      // التصنيف حسب نوع الدفعة
      if (payment.type === 'payment') {
        acc[monthYear].revenue += payment.amount;
      } else {
        acc[monthYear].expenses += payment.amount;
      }
      
      return acc;
    }, {});
    
    // تحويل البيانات إلى مصفوفة
    return Object.values(paymentsByMonth).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
  };

  // ترتيب أسماء الأشهر بالعربية
  const formatMonthArabic = (monthYear: string) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const [month, year] = monthYear.split('/');
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  // تنسيق أرقام العملات
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', { 
      style: 'currency', 
      currency: 'EGP',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const chartData = getChartData();

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>تقرير الإيرادات</CardTitle>
        <CardDescription>تحليل الإيرادات والنفقات الشهرية</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري تحميل البيانات...</span>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#333' : '#eee'} 
              />
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonthArabic} 
                stroke={theme === 'dark' ? '#888' : '#333'}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}ك`} 
                stroke={theme === 'dark' ? '#888' : '#333'}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)} 
                labelFormatter={formatMonthArabic}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#333',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                }}
              />
              <Legend 
                formatter={(value) => value === 'revenue' ? 'الإيرادات' : 'النفقات'} 
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="revenue"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                fillOpacity={1} 
                fill="url(#colorExpenses)" 
                name="expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
