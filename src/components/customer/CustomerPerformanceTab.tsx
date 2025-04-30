
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ProductCategory } from '@/lib/types';
import { formatAmountEn } from '@/lib/formatters';

// الألوان المستخدمة للرسوم البيانية
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

interface CustomerPerformanceTabProps {
  customers: any[];
}

const CustomerPerformanceTab = ({ customers }: CustomerPerformanceTabProps) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedCustomer, setSelectedCustomer] = useState<string>(customers?.[0]?.id || '');

  // تحضير البيانات للعميل المحدد
  const selectedCustomerData = useMemo(() => {
    return customers.find(c => c.id === selectedCustomer);
  }, [customers, selectedCustomer]);

  // حساب المشتريات الشهرية من البيانات الحقيقية
  const monthlyPurchaseData = useMemo(() => {
    if (!selectedCustomerData || !selectedCustomerData.invoices || selectedCustomerData.invoices.length === 0) {
      return [];
    }
    
    // Map to hold monthly aggregated data
    const monthlyData: Record<string, { month: string, sales: number, visits: number }> = {};
    
    // Get the selected year or current year if none selected
    const year = parseInt(selectedYear, 10);
    
    // Process all invoices for the selected customer
    selectedCustomerData.invoices.forEach((invoice: any) => {
      const invoiceDate = new Date(invoice.date);
      const invoiceYear = invoiceDate.getFullYear();
      
      // Only process invoices from the selected year
      if (invoiceYear === year) {
        const monthKey = invoiceDate.getMonth();
        const monthName = format(invoiceDate, 'MMM', { locale: ar });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthName,
            sales: 0,
            visits: 0
          };
        }
        
        // Add invoice amount to sales
        monthlyData[monthKey].sales += invoice.totalAmount;
        // Count this as a visit
        monthlyData[monthKey].visits += 1;
      }
    });
    
    // Convert to array sorted by month
    return Object.entries(monthlyData)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([_, data]) => data);
  }, [selectedCustomerData, selectedYear]);

  // بيانات توزيع الفئات من البيانات الحقيقية
  const categoryDistributionData = useMemo(() => {
    if (!selectedCustomerData || !selectedCustomerData.invoices || selectedCustomerData.invoices.length === 0) {
      return [];
    }
    
    // Map for category distribution
    const categoryData: Record<string, number> = {};
    
    // Process all invoices for the selected customer
    selectedCustomerData.invoices.forEach((invoice: any) => {
      if (!invoice.items) return;
      
      invoice.items.forEach((item: any) => {
        if (!item.product || !item.product.category) return;
        
        const category = item.product.category;
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        
        // Add item amount to category total
        categoryData[category] += item.totalPrice;
      });
    });
    
    // Convert to array format for the chart
    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value
    }));
  }, [selectedCustomerData]);

  // Calculate performance indicators from real data
  const performanceIndicators = useMemo(() => {
    if (!selectedCustomerData || !selectedCustomerData.invoices || selectedCustomerData.invoices.length === 0) {
      return [
        { title: "متوسط المشتريات الشهرية", value: "0 ج.م", trend: "stable", percentage: "0%" },
        { title: "عدد زيارات السنة", value: "0", trend: "stable", percentage: "0%" },
        { title: "تنوع المشتريات", value: "0 فئات", trend: "stable", percentage: "0%" },
        { title: "معدل التحويل", value: "0%", trend: "stable", percentage: "0%" }
      ];
    }
    
    const invoices = selectedCustomerData.invoices;
    
    // Calculate average monthly purchases
    const totalAmount = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
    const uniqueMonths = new Set(invoices.map((inv: any) => {
      const date = new Date(inv.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })).size;
    const avgMonthlyPurchase = uniqueMonths > 0 ? totalAmount / uniqueMonths : 0;
    
    // Calculate annual visits
    const currentYear = new Date().getFullYear();
    const visitsThisYear = invoices.filter((inv: any) => new Date(inv.date).getFullYear() === currentYear).length;
    
    // Calculate purchase diversity (unique categories)
    const uniqueCategories = new Set();
    invoices.forEach((inv: any) => {
      if (!inv.items) return;
      inv.items.forEach((item: any) => {
        if (item.product && item.product.category) {
          uniqueCategories.add(item.product.category);
        }
      });
    });
    
    // Calculate conversion rate (assume it's the ratio of completed to total invoices)
    const completedInvoices = invoices.filter((inv: any) => inv.status === 'مدفوع').length;
    const conversionRate = invoices.length > 0 ? (completedInvoices / invoices.length) * 100 : 0;
    
    // Compare with previous period to get trends
    const previousPeriodInvoices = []; // This should be calculated based on a previous time period
    const previousTotalAmount = 0; // Similarly, this should be calculated for comparison
    
    return [
      {
        title: "متوسط المشتريات الشهرية",
        value: `${formatAmountEn(avgMonthlyPurchase)}`,
        trend: "up", // This should be determined by comparing with previous period
        percentage: "10%" // This should be calculated
      },
      {
        title: "عدد زيارات السنة",
        value: `${visitsThisYear}`,
        trend: "up", // This should be determined by comparing with previous period
        percentage: "15%" // This should be calculated
      },
      {
        title: "تنوع المشتريات",
        value: `${uniqueCategories.size} فئات`,
        trend: "up", // This should be determined by comparing with previous period
        percentage: "5%" // This should be calculated
      },
      {
        title: "معدل التحويل",
        value: `${Math.round(conversionRate)}%`,
        trend: "up", // This should be determined by comparing with previous period
        percentage: "8%" // This should be calculated
      }
    ];
  }, [selectedCustomerData]);

  // قيمة الإنفاق المتوقعة بناءً على متوسط الإنفاق الشهري
  const projectedSpending = useMemo(() => {
    if (!selectedCustomerData || !selectedCustomerData.invoices || selectedCustomerData.invoices.length === 0) {
      return 0;
    }
    
    const invoices = selectedCustomerData.invoices;
    const totalAmount = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
    const avgInvoiceAmount = invoices.length > 0 ? totalAmount / invoices.length : 0;
    
    // Project future spending based on the average and a simple model
    return Math.round(avgInvoiceAmount * 1.1); // 10% growth estimate
  }, [selectedCustomerData]);

  // احتمالية عودة العميل بناءً على تكرار الشراء وحداثة آخر عملية شراء
  const returnProbability = useMemo(() => {
    if (!selectedCustomerData || !selectedCustomerData.invoices || selectedCustomerData.invoices.length === 0) {
      return 0;
    }
    
    const invoices = selectedCustomerData.invoices;
    
    // Get the most recent invoice date
    const latestInvoice = [...invoices].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - new Date(latestInvoice.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate frequency of purchases
    const uniqueMonths = new Set(invoices.map((inv: any) => {
      const date = new Date(inv.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })).size;
    const purchaseFrequency = invoices.length / Math.max(1, uniqueMonths);
    
    // Calculate return probability - higher frequency and recency means higher probability
    let probability = 100;
    
    // Reduce probability based on days since last purchase
    if (daysSinceLastPurchase > 90) probability -= 50;
    else if (daysSinceLastPurchase > 60) probability -= 30;
    else if (daysSinceLastPurchase > 30) probability -= 15;
    
    // Adjust based on frequency
    if (purchaseFrequency < 0.5) probability -= 20;
    else if (purchaseFrequency >= 2) probability += 10;
    
    // Ensure probability is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(probability)));
  }, [selectedCustomerData]);

  // توصيات للعميل بناءً على سلوكه الشرائي
  const customerRecommendations = useMemo(() => {
    if (!selectedCustomerData || !selectedCustomerData.invoices || selectedCustomerData.invoices.length === 0) {
      return ["لا توجد بيانات كافية لتقديم توصيات للعميل"];
    }
    
    const invoices = selectedCustomerData.invoices;
    const recommendations = [];
    
    // Get favorite categories
    const categoryCount: Record<string, number> = {};
    invoices.forEach((inv: any) => {
      if (!inv.items) return;
      inv.items.forEach((item: any) => {
        if (item.product && item.product.category) {
          const category = item.product.category;
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });
    });
    
    const favoriteCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
    
    // Days since last purchase
    const latestInvoice = [...invoices].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - new Date(latestInvoice.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Generate recommendations based on customer behavior
    if (favoriteCategories.length > 0) {
      recommendations.push(`عرض خاص على منتجات من فئة ${favoriteCategories[0]}`);
    }
    
    if (daysSinceLastPurchase > 60) {
      recommendations.push("تذكير بعروض خاصة لتنشيط العميل بعد فترة غياب");
    } else {
      recommendations.push("تذكير بموعد الصيانة القادمة");
    }
    
    if (favoriteCategories.length > 1) {
      const leastPurchasedCategory = favoriteCategories[favoriteCategories.length - 1];
      recommendations.push(`كوبون خصم على منتجات من فئة ${leastPurchasedCategory}`);
    } else {
      recommendations.push("كوبون خصم على الخدمة الأقل طلباً");
    }
    
    return recommendations;
  }, [selectedCustomerData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="اختر عميل" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="اختر السنة" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCustomerData && (
          <div className="bg-muted p-2 rounded-md flex items-center gap-2 text-sm">
            <span className="font-semibold">العميل:</span>
            <span>{selectedCustomerData.name}</span>
            <Badge variant="outline" className="ml-2">
              نقاط: {selectedCustomerData.currentPoints || 0}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {performanceIndicators.map((indicator, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{indicator.title}</CardDescription>
              <CardTitle className="text-2xl">{indicator.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className={`flex items-center ${indicator.trend === "up" ? "text-green-500" : indicator.trend === "down" ? "text-red-500" : "text-yellow-500"}`}>
                  {indicator.trend === "up" ? "↑" : indicator.trend === "down" ? "↓" : "→"} {indicator.percentage}
                </div>
                <span className="text-muted-foreground text-xs ml-2">
                  مقارنة بالفترة السابقة
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="monthly">المشتريات الشهرية</TabsTrigger>
          <TabsTrigger value="categories">تنوع الفئات</TabsTrigger>
          <TabsTrigger value="predictions">التنبؤات والتوصيات</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>المشتريات الشهرية</CardTitle>
              <CardDescription>
                أداء العميل خلال 12 شهر الماضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {monthlyPurchaseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyPurchaseData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" name="المشتريات (ج.م)" fill="#8884d8" />
                      <Bar dataKey="visits" name="عدد الزيارات" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    لا توجد بيانات مشتريات متاحة للعميل في السنة المحددة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>توزيع المشتريات حسب الفئات</CardTitle>
              <CardDescription>
                نسبة المشتريات من كل فئة من فئات المنتجات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {categoryDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'القيمة']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    لا توجد بيانات فئات متاحة للعميل
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>التنبؤات</CardTitle>
                <CardDescription>
                  توقعات لسلوك العميل في الفترة القادمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">الإنفاق المتوقع في الشهر القادم</h4>
                    <div className="text-2xl font-bold">{formatAmountEn(projectedSpending)}</div>
                    <div className="h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(projectedSpending / 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">احتمالية العودة</h4>
                    <div className="text-2xl font-bold">{returnProbability}%</div>
                    <div className="h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className={`h-2 rounded-full ${returnProbability > 70 ? 'bg-green-500' : returnProbability > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${returnProbability}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التوصيات</CardTitle>
                <CardDescription>
                  اقتراحات لتحسين تجربة العميل وزيادة المبيعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {customerRecommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 border-b pb-3 last:border-0">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>{recommendation}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerPerformanceTab;
