import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatNumberEn, formatDateEn } from '@/lib/formatters';
import DataTable, { Column } from '@/components/ui/DataTable';

interface InactiveCustomersTableProps {
  customers: any[];
  invoices: any[];
  inactiveDays?: number; // عدد الأيام التي يعتبر بعدها العميل غير نشط
  max?: number;
}

function getInactiveCustomers(customers: any[], invoices: any[], inactiveDays = 60, max = 10) {
  const now = new Date();
  return customers
    .map(c => {
      const customerInvoices = invoices.filter(inv => inv.customerId === c.id);
      let lastPurchaseDate: Date | null = null;
      if (customerInvoices.length > 0) {
        lastPurchaseDate = new Date(
          customerInvoices.reduce((latest, inv) => {
            const d = new Date(inv.date);
            return d > latest ? d : latest;
          }, new Date(customerInvoices[0].date))
        );
      }
      const daysInactive = lastPurchaseDate ? Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
      return {
        id: c.id,
        name: c.name,
        lastPurchase: lastPurchaseDate ? lastPurchaseDate.toLocaleDateString('ar-EG') : 'لم يشترِ من قبل',
        daysInactive: daysInactive ?? 'لم يشترِ من قبل',
      };
    })
    .filter(c => c.daysInactive === 'لم يشترِ من قبل' || (typeof c.daysInactive === 'number' && c.daysInactive > inactiveDays))
    .sort((a, b) => {
      // العملاء الأكثر غياباً أولاً
      if (a.daysInactive === 'لم يشترِ من قبل') return -1;
      if (b.daysInactive === 'لم يشترِ من قبل') return 1;
      return (b.daysInactive as number) - (a.daysInactive as number);
    })
    .slice(0, max);
}

export default function InactiveCustomersTable({ customers, invoices, inactiveDays = 60, max = 10 }: InactiveCustomersTableProps) {
  const inactiveCustomers = getInactiveCustomers(customers || [], invoices || [], inactiveDays, max);
  type Row = typeof inactiveCustomers[number];
  const columns: Column<Row>[] = [
    { header: '#', accessor: 'id', Cell: (_v, _r, i) => i + 1 },
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'آخر عملية شراء', accessor: 'lastPurchase' },
    { header: 'أيام الغياب', accessor: 'daysInactive' },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>العملاء غير النشطين</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable data={inactiveCustomers} columns={columns} defaultPageSize={max} />
      </CardContent>
    </Card>
  );
}
