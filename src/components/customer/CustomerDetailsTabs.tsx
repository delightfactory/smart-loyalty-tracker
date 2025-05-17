import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerPurchasesTable from './CustomerPurchasesTable';
import CustomerPaymentHistory from './CustomerPaymentHistory';
import CustomerDetailAnalytics from './CustomerDetailAnalytics';
import CustomerRecommendations from './CustomerRecommendations';
import CustomerRedemptionsTable from './CustomerRedemptionsTable';
import CustomerPointsHistory from './CustomerPointsHistory';
import CustomerNotes from './CustomerNotes';
import { Customer, Invoice } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReturns } from '@/hooks/useReturns';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Return } from '@/lib/types';
import { Eye } from 'lucide-react';

interface CustomerDetailsTabsProps {
  customer: Customer;
  invoices: Invoice[];
}

const CustomerDetailsTabs = ({ customer, invoices }: CustomerDetailsTabsProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { getByCustomerId: getCustomerReturns } = useReturns();
  const { data: returns = [], isLoading: isLoadingReturns } = getCustomerReturns(customer.id);
  const [activeTab, setActiveTab] = useState<string>('points');

  // استرجاع التبويب النشط من localStorage عند تحميل المكون
  useEffect(() => {
    const savedTab = localStorage.getItem(`customer_${customer.id}_activeTab`);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [customer.id]);

  // حفظ التبويب النشط في localStorage عند تغييره
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(`customer_${customer.id}_activeTab`, value);
  };

  const returnColumns: Column<Return>[] = useMemo(() => [
    { header: 'التاريخ', accessor: 'date', Cell: value => new Date(value as string).toLocaleDateString('en-US') },
    { header: 'رقم المرتجع', accessor: 'id' },
    { header: 'الفاتورة الأصلية', accessor: 'invoiceId' },
    { header: 'الإجمالي', accessor: 'totalAmount', Cell: value => (value as number).toLocaleString('en-US') },
    { header: 'الحالة', accessor: 'status' },
    { header: 'إجراءات', accessor: 'id', Cell: (_v, row) => (
      <button onClick={e => { e.stopPropagation(); navigate(`/returns/${row.id}`); }} aria-label="عرض">
        <Eye className="h-4 w-4 text-blue-700 dark:text-blue-200" />
      </button>
    ) },
  ], [navigate]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
      <div className="overflow-x-auto pb-2">
        <TabsList className={`mb-4 ${isMobile ? 'w-max' : ''}`}>
          <TabsTrigger value="points">سجل النقاط</TabsTrigger>
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="returns">المرتجعات</TabsTrigger>
          <TabsTrigger value="redemptions">الاستبدال</TabsTrigger>
          <TabsTrigger value="analysis">التحليلات</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          <TabsTrigger value="notes">الملاحظات</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="points">
        <CustomerPointsHistory customerId={customer.id} />
      </TabsContent>
      
      <TabsContent value="purchases">
        <CustomerPurchasesTable invoices={invoices} customerId={customer.id} />
      </TabsContent>
      
      <TabsContent value="payments">
        <CustomerPaymentHistory customerId={customer.id} />
      </TabsContent>
      
      <TabsContent value="returns">
        <DataTable data={returns} columns={returnColumns} loading={isLoadingReturns} />
      </TabsContent>

      <TabsContent value="redemptions">
        <CustomerRedemptionsTable customerId={customer.id} />
      </TabsContent>

      <TabsContent value="analysis">
        <CustomerDetailAnalytics invoices={invoices} />
      </TabsContent>

      <TabsContent value="recommendations">
        <CustomerRecommendations customer={customer} invoices={invoices} />
      </TabsContent>

      <TabsContent value="notes">
        <CustomerNotes customerId={customer.id} />
      </TabsContent>
    </Tabs>
  );
};

export default CustomerDetailsTabs;
