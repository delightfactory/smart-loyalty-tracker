
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Edit, ShoppingCart, Star, CreditCard } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { Customer, Invoice } from '@/lib/types';
import { getCustomerById, getInvoicesByCustomerId } from '@/lib/data';
import CustomerBasicInfo from '@/components/customer/CustomerBasicInfo';
import CustomerPointsSummary from '@/components/customer/CustomerPointsSummary';
import CustomerPurchasesTable from '@/components/customer/CustomerPurchasesTable';
import CustomerAnalytics from '@/components/customer/CustomerAnalytics';
import CustomerRedemptionButton from '@/components/customer/CustomerRedemptionButton';
import SmartSearch from '@/components/search/SmartSearch';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  useEffect(() => {
    if (id) {
      const foundCustomer = getCustomerById(id);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        
        // Get customer invoices
        const customerInvoices = getInvoicesByCustomerId(id);
        setInvoices(customerInvoices);
      }
    }
  }, [id]);
  
  if (!customer) {
    return (
      <PageContainer title="تحميل..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">جاري تحميل بيانات العميل...</p>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title={customer.name} subtitle={`بيانات وتحليلات العميل`}>
      <div className="mb-6 flex justify-between">
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          العودة للعملاء
        </Button>
        
        <div className="flex gap-2">
          <CustomerRedemptionButton customer={customer} />
          
          <Button variant="outline" onClick={() => navigate(`/create-payment/${customer.id}`)}>
            <CreditCard className="h-4 w-4 ml-2" />
            تسجيل دفعة
          </Button>
          
          <Button onClick={() => navigate(`/create-invoice/${customer.id}`)}>
            <ShoppingCart className="h-4 w-4 ml-2" />
            فاتورة جديدة
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CustomerBasicInfo customer={customer} />
        <CustomerPointsSummary customer={customer} />
      </div>
      
      <Tabs defaultValue="purchases" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="analysis">التحليلات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases">
          <CustomerPurchasesTable invoices={invoices} customerId={customer.id} />
        </TabsContent>
        
        <TabsContent value="analysis">
          <CustomerAnalytics customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default CustomerDetails;
