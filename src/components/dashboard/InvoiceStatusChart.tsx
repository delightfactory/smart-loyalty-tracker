
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
import { InvoiceStatus } from '@/lib/types';

interface InvoiceStatusChartProps {
  invoices: any[];
}

const InvoiceStatusChart = ({ invoices }: InvoiceStatusChartProps) => {
  // Calculate invoice status distribution
  const invoiceStatusData = [
    { name: 'مدفوع', value: invoices.filter(inv => inv.status === InvoiceStatus.PAID).length, color: '#10B981' },
    { name: 'غير مدفوع', value: invoices.filter(inv => inv.status === InvoiceStatus.UNPAID).length, color: '#FBBF24' },
    { name: 'مدفوع جزئياً', value: invoices.filter(inv => inv.status === InvoiceStatus.PARTIALLY_PAID).length, color: '#3B82F6' },
    { name: 'متأخر', value: invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>حالة الفواتير</CardTitle>
        <CardDescription>توزيع الفواتير حسب الحالة</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={invoiceStatusData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {invoiceStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'عدد الفواتير']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default InvoiceStatusChart;
