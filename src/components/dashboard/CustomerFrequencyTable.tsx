import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService, invoicesService } from '@/services/database';
import { useEffect, useState } from 'react';
import { Customer, Invoice } from '@/lib/types';
import { formatNumberEn, formatDateEn } from '@/lib/formatters';

interface CustomerFrequencyTableProps {
  customers?: Customer[];
  invoices?: Invoice[];
  loading?: boolean;
}

function getCustomerFrequency(customers: Customer[], invoices: Invoice[]) {
  return customers.map((customer) => {
    const customerInvoices = invoices.filter((inv) => inv.customerId === customer.id);
    // Sort invoices by date descending
    const sortedInvoices = customerInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const invoiceDates = sortedInvoices.map((inv) => new Date(inv.date));
    // حساب متوسط عدد الأيام بين كل فاتورتين
    let avgDays = null;
    if (invoiceDates.length >= 2) {
      let totalDays = 0;
      for (let i = 1; i < invoiceDates.length; i++) {
        totalDays += (invoiceDates[i - 1].getTime() - invoiceDates[i].getTime()) / (1000 * 60 * 60 * 24);
      }
      avgDays = totalDays / (invoiceDates.length - 1);
    }
    return {
      id: customer.id,
      name: customer.name,
      businessType: customer.businessType,
      invoicesCount: customerInvoices.length,
      avgDaysBetweenPurchases: avgDays,
      lastPurchase: invoiceDates[0] ? invoiceDates[0] : null,
    };
  });
}

const CustomerFrequencyTable = (props: CustomerFrequencyTableProps) => {
  const [isMounted, setIsMounted] = useState(false);
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

  const customerFrequency = getCustomerFrequency(finalCustomers, finalInvoices);

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل تكرار الشراء للعملاء</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">اسم العميل</th>
                <th className="p-2">نوع النشاط</th>
                <th className="p-2">عدد الفواتير</th>
                <th className="p-2">آخر عملية شراء</th>
                <th className="p-2">متوسط الأيام بين المشتريات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center">جارٍ التحميل...</td></tr>
              ) : (
                customerFrequency.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-yellow-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'}>
                    <td className="p-2 font-bold text-yellow-700 dark:text-yellow-300">{formatNumberEn(idx + 1)}</td>
                    <td className="p-2 font-semibold dark:text-gray-100">{c.name}</td>
                    <td className="p-2 dark:text-gray-200">{c.businessType}</td>
                    <td className="p-2 text-blue-700 font-bold dark:text-blue-300">{formatNumberEn(c.invoicesCount)}</td>
                    <td className="p-2 dark:text-gray-200" dir="ltr">{c.lastPurchase ? formatDateEn(c.lastPurchase) : 'لم يشترِ من قبل'}</td>
                    <td className="p-2 text-gray-700 font-bold dark:text-gray-300">{c.avgDaysBetweenPurchases !== null ? formatNumberEn(Math.round(c.avgDaysBetweenPurchases)) + ' يوم' : 'غير متاح'}</td>
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

export default CustomerFrequencyTable;
