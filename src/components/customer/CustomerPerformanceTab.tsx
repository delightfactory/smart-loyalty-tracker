
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
import { ar } from 'date-fns/locale';
import { format, subMonths } from 'date-fns';
import { ProductCategory } from '@/lib/types';

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

  // بيانات المشتريات الشهرية (بيانات توضيحية)
  const monthlyPurchaseData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM', { locale: ar }),
        sales: Math.floor(Math.random() * 10000) + 1000,
        visits: Math.floor(Math.random() * 10) + 1,
      };
    }).reverse();

    return months;
  }, []);

  // بيانات تنوع الفئات (بيانات توضيحية)
  const categoryDistributionData = useMemo(() => {
    return Object.values(ProductCategory).map(category => ({
      name: category,
      value: Math.floor(Math.random() * 100) + 10
    }));
  }, []);

  // مؤشرات الأداء الرئيسية للعميل
  const performanceIndicators = useMemo(() => {
    return [
      {
        title: "متوسط المشتريات الشهرية",
        value: `${Math.floor(Math.random() * 5000) + 1000} ج.م`,
        trend: Math.random() > 0.5 ? "up" : "down",
        percentage: `${Math.floor(Math.random() * 30) + 1}%`
      },
      {
        title: "عدد زيارات السنة",
        value: `${Math.floor(Math.random() * 20) + 5}`,
        trend: Math.random() > 0.5 ? "up" : "down",
        percentage: `${Math.floor(Math.random() * 40) + 1}%`
      },
      {
        title: "تنوع المشتريات",
        value: `${Math.floor(Math.random() * 5) + 1} فئات`,
        trend: Math.random() > 0.5 ? "up" : "down",
        percentage: `${Math.floor(Math.random() * 20) + 1}%`
      },
      {
        title: "معدل التحويل",
        value: `${Math.floor(Math.random() * 90) + 10}%`,
        trend: Math.random() > 0.5 ? "up" : "down",
        percentage: `${Math.floor(Math.random() * 15) + 1}%`
      }
    ];
  }, []);

  // قيمة الإنفاق المتوقعة (بيانات توضيحية)
  const projectedSpending = Math.floor(Math.random() * 10000) + 5000;

  // احتمالية عودة العميل (بيانات توضيحية)
  const returnProbability = Math.floor(Math.random() * 90) + 10;

  // توصيات للعميل بناءً على سلوكه السابق
  const customerRecommendations = [
    "عرض خاص على منتجات من الفئة الأكثر شراءً",
    "تذكير بموعد الصيانة القادمة",
    "كوبون خصم على الخدمة الأقل طلباً"
  ];

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
              نقاط: {selectedCustomerData.loyaltyPoints}
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
                <div className={`flex items-center ${indicator.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {indicator.trend === "up" ? "↑" : "↓"} {indicator.percentage}
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
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
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
                    <div className="text-2xl font-bold">{projectedSpending} ج.م</div>
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
