import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Invoice, InvoiceStatus, PaymentMethod } from '@/lib/types';
import { formatNumberEn, formatDateEn } from '@/lib/formatters';
import DataTable, { Column } from '@/components/ui/DataTable';

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
  const thresholdDays = props.thresholdDays || 90;
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

  const churnData = getChurnRiskCustomers(customersPage, invoicesPage, thresholdDays);
  const loading = props.loading || loadingCustomers || loadingInvoices;

  // تعريف أعمدة الجدول
  type ChurnRow = ReturnType<typeof getChurnRiskCustomers>[0];
  const columns: Column<ChurnRow>[] = [
    { header: '#', accessor: 'id', Cell: (_v, _r, i) => i + 1 },
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'نوع النشاط', accessor: 'businessType' },
    { header: 'آخر عملية شراء', accessor: 'lastPurchase' },
    { header: 'عدد الأيام منذ آخر شراء', accessor: 'daysSinceLast', Cell: (v) => v != null ? `${v} يوم` : 'غير متاح' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>العملاء المعرضون للفقد (لم يشتروا منذ أكثر من {thresholdDays} يوم)</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={churnData}
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

export default ChurnRiskTable;
