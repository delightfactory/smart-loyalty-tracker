
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
import { CreditCard, Coins, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  customerId: string;
  amount: number;
  date: Date;
  method: string;
  invoiceId?: string;
  notes?: string;
  type: 'payment' | 'refund';
}

// Mock payments data - in a real app, this would come from a database
const mockPayments: Payment[] = [
  {
    id: 'PAY001',
    customerId: 'C001',
    amount: 500,
    date: new Date(2023, 5, 16),
    method: 'نقدًا',
    invoiceId: 'INV001',
    notes: 'دفعة جزئية على الفاتورة',
    type: 'payment'
  },
  {
    id: 'PAY002',
    customerId: 'C001',
    amount: 300,
    date: new Date(2023, 5, 20),
    method: 'تحويل بنكي',
    invoiceId: 'INV001',
    notes: 'تسوية الفاتورة',
    type: 'payment'
  },
  {
    id: 'PAY003',
    customerId: 'C002',
    amount: 200,
    date: new Date(2023, 5, 21),
    method: 'نقدًا',
    invoiceId: 'INV002',
    notes: 'دفعة جزئية',
    type: 'payment'
  },
  {
    id: 'REF001',
    customerId: 'C001',
    amount: 50,
    date: new Date(2023, 5, 25),
    method: 'نقدًا',
    invoiceId: 'INV001',
    notes: 'استرجاع جزئي',
    type: 'refund'
  }
];

interface CustomerPaymentHistoryProps {
  customerId: string;
}

const CustomerPaymentHistory = ({ customerId }: CustomerPaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Filter payments for this customer
    const customerPayments = mockPayments.filter(payment => payment.customerId === customerId);
    setPayments(customerPayments);
  }, [customerId]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG');
  };

  const getTotalPayments = () => {
    const paymentsTotal = payments
      .filter(p => p.type === 'payment')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const refundsTotal = payments
      .filter(p => p.type === 'refund')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return paymentsTotal - refundsTotal;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          سجل المدفوعات
        </CardTitle>
        <CardDescription>جميع المدفوعات والاسترجاعات للعميل</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalPayments())}</p>
              </div>
            </div>
            <div className="flex space-x-4 space-x-reverse">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">عدد المدفوعات</p>
                <p className="text-xl font-bold">{payments.filter(p => p.type === 'payment').length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">عدد الاسترجاعات</p>
                <p className="text-xl font-bold">{payments.filter(p => p.type === 'refund').length}</p>
              </div>
            </div>
          </div>
        </div>

        {payments.length > 0 ? (
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
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
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
                  <TableCell>{payment.invoiceId || 'غير مرتبط'}</TableCell>
                  <TableCell>{payment.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <CreditCard className="h-12 w-12 mb-4 opacity-50" />
            <p>لا توجد مدفوعات لهذا العميل</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerPaymentHistory;
