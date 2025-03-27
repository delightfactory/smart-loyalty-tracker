
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerPurchasesTable from './CustomerPurchasesTable';
import CustomerPaymentHistory from './CustomerPaymentHistory';
import CustomerAnalytics from './CustomerAnalytics';
import CustomerRecommendations from './CustomerRecommendations';
import { Customer, Invoice } from '@/lib/types';

interface CustomerDetailsTabsProps {
  customer: Customer;
  invoices: Invoice[];
}

const CustomerDetailsTabs = ({ customer, invoices }: CustomerDetailsTabsProps) => {
  return (
    <Tabs defaultValue="purchases" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="purchases">المشتريات</TabsTrigger>
        <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        <TabsTrigger value="analysis">التحليلات</TabsTrigger>
        <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
      </TabsList>
      
      <TabsContent value="purchases">
        <CustomerPurchasesTable invoices={invoices} customerId={customer.id} />
      </TabsContent>
      
      <TabsContent value="payments">
        <CustomerPaymentHistory customerId={customer.id} />
      </TabsContent>
      
      <TabsContent value="analysis">
        <CustomerAnalytics customerId={customer.id} />
      </TabsContent>

      <TabsContent value="recommendations">
        <CustomerRecommendations customer={customer} invoices={invoices} />
      </TabsContent>
    </Tabs>
  );
};

export default CustomerDetailsTabs;
