
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
import { invoicesService } from '@/services/database';
import { InvoiceStatus } from '@/lib/types';
import { InvoiceStatusChartProps } from './DashboardCardProps';
import { useEffect, useState } from 'react';

const InvoiceStatusChart = (props?: InvoiceStatusChartProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // استخراج بيانات الفواتير من قاعدة البيانات
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        return await invoicesService.getAll();
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    },
    enabled: isMounted && !props?.data,
    staleTime: 60000
  });

  // حساب توزيع حالة الفواتير
  const getInvoiceStatusData = () => {
    if (props?.data) return props.data;
    
    if (!invoices) return [];
    
    const invoiceStatusData = [
      { name: 'مدفوع', value: invoices.filter(inv => inv.status === InvoiceStatus.PAID).length, color: '#10B981' },
      { name: 'غير مدفوع', value: invoices.filter(inv => inv.status === InvoiceStatus.UNPAID).length, color: '#FBBF24' },
      { name: 'مدفوع جزئياً', value: invoices.filter(inv => inv.status === InvoiceStatus.PARTIALLY_PAID).length, color: '#3B82F6' },
      { name: 'متأخر', value: invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length, color: '#EF4444' }
    ].filter(item => item.value > 0);
    
    return invoiceStatusData;
  };

  const statusData = getInvoiceStatusData();

  if (!isMounted) {
    return null;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>حالة الفواتير</CardTitle>
        <CardDescription>توزيع الفواتير حسب الحالة</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري تحميل البيانات...</span>
          </div>
        ) : statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'عدد الفواتير']} />
              <Legend />
            </PieChart>
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

export default InvoiceStatusChart;
