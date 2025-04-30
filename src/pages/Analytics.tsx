
import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductAnalytics from '@/components/analytics/ProductAnalytics';
import CustomerAnalytics from '@/components/analytics/CustomerAnalytics';
import SalesAnalytics from '@/components/analytics/SalesAnalytics';
import PointsAnalytics from '@/components/analytics/PointsAnalytics';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('products');
  
  // Fetch real data from database
  const { getAll: getAllCustomers } = useCustomers();
  const { data: customers = [], isLoading: customersLoading } = getAllCustomers;
  
  const { getAll: getAllInvoices } = useInvoices();
  const { data: invoices = [], isLoading: invoicesLoading } = getAllInvoices;
  
  const { getAll: getAllProducts } = useProducts();
  const { data: products = [], isLoading: productsLoading } = getAllProducts;

  // Pass loading state to show appropriate UI during data fetching
  const isLoading = customersLoading || invoicesLoading || productsLoading;

  return (
    <PageContainer 
      title="التحليلات والإحصائيات" 
      subtitle="تحليلات متقدمة للمبيعات والمنتجات والعملاء"
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">لوحة التحليلات</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="products">تحليل المنتجات</TabsTrigger>
              <TabsTrigger value="customers">تحليل العملاء</TabsTrigger>
              <TabsTrigger value="sales">تحليل المبيعات</TabsTrigger>
              <TabsTrigger value="points">تحليل النقاط</TabsTrigger>
              <TabsTrigger value="advanced">تحليلات متقدمة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <ProductAnalytics 
                products={products} 
                invoices={invoices} 
                isLoading={isLoading} 
              />
            </TabsContent>
            
            <TabsContent value="customers">
              <CustomerAnalytics customers={customers} invoices={invoices} products={products} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="sales">
              <SalesAnalytics invoices={invoices} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="points">
              <PointsAnalytics invoices={invoices} customers={customers} products={products} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="advanced">
              <AdvancedAnalytics customers={customers} invoices={invoices} products={products} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Analytics;
