
import { useState, useMemo } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { InvoiceStatus, PaymentMethod } from '@/lib/types';

interface SalesAnalyticsProps {
  invoices: any[];
  isLoading: boolean;
}

const SalesAnalytics = ({ invoices, isLoading }: SalesAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Filter invoices based on time range
  const filteredInvoices = useMemo(() => {
    if (isLoading || !invoices.length) return [];
    
    const now = new Date();
    
    if (timeRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return invoices.filter(inv => new Date(inv.date) >= monthAgo);
    }
    
    if (timeRange === 'quarter') {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      return invoices.filter(inv => new Date(inv.date) >= quarterAgo);
    }
    
    if (timeRange === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return invoices.filter(inv => new Date(inv.date) >= yearAgo);
    }
    
    return invoices;
  }, [invoices, timeRange, isLoading]);
  
  // Get monthly sales data 
  const monthlyData = useMemo(() => {
    if (isLoading || !filteredInvoices.length) return [];
    
    const monthsMap: Record<string, { total: number, cash: number, credit: number }> = {};
    
    // Create last 6 months entries
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleString('ar-EG', { month: 'long' });
      const year = date.getFullYear();
      monthsMap[monthKey] = { total: 0, cash: 0, credit: 0 };
    }
    
    // Fill with actual data
    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Only process if it's within our 6 month range
      if (monthsMap[monthKey]) {
        monthsMap[monthKey].total += invoice.totalAmount;
        
        if (invoice.paymentMethod === PaymentMethod.CASH) {
          monthsMap[monthKey].cash += invoice.totalAmount;
        } else if (invoice.paymentMethod === PaymentMethod.CREDIT) {
          monthsMap[monthKey].credit += invoice.totalAmount;
        }
      }
    });
    
    // Convert to array for the chart
    return Object.entries(monthsMap).map(([key, data]) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const name = date.toLocaleString('ar-EG', { month: 'short' }) + ' ' + year;
      
      return {
        name,
        total: data.total,
        cash: data.cash,
        credit: data.credit
      };
    });
  }, [filteredInvoices, isLoading]);
  
  // Invoice status distribution
  const statusData = useMemo(() => {
    if (isLoading || !filteredInvoices.length) return [];
    
    const statusMap: Record<string, number> = {};
    
    Object.values(InvoiceStatus).forEach(status => {
      statusMap[status] = 0;
    });
    
    filteredInvoices.forEach(invoice => {
      if (statusMap[invoice.status] !== undefined) {
        statusMap[invoice.status] += invoice.totalAmount;
      }
    });
    
    return Object.entries(statusMap)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: status,
        value
      }));
  }, [filteredInvoices, isLoading]);
  
  // Define colors for invoice status
  const getStatusColor = (status: string) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return "#10B981";
      case InvoiceStatus.UNPAID:
        return "#F59E0B";
      case InvoiceStatus.PARTIALLY_PAID:
        return "#3B82F6";
      case InvoiceStatus.OVERDUE:
        return "#EF4444";
      default:
        return "#8B5CF6";
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="الفترة الزمنية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفترات</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
            <SelectItem value="quarter">آخر ربع سنة</SelectItem>
            <SelectItem value="year">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تحليل المبيعات الشهرية</CardTitle>
            <CardDescription>تطور المبيعات على مدار الأشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {monthlyData.length > 0 ? (
                <ChartContainer
                  config={{
                    total: {
                      label: "إجمالي المبيعات",
                      color: "#8B5CF6"
                    },
                    cash: {
                      label: "مبيعات نقدية",
                      color: "#10B981"
                    },
                    credit: {
                      label: "مبيعات آجلة",
                      color: "#F59E0B"
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="total" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="cash" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="credit" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالات الفواتير</CardTitle>
            <CardDescription>نسبة كل حالة من حالات الفواتير</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {statusData.length > 0 ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toLocaleString('ar-EG')} ج.م`, 'إجمالي القيمة']} />
                      <Legend />
                      <Bar dataKey="value" name="قيمة الفواتير">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalytics;
