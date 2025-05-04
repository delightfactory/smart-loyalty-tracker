import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
} from '@/components/ui/table';
import { Customer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';

interface CustomersListProps {
  customers: Customer[];
}

const formatNumberEn = (num: number) => {
  return num.toLocaleString('en-US');
};

function calculateCustomerNetTransactions(invoices: any[], payments: any[]): number {
  const creditInvoices = invoices.filter(inv => inv.paymentMethod === 'آجل');
  const totalCreditInvoices = creditInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const creditInvoiceIds = creditInvoices.map(inv => inv.id);
  const relatedPayments = payments.filter(p => p.invoiceId && creditInvoiceIds.includes(p.invoiceId));
  const totalPayments = relatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return totalCreditInvoices - totalPayments;
}

const CustomerBalanceCell = ({ customerId }: { customerId: string }) => {
  const { getAll } = useCustomers();
  const { data: customersData = [] } = getAll;
  const openingBalance = customersData.find(c => c.id === customerId)?.openingBalance ?? 0;
  const { getByCustomerId: getInvoices } = useInvoices();
  const { getByCustomerId: getPayments } = usePayments();
  const invoicesQuery = getInvoices(customerId);
  const paymentsQuery = getPayments(customerId);

  const { total } = useMemo(() => {
    const invoices = invoicesQuery.data || [];
    const payments = paymentsQuery.data || [];
    const net = calculateCustomerNetTransactions(invoices, payments);
    return { total: openingBalance + net };
  }, [invoicesQuery.data, paymentsQuery.data, openingBalance]);

  if (invoicesQuery.isLoading || paymentsQuery.isLoading || customersData.length === 0) {
    return <span className="text-muted-foreground">...</span>;
  }
  if (invoicesQuery.isError || paymentsQuery.isError) {
    return <span className="text-destructive">خطأ</span>;
  }
  return (
    <span className="font-bold text-base text-right">
      <span className="text-gray-700">رصيد العميل:</span> {formatNumberEn(total)} ج.م
    </span>
  );
};

const CustomersList = ({ customers }: CustomersListProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>قائمة العملاء</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم العميل</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>نوع النشاط</TableHead>
              <TableHead>المنطقة</TableHead>
              <TableHead>مدة الائتمان (يوم)</TableHead>
              <TableHead>قيمة الائتمان (EGP)</TableHead>
              <TableHead>رصيد العميل</TableHead>
              <TableHead>...</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.businessType}</TableCell>
                <TableCell>{customer.region}</TableCell>
                <TableCell>{formatNumberEn(customer.credit_period ?? 0)}</TableCell>
                <TableCell>{formatNumberEn(customer.credit_limit ?? 0)}</TableCell>
                <TableCell><CustomerBalanceCell customerId={customer.id} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-white",
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-400" : 
                      index === 2 ? "bg-amber-700" : "bg-gray-200"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.currentPoints} نقطة</p>
                      <p className="text-sm text-muted-foreground">المستوى {customer.level}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CustomersList;
