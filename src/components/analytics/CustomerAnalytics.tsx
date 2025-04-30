
import { useState, useMemo } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ProductCategory, BusinessType } from '@/lib/types';

interface CustomerAnalyticsProps {
  customers: any[];
  invoices: any[];
  products: any[];
  isLoading: boolean;
}

const CustomerAnalytics = ({ customers, invoices, products, isLoading }: CustomerAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Prepare customer purchase data based on real data
  const customerPurchaseData = useMemo(() => {
    if (isLoading || !customers.length || !invoices.length) return [];
    
    return customers.map(customer => {
      const customerInvoices = invoices.filter(invoice => invoice.customerId === customer.id);
      const totalPurchase = customerInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
      const purchaseCount = customerInvoices.length;
      
      return {
        id: customer.id,
        name: customer.name,
        businessType: customer.businessType,
        totalPurchase,
        purchaseCount,
        averagePurchase: purchaseCount > 0 ? totalPurchase / purchaseCount : 0
      };
    }).sort((a, b) => b.totalPurchase - a.totalPurchase);
  }, [customers, invoices, isLoading]);
  
  // Top 5 customers
  const topCustomers = useMemo(() => customerPurchaseData.slice(0, 5), [customerPurchaseData]);
  
  // Business type distribution
  const businessTypeData = useMemo(() => {
    if (isLoading || !customers.length || !customerPurchaseData.length) {
      return [];
    }
    
    return Object.values(BusinessType).map(type => {
      const typeCustomers = customers.filter(customer => customer.businessType === type);
      const typePurchases = customerPurchaseData
        .filter(customer => typeCustomers.some(c => c.id === customer.id))
        .reduce((sum, customer) => sum + customer.totalPurchase, 0);
      
      return {
        name: type,
        value: typePurchases
      };
    }).filter(item => item.value > 0);
  }, [customers, customerPurchaseData, isLoading]);

  // Customer points data
  const customerPointsData = useMemo(() => {
    if (isLoading || !customers.length) return [];
    
    return customers.map(customer => ({
      name: customer.name,
      earned: customer.pointsEarned,
      redeemed: customer.pointsRedeemed,
      current: customer.currentPoints
    })).slice(0, 5);
  }, [customers, isLoading]);

  // Colors for charts
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="الفترة الزمنية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفترات</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
            <SelectItem value="quarter">آخر ربع سنة</SelectItem>
            <SelectItem value="year">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>العملاء الأكثر شراءً</CardTitle>
            <CardDescription>ترتيب العملاء حسب إجمالي قيمة المشتريات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {topCustomers.length > 0 ? (
                <ChartContainer
                  config={{
                    totalPurchase: {
                      label: "إجمالي المشتريات",
                      color: "#8B5CF6"
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCustomers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="font-medium">العميل:</div>
                                  <div>{payload[0].payload.name}</div>
                                  <div className="font-medium">إجمالي المشتريات:</div>
                                  <div>{payload[0].value.toLocaleString('ar-EG')} ج.م</div>
                                  <div className="font-medium">عدد الفواتير:</div>
                                  <div>{payload[0].payload.purchaseCount}</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="totalPurchase" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>نقاط العملاء</CardTitle>
            <CardDescription>مقارنة بين النقاط المكتسبة والمستبدلة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {customerPointsData.length > 0 ? (
                <ChartContainer
                  config={{
                    earned: {
                      label: "النقاط المكتسبة",
                      color: "#10B981"
                    },
                    redeemed: {
                      label: "النقاط المستبدلة",
                      color: "#F59E0B"
                    },
                    current: {
                      label: "الرصيد الحالي",
                      color: "#3B82F6"
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={customerPointsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="earned" stroke="#10B981" />
                      <Line type="monotone" dataKey="redeemed" stroke="#F59E0B" />
                      <Line type="monotone" dataKey="current" stroke="#3B82F6" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع العملاء حسب نوع النشاط</CardTitle>
          <CardDescription>قيمة المبيعات حسب نوع نشاط العميل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {businessTypeData.length > 0 ? (
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={businessTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {businessTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString('ar-EG')} ج.م`, 'قيمة المبيعات']} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
