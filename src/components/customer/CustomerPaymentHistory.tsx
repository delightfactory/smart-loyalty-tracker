import { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Coins, ArrowDown, ArrowUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentsFilterBar from './PaymentsFilterBar';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';

interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: Date | string;
  method: string;
  invoiceId?: string;
  notes?: string;
  type: 'payment' | 'refund';
}

const CustomerPaymentHistory = ({ customerId }: { customerId: string }) => {
  // جلب المدفوعات من hook
  const { getByCustomerId: getPayments } = usePayments();
  const { getByCustomerId: getInvoices } = useInvoices();
  const { data: paymentsData = [], isLoading: loadingPayments } = getPayments(customerId);
  const { data: invoicesData = [], isLoading: loadingInvoices } = getInvoices(customerId);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({from: '', to: ''});

  // استخراج الفواتير النقدية المدفوعة بالكامل أو جزئياً ولم يتم تسجيلها كدفعة منفصلة
  const invoicePayments = (invoicesData || [])
    .filter(inv =>
      (inv.status === 'مدفوع' || inv.status === 'مدفوع جزئياً') &&
      inv.paymentMethod === 'نقداً'
    )
    .map(inv => ({
      id: `INV-${inv.id}`,
      customerId: inv.customerId,
      amount: inv.totalAmount,
      date: inv.date,
      method: inv.paymentMethod,
      invoiceId: inv.id,
      notes: 'دفعة نقدية من الفاتورة',
      type: 'payment'
    }))
    // استثنِ الفواتير التي يوجد لها دفعة منفصلة بنفس invoiceId
    .filter(invPay => !(paymentsData || []).some(pay => pay.invoiceId === invPay.invoiceId));

  // دمج جميع المدفوعات مع الفواتير النقدية
  const allPayments = [...(paymentsData || []), ...invoicePayments];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'EGP' });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const filteredPayments = allPayments.filter((payment) => {
    const matchSearch = search === '' || payment.id.includes(search) || (payment.notes && payment.notes.includes(search));
    const paymentDate = new Date(payment.date);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    const matchDate = (!fromDate || paymentDate >= fromDate) && (!toDate || paymentDate <= toDate);
    return matchSearch && matchDate;
  });

  if (loadingPayments || loadingInvoices) {
    return (
      <Card><CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <CreditCard className="h-10 w-10 animate-spin mb-3" />
        <p>جاري تحميل سجل المدفوعات...</p>
      </CardContent></Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل المدفوعات</CardTitle>
        <CardDescription>جميع عمليات الدفع والاسترجاع، بما في ذلك المدفوعات النقدية من الفواتير</CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentsFilterBar
          onSearch={setSearch}
          onDateRangeChange={(from, to) => setDateRange({from, to})}
        />
        <div className="mb-2 flex gap-6 text-xs text-muted-foreground">
          <div>عدد العمليات: <span className="font-bold text-primary">{filteredPayments.length}</span></div>
          <div>إجمالي المدفوعات: <span className="font-bold text-primary">{filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span></div>
        </div>
        {filteredPayments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم العملية</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>
                    {payment.type === 'payment' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        دفعة
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        استرجاع
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={cn(
                    "font-medium",
                    payment.type === 'payment' ? "text-green-600" : "text-red-600"
                  )}>
                    {payment.type === 'payment' ? '+' : '-'} {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{payment.invoiceId}</TableCell>
                  <TableCell>{payment.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p>لا توجد عمليات مطابقة للبحث أو التصفية</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerPaymentHistory;
