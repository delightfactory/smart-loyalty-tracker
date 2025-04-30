
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerPurchasesTable from './CustomerPurchasesTable';
import CustomerPaymentHistory from './CustomerPaymentHistory';
import CustomerAnalytics from './CustomerAnalytics';
import CustomerRecommendations from './CustomerRecommendations';
import CustomerRedemptionsTable from './CustomerRedemptionsTable';
import CustomerPointsHistory from './CustomerPointsHistory';
import CustomerNotes from './CustomerNotes';
import { Customer, Invoice } from '@/lib/types';

interface CustomerDetailsTabsProps {
  customer: Customer;
  invoices: Invoice[];
}

const CustomerDetailsTabs = ({ customer, invoices }: CustomerDetailsTabsProps) => {
  return (
    <Tabs defaultValue="points" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="points">سجل النقاط</TabsTrigger>
        <TabsTrigger value="purchases">المشتريات</TabsTrigger>
        <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        <TabsTrigger value="redemptions">الاستبدال</TabsTrigger>
        <TabsTrigger value="analysis">التحليلات</TabsTrigger>
        <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
        <TabsTrigger value="notes">الملاحظات</TabsTrigger>
      </TabsList>
      
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
        <CustomerAnalytics customers={[customer]} />
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
