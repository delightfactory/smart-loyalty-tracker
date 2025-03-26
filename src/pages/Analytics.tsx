
import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductAnalytics from '@/components/analytics/ProductAnalytics';
import CustomerAnalytics from '@/components/analytics/CustomerAnalytics';
import SalesAnalytics from '@/components/analytics/SalesAnalytics';
import PointsAnalytics from '@/components/analytics/PointsAnalytics';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('products');

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
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="products">تحليل المنتجات</TabsTrigger>
              <TabsTrigger value="customers">تحليل العملاء</TabsTrigger>
              <TabsTrigger value="sales">تحليل المبيعات</TabsTrigger>
              <TabsTrigger value="points">تحليل النقاط</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <ProductAnalytics />
            </TabsContent>
            
            <TabsContent value="customers">
              <CustomerAnalytics />
            </TabsContent>
            
            <TabsContent value="sales">
              <SalesAnalytics />
            </TabsContent>
            
            <TabsContent value="points">
              <PointsAnalytics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Analytics;
