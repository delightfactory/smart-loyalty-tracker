import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatAmountEn, formatNumberEn } from '@/lib/formatters';
import DataTable, { Column } from '@/components/ui/DataTable';

interface TopCustomersTableProps {
  customers: any[];
  invoices: any[];
  max?: number;
}

function getTopCustomers(customers: any[], invoices: any[], max = 5) {
  // حساب إجمالي المشتريات لكل عميل
  const customerStats: {
    id: string;
    name: string;
    purchases: number;
    totalAmount: number;
  }[] = customers.map(c => {
    const customerInvoices = invoices.filter(inv => inv.customerId === c.id);
    return {
      id: c.id,
      name: c.name,
      purchases: customerInvoices.length,
      totalAmount: customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0)
    };
  });
  // ترتيب العملاء حسب إجمالي المبلغ ثم عدد المشتريات
  return customerStats
    .sort((a, b) => b.totalAmount - a.totalAmount || b.purchases - a.purchases)
    .slice(0, max);
}

export default function TopCustomersTable({ customers, invoices, max = 5 }: TopCustomersTableProps) {
  const topCustomers = getTopCustomers(customers || [], invoices || [], max);
  type Row = typeof topCustomers[number];
  const columns: Column<Row>[] = [
    { header: '#', accessor: 'id', Cell: (_v, _r, i) => i + 1 },
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'عدد المشتريات', accessor: 'purchases', Cell: (v) => formatNumberEn(v) },
    { header: 'إجمالي المبالغ', accessor: 'totalAmount', Cell: (v) => formatAmountEn(v) },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>أفضل العملاء حسب المبيعات</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable data={topCustomers} columns={columns} defaultPageSize={max} />
      </CardContent>
    </Card>
  );
}
