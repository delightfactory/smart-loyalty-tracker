
import { useState, useMemo } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ZAxis,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  BrainCircuit, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart3, 
  CircleDashed, 
  Search, 
  Timer, 
  ShoppingBag,
  Users,
  Lightbulb,
  PieChart as PieChartIcon,
  CloudLightning,
  Award,
  BadgeAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ProductCategory, BusinessType, InvoiceStatus } from '@/lib/types';

interface AdvancedAnalyticsProps {
  customers: any[];
  invoices: any[];
  products: any[];
  isLoading: boolean;
}

// Helper function to extract month and year from date
const getMonthYear = (date: Date) => {
  const month = date.toLocaleString('ar-EG', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

// Group data by month
const groupByMonth = (data: any[], dateKey: string, valueKey: string) => {
  const grouped = data.reduce((acc, item) => {
    if (!item[dateKey]) return acc;
    
    const date = new Date(item[dateKey]);
    const monthYear = getMonthYear(date);
    
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    
    acc[monthYear] += item[valueKey] || 0;
    return acc;
  }, {});
  
  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};

const AdvancedAnalytics = ({ customers, invoices, products, isLoading }: AdvancedAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Filter data based on time range
  const filteredInvoices = useMemo(() => {
    if (isLoading || !invoices.length) return [];
    
    const now = new Date();
    
    if (timeRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return invoices.filter(inv => new Date(inv.date) >= monthAgo);
    }
    
    if (timeRange === 'quarter') {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      return invoices.filter(inv => new Date(inv.date) >= quarterAgo);
    }
    
    if (timeRange === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return invoices.filter(inv => new Date(inv.date) >= yearAgo);
    }
    
    return invoices;
  }, [invoices, timeRange, isLoading]);

  // Calculate sales and revenue trends using real data
  const salesData = useMemo(() => {
    if (isLoading || !filteredInvoices.length) return [];
    return groupByMonth(filteredInvoices, 'date', 'totalAmount');
  }, [filteredInvoices, isLoading]);
  
  // Calculate customers by business type
  const customersByType = useMemo(() => {
    if (isLoading || !customers.length) return [];
    
    return Object.values(BusinessType).map(type => {
      const count = customers.filter(customer => customer.businessType === type).length;
      return { name: type, value: count };
    }).filter(item => item.value > 0);
  }, [customers, isLoading]);
  
  // Calculate product category distribution
  const categoryDistribution = useMemo(() => {
    if (isLoading || !products.length) return [];
    
    const categoryCount: Record<string, number> = {};
    
    Object.values(ProductCategory).forEach(cat => {
      categoryCount[cat] = 0;
    });
    
    products.forEach(product => {
      if (categoryCount[product.category] !== undefined) {
        categoryCount[product.category]++;
      }
    });
    
    return Object.entries(categoryCount)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        name: category, 
        value: count
      }));
  }, [products, isLoading]);
  
  // Calculate correlation between price and sales
  const priceVsSales = useMemo(() => {
    if (isLoading || !filteredInvoices.length || !products.length) return [];
    
    return products.map(product => {
      // Get total quantity sold for this product
      const totalSold = filteredInvoices.reduce((total, invoice) => {
        if (!invoice.items) return total;
        
        const item = invoice.items.find((item: any) => item.productId === product.id);
        return total + (item ? item.quantity : 0);
      }, 0);
      
      return {
        name: product.name,
        price: product.price,
        sales: totalSold,
        // Add a small random variation for better visualization in scatter plot
        z: Math.floor(Math.random() * 10) + 1
      };
    }).filter(item => item.sales > 0);
  }, [filteredInvoices, products, isLoading]);
  
  // Calculate product category performance based on sales data
  const categoryPerformanceData = useMemo(() => {
    if (isLoading || !filteredInvoices.length || !products.length) return [];
    
    const categoryData: Record<string, { sales: number, count: number, totalValue: number }> = {};
    
    // Initialize categories
    Object.values(ProductCategory).forEach(cat => {
      categoryData[cat] = { sales: 0, count: 0, totalValue: 0 };
    });
    
    // Calculate sales per category
    filteredInvoices.forEach(invoice => {
      if (!invoice.items) return;
      
      invoice.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (product && categoryData[product.category]) {
          categoryData[product.category].sales += item.quantity;
          categoryData[product.category].count += 1;
          categoryData[product.category].totalValue += item.totalPrice;
        }
      });
    });
    
    // Calculate performance metrics for each category
    return Object.entries(categoryData)
      .filter(([_, data]) => data.sales > 0)
      .map(([category, data]) => {
        // Calculate a growth metric (simplified for demo)
        const growth = Math.round((data.totalValue / data.sales) * 10) / 10;
        
        // Calculate a profit metric (simplified for demo)
        const profit = Math.round(data.totalValue * 0.3); // Assume 30% profit margin
        
        return {
          category,
          sales: data.sales,
          growth: growth > 0 ? growth : 5, // Ensure positive value for visualization
          profit: profit > 0 ? profit : 10 // Ensure positive value for visualization
        };
      });
  }, [filteredInvoices, products, isLoading]);
  
  // Customer acquisition over time based on customer creation date
  const customerAcquisitionData = useMemo(() => {
    if (isLoading || !customers.length) return [];
    
    // Get the last 6 months
    const monthsData: Record<string, {new: number, active: number, inactive: number}> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleString('ar-EG', { month: 'short' });
      monthsData[monthYear] = { new: 0, active: 0, inactive: 0 };
    }
    
    // Calculate new customers per month
    customers.forEach(customer => {
      if (!customer.created_at) return;
      
      const createdAt = new Date(customer.created_at);
      const monthYear = createdAt.toLocaleString('ar-EG', { month: 'short' });
      
      if (monthsData[monthYear]) {
        monthsData[monthYear].new++;
      }
    });
    
    // Calculate active/inactive customers based on their last invoice
    customers.forEach(customer => {
      // Find customer's last invoice
      const customerInvoices = filteredInvoices.filter(inv => inv.customerId === customer.id);
      
      if (customerInvoices.length > 0) {
        const lastInvoice = customerInvoices.reduce(
          (latest, inv) => new Date(inv.date) > new Date(latest.date) ? inv : latest, 
          customerInvoices[0]
        );
        
        const invoiceDate = new Date(lastInvoice.date);
        const monthYear = invoiceDate.toLocaleString('ar-EG', { month: 'short' });
        
        // If invoice is in the last 6 months
        if (monthsData[monthYear]) {
          // Determine if customer is active (purchased in last 30 days) or inactive
          const daysSinceLastPurchase = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastPurchase <= 30) {
            monthsData[monthYear].active++;
          } else {
            monthsData[monthYear].inactive++;
          }
        }
      }
    });
    
    // Convert to array format for charts
    return Object.entries(monthsData).map(([name, data]) => ({
      name,
      ...data
    }));
  }, [customers, filteredInvoices, isLoading]);
  
  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <BrainCircuit className="h-6 w-6 mr-2 text-purple-500" />
          <h2 className="text-xl font-bold">التحليلات المتقدمة والتوقعات</h2>
        </div>
        
        <div className="flex gap-2">
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
      
      <Tabs defaultValue="trends">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            الاتجاهات والتوقعات
          </TabsTrigger>
          <TabsTrigger value="correlations">
            <CircleDashed className="h-4 w-4 mr-2" />
            العلاقات والارتباطات
          </TabsTrigger>
          <TabsTrigger value="segments">
            <BarChart3 className="h-4 w-4 mr-2" />
            تقسيم وتحليل القطاعات
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <BrainCircuit className="h-4 w-4 mr-2" />
            التوقعات المستقبلية
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  اتجاهات المبيعات
                </CardTitle>
                <CardDescription>تحليل اتجاهات المبيعات على مدار الأشهر</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toLocaleString('ar-EG')} ج.م`, 'قيمة المبيعات']} />
                      <Legend />
                      <Area type="monotone" dataKey="value" name="قيمة المبيعات" fill="url(#colorSales)" stroke="#8884d8" />
                      <Line type="monotone" dataKey="value" name="قيمة المبيعات" stroke="#8884d8" dot={{ r: 4 }} />
                      <Bar dataKey="value" name="قيمة المبيعات" barSize={20} fill="#8884d8" fillOpacity={0.3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    تحليل: {salesData.length >= 2 ? 
                      (salesData[salesData.length - 1].value > salesData[0].value ? 
                        'أظهرت المبيعات نموًا خلال الفترة المحددة' : 
                        'انخفضت المبيعات خلال الفترة المحددة') : 
                      'لا توجد بيانات كافية لتحليل اتجاه المبيعات'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="h-5 w-5 mr-2" />
                  التوقعات المستقبلية للمبيعات
                </CardTitle>
                <CardDescription>توقعات المبيعات للثلاثة أشهر القادمة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={[
                        ...salesData,
                        // Generate forecast data (simplified linear projection)
                        ...(() => {
                          if (salesData.length < 2) return [];
                          
                          const lastTwo = salesData.slice(-2);
                          const growth = (lastTwo[1].value as number) - (lastTwo[0].value as number);
                          const lastValue = lastTwo[1].value as number;
                          
                          return [
                            { name: 'توقع 1', value: undefined, forecasted: lastValue + growth },
                            { name: 'توقع 2', value: undefined, forecasted: lastValue + growth * 2 },
                            { name: 'توقع 3', value: undefined, forecasted: lastValue + growth * 3 }
                          ];
                        })()
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => value ? [`${value.toLocaleString('ar-EG')} ج.م`, 'قيمة المبيعات'] : ['', '']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="المبيعات الفعلية" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="forecasted" 
                        name="المبيعات المتوقعة" 
                        stroke="#82ca9d" 
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <ArrowUpRight className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {salesData.length >= 2 ? 
                      'توقعات: تم عرض توقعات المبيعات للأشهر القادمة بناءً على اتجاه المبيعات السابقة' : 
                      'لا توجد بيانات كافية لعمل توقعات دقيقة'}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="correlations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  العلاقة بين السعر والمبيعات
                </CardTitle>
                <CardDescription>تحليل تأثير السعر على حجم المبيعات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {priceVsSales.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="price" 
                        name="السعر" 
                        tickFormatter={value => `${value.toLocaleString('ar-EG')}`} 
                      />
                      <YAxis dataKey="sales" name="المبيعات" />
                      <ZAxis dataKey="z" range={[30, 100]} />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'price') return [`${value.toLocaleString('ar-EG')} ج.م`, 'السعر'];
                          if (name === 'sales') return [`${value}`, 'المبيعات'];
                          return [value, name];
                        }} 
                        cursor={{ strokeDasharray: '3 3' }}
                      />
                      <Legend />
                      <Scatter name="المنتجات" data={priceVsSales} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-amber-50 text-amber-700 p-3 rounded-lg w-full">
                  <BrainCircuit className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {priceVsSales.length > 0 ? 
                      'تحليل: توضح العلاقة بين سعر المنتج وحجم المبيعات، يمكن استخدامها لتحديد الأسعار المثلى' : 
                      'لا توجد بيانات كافية لدراسة العلاقة بين السعر والمبيعات'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  تطور قاعدة العملاء
                </CardTitle>
                <CardDescription>نمو العملاء الجدد والنشطين شهرياً</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {customerAcquisitionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={customerAcquisitionData}>
                      <defs>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="new" name="عملاء جدد" stroke="#8884d8" fillOpacity={1} fill="url(#colorNew)" />
                      <Area type="monotone" dataKey="active" name="عملاء نشطون" stroke="#82ca9d" fillOpacity={1} fill="url(#colorActive)" />
                      <Area type="monotone" dataKey="inactive" name="عملاء غير نشطين" stroke="#ffc658" fillOpacity={1} fill="url(#colorInactive)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <TrendingUp className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {customerAcquisitionData.length > 0 ? 
                      'تحليل: يوضح الرسم البياني تطور أعداد العملاء الجدد والنشطين وغير النشطين عبر الأشهر' : 
                      'لا توجد بيانات كافية لتحليل تطور قاعدة العملاء'}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="segments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  توزيع العملاء حسب النشاط
                </CardTitle>
                <CardDescription>تحليل قاعدة العملاء حسب نوع النشاط</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {customersByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customersByType}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {customersByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} عميل`, 'عدد العملاء']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <ShoppingBag className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {customersByType.length > 0 ? 
                      'تحليل: يوضح توزيع العملاء حسب نوع النشاط، يمكن استخدامه لاستهداف شرائح معينة بعروض خاصة' : 
                      'لا توجد بيانات كافية لتحليل توزيع العملاء حسب النشاط'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  أداء فئات المنتجات
                </CardTitle>
                <CardDescription>تحليل متعدد الأبعاد لأداء فئات المنتجات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {categoryPerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={80} data={categoryPerformanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                      <Radar name="المبيعات" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="النمو" dataKey="growth" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="الربحية" dataKey="profit" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <CloudLightning className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {categoryPerformanceData.length > 0 ? 
                      'تحليل: يمكن استخدام هذا التحليل لمقارنة أداء فئات المنتجات من حيث المبيعات والنمو والربحية' : 
                      'لا توجد بيانات كافية لتحليل أداء فئات المنتجات'}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="predictions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2" />
                  التوقعات والتنبؤات المستقبلية
                </CardTitle>
                <CardDescription>توقعات مستقبلية مبنية على تحليل البيانات التاريخية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-medium text-blue-800">توقعات المبيعات</h3>
                    </div>
                    <ul className="space-y-3 text-blue-700">
                      {salesData.length >= 2 ? (
                        <>
                          <li className="flex items-start">
                            <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                            <span>
                              {salesData[salesData.length - 1].value > salesData[0].value ? 
                                'استمرار النمو في المبيعات متوقع خلال الأشهر القادمة' : 
                                'من المتوقع استقرار المبيعات في الفترة القادمة'}
                            </span>
                          </li>
                          <li className="flex items-start">
                            <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                            <span>فرصة لزيادة المبيعات عبر العروض والحملات التسويقية</span>
                          </li>
                        </>
                      ) : (
                        <li className="flex items-start">
                          <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                          <span>لا توجد بيانات كافية للتنبؤ بتوجهات المبيعات المستقبلية</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <Users className="h-6 w-6 text-purple-600 mr-3" />
                      <h3 className="text-lg font-medium text-purple-800">توقعات سلوك العملاء</h3>
                    </div>
                    <ul className="space-y-3 text-purple-700">
                      {customers.length > 0 ? (
                        <>
                          <li className="flex items-start">
                            <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                            <span>تنويع المنتجات يزيد من متوسط قيمة الفاتورة</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                            <span>زيادة متوقعة في استبدال نقاط الولاء</span>
                          </li>
                        </>
                      ) : (
                        <li className="flex items-start">
                          <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                          <span>لا توجد بيانات كافية للتنبؤ بسلوك العملاء</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <BadgeAlert className="h-6 w-6 text-amber-600 mr-3" />
                      <h3 className="text-lg font-medium text-amber-800">المخاطر والفرص</h3>
                    </div>
                    <ul className="space-y-3 text-amber-700">
                      {categoryDistribution.length > 0 && customers.length > 0 ? (
                        <>
                          <li className="flex items-start">
                            <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                            <span>فرصة: توسيع قاعدة العملاء في القطاعات ذات الإقبال العالي</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                            <span>فرصة: الاستفادة من نظام النقاط لزيادة الولاء والمبيعات</span>
                          </li>
                        </>
                      ) : (
                        <li className="flex items-start">
                          <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-amber-500" />
                          <span>لا توجد بيانات كافية لتحديد المخاطر والفرص بدقة</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline">تصدير التقرير</Button>
                <Button>إنشاء خطة عمل</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
