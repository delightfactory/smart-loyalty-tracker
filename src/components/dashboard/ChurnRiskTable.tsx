import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService, invoicesService } from '@/services/database';
import { useEffect, useState } from 'react';
import { Customer, Invoice } from '@/lib/types';
import { formatNumberEn, formatDateEn } from '@/lib/formatters';

interface ChurnRiskTableProps {
  customers?: Customer[];
  invoices?: Invoice[];
  loading?: boolean;
  thresholdDays?: number; // عدد الأيام التي بعدها يُعتبر العميل معرض للفقد
}

function getChurnRiskCustomers(customers: Customer[], invoices: Invoice[], thresholdDays: number) {
  const now = new Date();
  return customers
    .map((customer) => {
      const customerInvoices = invoices.filter((inv) => inv.customerId === customer.id);
      const sortedInvoices = customerInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastPurchaseDate = sortedInvoices[0] ? new Date(sortedInvoices[0].date) : null;
      let daysSinceLast = null;
      if (lastPurchaseDate) {
        daysSinceLast = Math.round((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      return {
        id: customer.id,
        name: customer.name,
        businessType: customer.businessType,
        lastPurchase: lastPurchaseDate ? lastPurchaseDate.toLocaleDateString('ar-EG') : 'لم يشترِ من قبل',
        daysSinceLast,
      };
    })
    .filter((c) => c.daysSinceLast !== null && c.daysSinceLast > thresholdDays)
    .sort((a, b) => (b.daysSinceLast || 0) - (a.daysSinceLast || 0));
}

const ChurnRiskTable = (props: ChurnRiskTableProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const thresholdDays = props.thresholdDays || 90;
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => await customersService.getAll(),
    enabled: isMounted && !props.customers,
  });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => await invoicesService.getAll(),
    enabled: isMounted && !props.invoices,
  });
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const finalCustomers = props.customers || customers;
  const finalInvoices = props.invoices || invoices;
  const loading = props.loading || loadingCustomers || loadingInvoices;

  const churnRiskCustomers = getChurnRiskCustomers(finalCustomers, finalInvoices, thresholdDays);

  return (
    <Card>
      <CardHeader>
        <CardTitle>العملاء المعرضون للفقد (لم يشتروا منذ أكثر من {thresholdDays} يوم)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">اسم العميل</th>
                <th className="p-2">نوع النشاط</th>
                <th className="p-2">آخر عملية شراء</th>
                <th className="p-2">عدد الأيام منذ آخر شراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center">جارٍ التحميل...</td></tr>
              ) : (
                churnRiskCustomers.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-orange-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'}>
                    <td className="p-2 font-bold text-orange-600 dark:text-orange-300">{formatNumberEn(idx + 1)}</td>
                    <td className="p-2 font-semibold dark:text-gray-100">{c.name}</td>
                    <td className="p-2 dark:text-gray-200">{c.businessType}</td>
                    <td className="p-2 dark:text-gray-200">{formatDateEn(c.lastPurchase)}</td>
                    <td className="p-2 text-orange-700 font-bold dark:text-orange-400">{c.daysSinceLast !== null ? formatNumberEn(c.daysSinceLast) + ' يوم' : 'غير متاح'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChurnRiskTable;
