import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Customer, InvoiceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatNumberEn } from '@/lib/formatters';
import { useMemo } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';

interface CustomersListProps {
  customers: Customer[];
}

function calculateCustomerNetTransactions(invoices: any[], payments: any[]): number {
  // احسب مجموع الفواتير غير المدفوعة (غير الحالة PAID)
  const dueInvoices = invoices.filter(inv => inv.status !== InvoiceStatus.PAID);
  const totalDue = dueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const invoiceIds = dueInvoices.map(inv => inv.id);
  const relatedPayments = payments.filter(p => p.invoiceId && invoiceIds.includes(p.invoiceId));
  const totalPayments = relatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return totalDue - totalPayments;
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
        <DataTable<Customer>
          data={customers}
          columns={[
            { header: 'اسم العميل', accessor: 'name' },
            { header: 'البريد الإلكتروني', accessor: 'email' },
            { header: 'نوع النشاط', accessor: 'businessType' },
            { header: 'المنطقة', accessor: 'region' },
            { header: 'مدة الائتمان (يوم)', accessor: 'credit_period', Cell: (v) => formatNumberEn(v as number) },
            { header: 'قيمة الائتمان (EGP)', accessor: 'credit_limit', Cell: (v) => formatNumberEn(v as number) },
            { header: 'رصيد العميل', accessor: 'id', Cell: (_v, row) => <CustomerBalanceCell customerId={row.id} /> },
            { header: 'النقاط', accessor: 'currentPoints', Cell: (v) => formatNumberEn(v as number) },
            { header: 'المستوى', accessor: 'level', Cell: (v) => formatNumberEn(v as number) },
          ]}
          defaultPageSize={10}
        />
      </CardContent>
    </Card>
  );
};

export default CustomersList;
