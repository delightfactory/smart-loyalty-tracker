import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatNumberEn, formatDateEn } from '@/lib/formatters';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>العملاء غير النشطين</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">اسم العميل</th>
                <th className="p-2">آخر عملية شراء</th>
                <th className="p-2">أيام الغياب</th>
              </tr>
            </thead>
            <tbody>
              {inactiveCustomers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">لا يوجد عملاء غير نشطين حالياً</td></tr>
              ) : (
                inactiveCustomers.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-red-50/50' : 'bg-white'}>
                    <td className="p-2 font-bold text-red-700">{formatNumberEn(idx + 1)}</td>
                    <td className="p-2 font-semibold">{c.name}</td>
                    <td className="p-2">{formatDateEn(c.lastPurchase)}</td>
                    <td className="p-2 text-red-700 font-bold">{formatNumberEn(c.daysInactive)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
