import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Invoice, InvoiceStatus, PaymentMethod } from '@/lib/types';
import { formatNumberEn, formatDateEn } from '@/lib/formatters';
import DataTable, { Column } from '@/components/ui/DataTable';

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
  const [pageIndex, setPageIndex] = useState(0);
  const defaultPageSize = 10;
  const { getPaginated } = useCustomers();
  const { data: pagRes, isLoading: loadingCustomers } = getPaginated({ pageIndex, pageSize: defaultPageSize });
  const customersPage = pagRes?.items || [];
  const totalItems = pagRes?.total || 0;
  const { data: invoicesPage = [], isLoading: loadingInvoices } = useQuery<Invoice[], Error>({
    queryKey: ['invoicesByCustomerIds', pageIndex],
    queryFn: async () => {
      if (!customersPage.length) return [];
      const ids: readonly string[] = customersPage.map(c => c.id);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .in('customer_id', ids);
      if (error || !data) return [];
      return data.map((row) => ({
        id: row.id,
        customerId: row.customer_id,
        date: new Date(row.date),
        dueDate: row.due_date ? new Date(row.due_date) : undefined,
        items: [],
        totalAmount: row.total_amount,
        pointsEarned: row.points_earned,
        pointsRedeemed: row.points_redeemed,
        status: row.status as InvoiceStatus,
        paymentMethod: row.payment_method as PaymentMethod,
        categoriesCount: row.categories_count,
        payments: [],
      }));
    },
    enabled: customersPage.length > 0,
  });
  const frequencyData = getCustomerFrequency(customersPage, invoicesPage);
  const loading = props.loading || loadingCustomers || loadingInvoices;

  // تعريف أعمدة الجدول
  type FreqRow = ReturnType<typeof getCustomerFrequency>[0];
  const columns: Column<FreqRow>[] = [
    { header: '#', accessor: 'id', Cell: (_v, _r, i) => i + 1 },
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'نوع النشاط', accessor: 'businessType' },
    { header: 'عدد الفواتير', accessor: 'invoicesCount', Cell: (v) => formatNumberEn(v) },
    { header: 'آخر عملية شراء', accessor: 'lastPurchase', Cell: (v) => v ? formatDateEn(v) : 'لم يشترِ من قبل' },
    { header: 'متوسط الأيام بين المشتريات', accessor: 'avgDaysBetweenPurchases', Cell: (v) => v != null ? `${formatNumberEn(Math.round(v))} يوم` : 'غير متاح' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل تكرار الشراء للعملاء</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={frequencyData}
          columns={columns}
          defaultPageSize={defaultPageSize}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          totalItems={totalItems}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default CustomerFrequencyTable;
