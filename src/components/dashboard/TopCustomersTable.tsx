import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatAmountEn, formatNumberEn } from '@/lib/formatters';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>أفضل العملاء حسب المبيعات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">اسم العميل</th>
                <th className="p-2">عدد المشتريات</th>
                <th className="p-2">إجمالي المبالغ</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, idx) => (
                <tr
                  key={c.id}
                  className={
                    idx % 2 === 0
                      ? 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                  }
                >
                  <td className="p-2 font-bold text-blue-600 dark:text-blue-300">{formatNumberEn(idx + 1)}</td>
                  <td className="p-2 font-semibold text-gray-900 dark:text-gray-100">{c.name}</td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">{formatNumberEn(c.purchases)}</td>
                  <td className="p-2 text-green-700 font-bold dark:text-green-300">{formatAmountEn(c.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
