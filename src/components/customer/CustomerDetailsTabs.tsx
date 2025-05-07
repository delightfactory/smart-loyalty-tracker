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
import { useState, useEffect } from 'react';

interface CustomerDetailsTabsProps {
  customer: Customer;
  invoices: Invoice[];
}

const CustomerDetailsTabs = ({ customer, invoices }: CustomerDetailsTabsProps) => {
  const isMobile = useIsMobile();
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

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
      <div className="overflow-x-auto pb-2">
        <TabsList className={`mb-4 ${isMobile ? 'w-max' : ''}`}>
          <TabsTrigger value="points">سجل النقاط</TabsTrigger>
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
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
