
import { useState } from 'react';
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
  Cell 
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
import { invoices } from '@/lib/data';
import { InvoiceStatus, PaymentMethod } from '@/lib/types';

const SalesAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Get monthly sales data for the last 6 months
  const currentDate = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    const month = date.toLocaleString('ar-EG', { month: 'long' });
    const year = date.getFullYear();
    
    const monthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate.getMonth() === date.getMonth() && 
             invoiceDate.getFullYear() === date.getFullYear();
    });
    
    const totalSales = monthInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const cashSales = monthInvoices
      .filter(invoice => invoice.paymentMethod === PaymentMethod.CASH)
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const creditSales = monthInvoices
      .filter(invoice => invoice.paymentMethod === PaymentMethod.CREDIT)
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    return {
      name: `${month} ${year}`,
      total: totalSales,
      cash: cashSales,
      credit: creditSales
    };
  }).reverse();
  
  // Invoice status distribution
  const statusData = Object.values(InvoiceStatus).map(status => {
    const statusInvoices = invoices.filter(invoice => invoice.status === status);
    const statusAmount = statusInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    return {
      name: status,
      value: statusAmount
    };
  });
  
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
                    <Area type="monotone" dataKey="total" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="cash" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="credit" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
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
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">الحالة:</div>
                                <div>{payload[0].payload.name}</div>
                                <div className="font-medium">القيمة:</div>
                                <div>{payload[0].value.toLocaleString('ar-EG')} ج.م</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalytics;
