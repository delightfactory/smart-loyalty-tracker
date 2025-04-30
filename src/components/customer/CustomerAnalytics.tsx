
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
import { formatAmountEn } from '@/lib/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CustomerAnalyticsProps {
  customers: any[];
  invoices: any[];
  products: any[];
  isLoading: boolean;
}

const CustomerAnalytics = ({ customers, invoices, products, isLoading }: CustomerAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all');
  const [segmentBy, setSegmentBy] = useState('businessType');
  
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
        averagePurchase: purchaseCount > 0 ? totalPurchase / purchaseCount : 0,
        lastPurchase: customer.lastPurchase,
        inactiveDays: customer.inactiveDays,
        pointsEarned: customer.pointsEarned || 0,
        pointsRedeemed: customer.pointsRedeemed || 0,
        currentPoints: customer.currentPoints || 0
      };
    }).sort((a, b) => b.totalPurchase - a.totalPurchase);
  }, [customers, invoices, isLoading]);
  
  // Top 10 customers
  const topCustomers = useMemo(() => customerPurchaseData.slice(0, 10), [customerPurchaseData]);
  
  // Business type distribution
  const businessTypeData = useMemo(() => {
    if (isLoading || !customers.length || !customerPurchaseData.length) {
      return [];
    }
    
    const typeMap = new Map();
    
    customers.forEach(customer => {
      if (!customer.businessType) return;
      
      const existing = typeMap.get(customer.businessType);
      const customerData = customerPurchaseData.find(c => c.id === customer.id);
      
      if (!existing) {
        typeMap.set(customer.businessType, {
          name: customer.businessType,
          count: 1,
          totalPurchase: customerData?.totalPurchase || 0,
          averagePurchase: customerData?.totalPurchase || 0
        });
      } else {
        typeMap.set(customer.businessType, {
          ...existing,
          count: existing.count + 1,
          totalPurchase: existing.totalPurchase + (customerData?.totalPurchase || 0),
          averagePurchase: (existing.totalPurchase + (customerData?.totalPurchase || 0)) / (existing.count + 1)
        });
      }
    });
    
    return Array.from(typeMap.values());
  }, [customers, customerPurchaseData, isLoading]);

  // Inactivity breakdown data
  const inactivityData = useMemo(() => {
    if (isLoading || !customers.length) return [];
    
    const groups = [
      { name: 'نشط (آخر 7 أيام)', count: 0, range: [0, 7] },
      { name: 'قليل النشاط (8-30 يوم)', count: 0, range: [8, 30] },
      { name: 'خطر معتدل (31-60 يوم)', count: 0, range: [31, 60] },
      { name: 'خطر مرتفع (61-90 يوم)', count: 0, range: [61, 90] },
      { name: 'غير نشط (أكثر من 90 يوم)', count: 0, range: [91, Infinity] }
    ];
    
    customers.forEach(customer => {
      const days = customer.inactiveDays || 0;
      const group = groups.find(g => days >= g.range[0] && days <= g.range[1]);
      if (group) group.count++;
    });
    
    return groups;
  }, [customers, isLoading]);

  // Segment customers by a property
  const getCustomerSegments = (property: string) => {
    if (!customerPurchaseData.length) return [];
    
    const segments = new Map();
    
    customerPurchaseData.forEach(customer => {
      let key: string;
      
      switch (property) {
        case 'businessType':
          key = customer.businessType || 'غير محدد';
          break;
        case 'activityLevel':
          if (!customer.inactiveDays && customer.inactiveDays !== 0) {
            key = 'غير محدد';
          } else if (customer.inactiveDays <= 7) {
            key = 'نشط جدًا';
          } else if (customer.inactiveDays <= 30) {
            key = 'نشط';
          } else if (customer.inactiveDays <= 90) {
            key = 'منخفض النشاط';
          } else {
            key = 'غير نشط';
          }
          break;
        case 'purchaseFrequency':
          if (!customer.purchaseCount) {
            key = 'لا مشتريات';
          } else if (customer.purchaseCount === 1) {
            key = 'مرة واحدة';
          } else if (customer.purchaseCount <= 3) {
            key = '2-3 مرات';
          } else if (customer.purchaseCount <= 10) {
            key = '4-10 مرات';
          } else {
            key = 'أكثر من 10 مرات';
          }
          break;
        case 'averageValue':
          if (!customer.averagePurchase) {
            key = 'لا مشتريات';
          } else if (customer.averagePurchase < 100) {
            key = 'أقل من 100 ج.م';
          } else if (customer.averagePurchase < 500) {
            key = '100-500 ج.م';
          } else if (customer.averagePurchase < 1000) {
            key = '500-1000 ج.م';
          } else {
            key = 'أكثر من 1000 ج.م';
          }
          break;
        default:
          key = 'غير مصنف';
      }
      
      const existing = segments.get(key);
      
      if (!existing) {
        segments.set(key, {
          name: key,
          count: 1,
          totalPurchase: customer.totalPurchase || 0,
          pointsEarned: customer.pointsEarned || 0,
          averagePurchase: customer.averagePurchase || 0
        });
      } else {
        segments.set(key, {
          ...existing,
          count: existing.count + 1,
          totalPurchase: existing.totalPurchase + (customer.totalPurchase || 0),
          pointsEarned: existing.pointsEarned + (customer.pointsEarned || 0),
          averagePurchase: (existing.totalPurchase + (customer.totalPurchase || 0)) / (existing.count + 1)
        });
      }
    });
    
    return Array.from(segments.values()).sort((a, b) => b.count - a.count);
  };
  
  // Customer segments data based on selected segmentation
  const segmentData = useMemo(() => getCustomerSegments(segmentBy), [segmentBy, customerPurchaseData]);

  // Colors for charts
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-4">
        <h3 className="text-lg font-semibold">تحليلات العملاء المتقدمة</h3>
        <div className="flex gap-4">
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
      </div>
      
      <Tabs defaultValue="segments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="segments">تحليل الشرائح</TabsTrigger>
          <TabsTrigger value="activity">تحليل النشاط</TabsTrigger>
          <TabsTrigger value="top">العملاء الأساسيين</TabsTrigger>
        </TabsList>

        <TabsContent value="segments">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>تحليل شرائح العملاء</CardTitle>
                    <CardDescription>توزيع العملاء حسب الخصائص المختلفة</CardDescription>
                  </div>
                  <Select value={segmentBy} onValueChange={setSegmentBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="تصنيف حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="businessType">نوع النشاط التجاري</SelectItem>
                      <SelectItem value="activityLevel">مستوى النشاط</SelectItem>
                      <SelectItem value="purchaseFrequency">معدل الشراء</SelectItem>
                      <SelectItem value="averageValue">متوسط قيمة الفاتورة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {segmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={segmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'عدد العملاء') return value;
                          return `${formatAmountEn(value as number)} ج.م`;
                        }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="عدد العملاء" fill="#8B5CF6" />
                        <Bar yAxisId="right" dataKey="totalPurchase" name="إجمالي المشتريات" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
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
                <CardTitle>التوزيع النسبي للشرائح</CardTitle>
                <CardDescription>نسبة كل شريحة من إجمالي عدد العملاء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {segmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={segmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {segmentData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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
              <CardTitle>مقارنة بين الشرائح</CardTitle>
              <CardDescription>مؤشرات الأداء الرئيسية لكل شريحة من العملاء</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right p-2 font-medium">الشريحة</th>
                      <th className="text-right p-2 font-medium">عدد العملاء</th>
                      <th className="text-right p-2 font-medium">نسبة العملاء</th>
                      <th className="text-right p-2 font-medium">إجمالي المشتريات</th>
                      <th className="text-right p-2 font-medium">متوسط قيمة المشتريات</th>
                      <th className="text-right p-2 font-medium">إجمالي النقاط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {segmentData.map((segment, index) => {
                      const percentage = (segment.count / customerPurchaseData.length) * 100;
                      return (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="p-2">{segment.name}</td>
                          <td className="p-2">{segment.count}</td>
                          <td className="p-2">{percentage.toFixed(1)}%</td>
                          <td className="p-2">{formatAmountEn(segment.totalPurchase)} ج.م</td>
                          <td className="p-2">{formatAmountEn(segment.averagePurchase)} ج.م</td>
                          <td className="p-2">{segment.pointsEarned}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل نشاط العملاء</CardTitle>
                <CardDescription>توزيع العملاء حسب فترة عدم النشاط</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {inactivityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inactivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="عدد العملاء" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
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
                <CardTitle>توزيع نشاط العملاء</CardTitle>
                <CardDescription>النسب المئوية لمستويات نشاط العملاء</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {inactivityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inactivityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {inactivityData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>العملاء الأكثر قيمة</CardTitle>
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
                      <BarChart data={topCustomers} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="font-medium">العميل:</div>
                                    <div>{payload[0]?.payload?.name}</div>
                                    <div className="font-medium">المشتريات:</div>
                                    <div>{formatAmountEn(payload[0]?.value as number)} ج.م</div>
                                    <div className="font-medium">عدد الفواتير:</div>
                                    <div>{payload[0]?.payload?.purchaseCount}</div>
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
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>قائمة العملاء الأساسيين</CardTitle>
                <CardDescription>العملاء الذين يمثلون أعلى قيمة للأعمال</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-right p-2 font-medium">العميل</th>
                        <th className="text-right p-2 font-medium">نوع النشاط</th>
                        <th className="text-right p-2 font-medium">إجمالي المشتريات</th>
                        <th className="text-right p-2 font-medium">عدد الفواتير</th>
                        <th className="text-right p-2 font-medium">متوسط الفاتورة</th>
                        <th className="text-right p-2 font-medium">فترة عدم النشاط</th>
                        <th className="text-right p-2 font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {topCustomers.map((customer, index) => (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="p-2 font-medium">{customer.name}</td>
                          <td className="p-2">{customer.businessType}</td>
                          <td className="p-2">{formatAmountEn(customer.totalPurchase)} ج.م</td>
                          <td className="p-2">{customer.purchaseCount}</td>
                          <td className="p-2">{formatAmountEn(customer.averagePurchase)} ج.م</td>
                          <td className="p-2">{customer.inactiveDays} يوم</td>
                          <td className="p-2">
                            {customer.inactiveDays > 90 ? (
                              <Badge variant="destructive">خطر</Badge>
                            ) : customer.inactiveDays > 30 ? (
                              <Badge variant="warning" className="bg-amber-500">تحذير</Badge>
                            ) : (
                              <Badge variant="success" className="bg-green-500">نشط</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerAnalytics;
