import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';
import { formatNumberEn, formatAmountEn, formatDateEn } from '@/lib/formatters';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Loader2 } from 'lucide-react';
import { Customer, Invoice, InvoiceStatus, PaymentMethod } from '@/lib/types';

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
  const [pageIndex, setPageIndex] = useState(0);
  const defaultPageSize = 10;
  const { getPaginated } = useCustomers();
  const { data: paginatedRes, isLoading: loadingCustomers } = getPaginated({ pageIndex, pageSize: defaultPageSize });
  const customersPage = paginatedRes?.items || [];
  const totalItems = paginatedRes?.total || 0;
  const { data: invoicesPage = [], isLoading: loadingInvoices } = useQuery<Invoice[], Error>({
    queryKey: ['invoicesByCustomerIds', pageIndex],
    queryFn: async () => {
      if (!customersPage.length) return [];
      const ids: readonly string[] = customersPage.map((c) => c.id);
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
  const customerRFM = getCustomerRFM(customersPage, invoicesPage);
  const loading = loadingCustomers || loadingInvoices;

  // تعريف أعمدة الجدول
  type Row = typeof customerRFM[number];
  const columns: Column<Row>[] = [
    { header: '#', accessor: 'id', Cell: (_v, _r, i) => formatNumberEn(i + 1) },
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'نوع النشاط', accessor: 'businessType' },
    { header: 'Recency (أيام)', accessor: 'recency', Cell: (v) => v != null ? formatNumberEn(v as number) + ' يوم' : 'غير متاح' },
    { header: 'Frequency', accessor: 'frequency', Cell: (v) => formatNumberEn(v as number) },
    { header: 'Monetary', accessor: 'monetary', Cell: (v) => formatAmountEn(v as number) },
    { header: 'آخر عملية شراء', accessor: 'lastPurchase', Cell: (v) => v ? formatDateEn(v as Date) : 'لم يشترِ من قبل' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل RFM للعملاء</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={customerRFM}
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

export default CustomerRFMTable;
