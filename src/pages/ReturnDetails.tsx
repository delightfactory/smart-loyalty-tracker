import React from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import DataTable, { Column } from '@/components/ui/DataTable';
import { useReturns } from '@/hooks/useReturns';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoice } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import { ReturnItem } from '@/lib/types';

export default function ReturnDetails() {
  const { id } = useParams() as { id: string };
  const { getById } = useReturns();
  const { data: ret, isLoading } = getById(id);
  const { getAll: getProducts } = useProducts();
  const { data: products = [], isLoading: productsLoading } = getProducts;
  const { getById: fetchCustomer } = useCustomers();
  const { data: customer } = fetchCustomer(ret?.customerId || '');
  const { data: invoice } = useInvoice(ret?.invoiceId || '');

  if (isLoading || productsLoading) return <PageContainer title="جاري التحميل..."><p>جاري التحميل...</p></PageContainer>;
  if (!ret) return <PageContainer title="404">مرتجع غير موجود</PageContainer>;

  const itemsWithName = ret.items.map(item => ({
    ...item,
    productName: products.find(p => p.id === item.productId)?.name || item.productId,
  }));

  const columns: Column<any>[] = [
    { header: 'منتج', accessor: 'productName' },
    { header: 'الكمية', accessor: 'quantity' },
    { header: 'سعر الوحدة', accessor: 'unitPrice' },
    { header: 'الإجمالي', accessor: 'totalPrice' },
  ];

  return (
    <PageContainer title={`تفاصيل المرتجع ${id}`}>
      <div className="mb-4 space-y-1">
        <p><strong>معرف الفاتورة:</strong> {ret.invoiceId}</p>
        <p><strong>اسم العميل:</strong> {customer?.name ?? '-'}</p>
        <p><strong>تاريخ الفاتورة الأصلية:</strong> {invoice ? new Date(invoice.date).toISOString().slice(0,10) : '-'}</p>
        <p><strong>المبلغ الأصلي للفاتورة:</strong> {invoice?.totalAmount ?? '-'}</p>
        <p><strong>معرف العميل:</strong> {ret.customerId}</p>
        <p><strong>التاريخ:</strong> {new Date(ret.date).toISOString().slice(0,10)}</p>
        <p><strong>المبلغ الكلي للمرتجع:</strong> {ret.totalAmount}</p>
        <p><strong>الحالة:</strong> {ret.status}</p>
      </div>
      <DataTable data={itemsWithName} columns={columns} />
    </PageContainer>
  );
}
