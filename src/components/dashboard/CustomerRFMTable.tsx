import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService, invoicesService } from '@/services/database';
import { useEffect, useState } from 'react';
import { Customer, Invoice } from '@/lib/types';
import { formatNumberEn, formatAmountEn, formatDateEn } from '@/lib/formatters';

interface CustomerRFMTableProps {
  customers?: Customer[];
  invoices?: Invoice[];
  loading?: boolean;
}

function getCustomerRFM(customers: Customer[], invoices: Invoice[]) {
  const now = new Date();
  return customers.map((customer) => {
    const customerInvoices = invoices.filter((inv) => inv.customerId === customer.id);
    const sortedInvoices = customerInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const invoiceDates = sortedInvoices.map((inv) => new Date(inv.date));
    const totalAmount = customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    let recency = null;
    if (invoiceDates.length > 0) {
      const diffDays = Math.round((now.getTime() - invoiceDates[0].getTime()) / (1000 * 60 * 60 * 24));
      recency = diffDays;
    }
    return {
      id: customer.id,
      name: customer.name,
      businessType: customer.businessType,
      frequency: customerInvoices.length,
      monetary: totalAmount,
      recency,
      lastPurchase: invoiceDates[0] ? invoiceDates[0] : null,
    };
  });
}

const CustomerRFMTable = (props: CustomerRFMTableProps) => {
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

  const customerRFM = getCustomerRFM(finalCustomers, finalInvoices);

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل RFM (تاريخ آخر شراء - التكرار - القيمة)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">اسم العميل</th>
                <th className="p-2">نوع النشاط</th>
                <th className="p-2">عدد مرات الشراء</th>
                <th className="p-2">إجمالي المشتريات</th>
                <th className="p-2">آخر عملية شراء</th>
                <th className="p-2">عدد الأيام منذ آخر شراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center">جارٍ التحميل...</td></tr>
              ) : (
                customerRFM.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-indigo-50/50' : 'bg-white'}>
                    <td className="p-2 font-bold text-indigo-700">{formatNumberEn(idx + 1)}</td>
                    <td className="p-2 font-semibold">{c.name}</td>
                    <td className="p-2">{c.businessType}</td>
                    <td className="p-2 text-blue-700 font-bold">{formatNumberEn(c.frequency)}</td>
                    <td className="p-2 text-green-700 font-bold">{formatAmountEn(c.monetary)}</td>
                    <td className="p-2" dir="ltr">{c.lastPurchase ? formatDateEn(c.lastPurchase) : 'لم يشترِ من قبل'}</td>
                    <td className="p-2 text-red-700 font-bold">{c.recency !== null ? formatNumberEn(c.recency) + ' يوم' : 'غير متاح'}</td>
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

export default CustomerRFMTable;
