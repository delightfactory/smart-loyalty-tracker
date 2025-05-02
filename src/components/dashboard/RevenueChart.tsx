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
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { RevenueChartProps } from './DashboardCardProps';
import { useEffect, useState } from 'react';

const chartTypes = [
  { label: 'مخطط المساحة', value: 'area' },
  { label: 'مخطط الأعمدة', value: 'bar' }
];

const RevenueChart = ({ 
  data, 
  formatCurrency, 
  type = 'bar', 
  title = 'تقرير الإيرادات', 
  description = 'تحليل الإيرادات الشهرية',
  onTypeChange
}: RevenueChartProps & { onTypeChange?: (type: string) => void }) => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState(type);

  useEffect(() => {
    setIsMounted(true);
    if (data) {
      setChartData(data);
    }
    return () => {
      setIsMounted(false);
    };
  }, [data]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChartType(e.target.value);
    if (onTypeChange) onTypeChange(e.target.value);
  };

  if (!isMounted) {
    return (
      <Card className="col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <select
            className="border rounded px-2 py-1 text-sm bg-background"
            value={chartType}
            onChange={handleTypeChange}
            aria-label="تغيير نوع الرسم البياني"
          >
            {chartTypes.map(type => (
              <option value={type.value} key={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {!chartData || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={chartData}
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
                  tick={{ fontWeight: 700, fontSize: 13 }}
                  label={{ value: 'الاسم', position: 'insideBottom', offset: -5, fontWeight: 700, fontSize: 14 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}ك`} 
                  stroke={theme === 'dark' ? '#888' : '#333'}
                  tick={{ fontWeight: 700, fontSize: 13 }}
                  label={{ value: 'الإيرادات', angle: -90, position: 'insideLeft', fontWeight: 700, fontSize: 14 }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'الإيرادات']} 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                  }}
                  labelStyle={{ fontWeight: 700, fontSize: 13 }}
                  itemStyle={{ fontWeight: 700, fontSize: 13 }}
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
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#888' : '#333'} tick={{ fontWeight: 700, fontSize: 13 }} label={{ value: 'الاسم', position: 'insideBottom', offset: -5, fontWeight: 700, fontSize: 14 }} />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}ك`} stroke={theme === 'dark' ? '#888' : '#333'} tick={{ fontWeight: 700, fontSize: 13 }} label={{ value: 'الإيرادات', angle: -90, position: 'insideLeft', fontWeight: 700, fontSize: 14 }} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'الإيرادات']} 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
                  }}
                  labelStyle={{ fontWeight: 700, fontSize: 13 }}
                  itemStyle={{ fontWeight: 700, fontSize: 13 }}
                />
                <Bar dataKey="revenue" fill="#10B981" name="الإيرادات" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
