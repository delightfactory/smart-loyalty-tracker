
import { useState } from 'react';
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
  ZAxis
} from 'recharts';
import { 
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
import { customers, invoices, products } from '@/lib/data';
import { ProductCategory, BusinessType, InvoiceStatus } from '@/lib/types';

// Extract month and year from date
const getMonthYear = (date: Date) => {
  const month = date.toLocaleString('ar-EG', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

// Group data by month
const groupByMonth = (data: any[], dateKey: string, valueKey: string) => {
  const grouped = data.reduce((acc, item) => {
    const date = new Date(item[dateKey]);
    const monthYear = getMonthYear(date);
    
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    
    acc[monthYear] += item[valueKey];
    return acc;
  }, {});
  
  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all');

  // Calculate sales and revenue trends
  const salesData = groupByMonth(invoices, 'date', 'totalAmount');
  
  // Calculate customers by business type
  const customersByType = Object.values(BusinessType).map(type => {
    const count = customers.filter(customer => customer.businessType === type).length;
    return { name: type, value: count };
  });
  
  // Calculate product category distribution
  const categoryDistribution = Object.values(ProductCategory).map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    return { name: category, value: categoryProducts.length };
  });
  
  // Calculate correlation between price and sales
  const priceVsSales = products.map(product => {
    // Get total quantity sold for this product
    const totalSold = invoices.reduce((total, invoice) => {
      const item = invoice.items.find(item => item.productId === product.id);
      return total + (item ? item.quantity : 0);
    }, 0);
    
    return {
      name: product.name,
      price: product.price,
      sales: totalSold,
      // Add a small random variation for better visualization in scatter plot
      z: Math.floor(Math.random() * 10) + 1
    };
  });
  
  // Customer acquisition over time (simplified mock data)
  const customerAcquisitionData = [
    { name: 'يناير', new: 4, active: 2, inactive: 1 },
    { name: 'فبراير', new: 5, active: 7, inactive: 2 },
    { name: 'مارس', new: 3, active: 9, inactive: 3 },
    { name: 'أبريل', new: 6, active: 12, inactive: 2 },
    { name: 'مايو', new: 4, active: 15, inactive: 4 },
    { name: 'يونيو', new: 7, active: 17, inactive: 5 }
  ];
  
  // Product category performance
  const categoryPerformanceData = [
    { category: ProductCategory.ENGINE_CARE, sales: 85, growth: 15, profit: 75 },
    { category: ProductCategory.EXTERIOR_CARE, sales: 70, growth: 8, profit: 65 },
    { category: ProductCategory.TIRE_CARE, sales: 60, growth: 20, profit: 55 },
    { category: ProductCategory.DASHBOARD_CARE, sales: 45, growth: 5, profit: 50 },
    { category: ProductCategory.INTERIOR_CARE, sales: 40, growth: 10, profit: 45 }
  ];
  
  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="value" name="قيمة المبيعات" fill="url(#colorSales)" stroke="#8884d8" />
                    <Line type="monotone" dataKey="value" name="قيمة المبيعات" stroke="#8884d8" dot={{ r: 4 }} />
                    <Bar dataKey="value" name="قيمة المبيعات" barSize={20} fill="#8884d8" fillOpacity={0.3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">تحليل: أظهرت المبيعات نموًا بنسبة 15% خلال الأشهر الثلاثة الأخيرة، مع توقع استمرار هذا النمو.</p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    ...salesData,
                    { name: 'يوليو', value: 9200, forecasted: true },
                    { name: 'أغسطس', value: 10500, forecasted: true },
                    { name: 'سبتمبر', value: 11800, forecasted: true }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <ArrowUpRight className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">توقعات: من المتوقع زيادة المبيعات بنسبة 28% خلال الربع القادم نتيجة لموسم الصيف.</p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="price" name="السعر" />
                    <YAxis dataKey="sales" name="المبيعات" />
                    <ZAxis dataKey="z" range={[30, 100]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="المنتجات" data={priceVsSales} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-amber-50 text-amber-700 p-3 rounded-lg w-full">
                  <BrainCircuit className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">تحليل: لوحظ أن المنتجات متوسطة السعر (50-100 ج.م) تحقق أعلى معدلات مبيعات.</p>
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <TrendingUp className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">تحليل: نمو مستمر في عدد العملاء النشطين بمعدل 15% شهرياً، مع معدل احتفاظ بالعملاء 85%.</p>
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
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <ShoppingBag className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">تحليل: مراكز الخدمة ومحطات الوقود تمثل أكبر شرائح العملاء بنسبة 65% من إجمالي العملاء.</p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={80} data={categoryPerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="المبيعات" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="النمو" dataKey="growth" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="الربحية" dataKey="profit" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <CloudLightning className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">تحليل: منتجات العناية بالمحرك تحقق أعلى المبيعات، بينما منتجات العناية بالإطارات تظهر أسرع نمو.</p>
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
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                        <span>زيادة متوقعة بنسبة 22% في مبيعات الربع القادم</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                        <span>نمو في مبيعات منتجات العناية بالإطارات بنسبة 35%</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                        <span>زيادة إقبال مراكز الخدمة على منتجات الصيانة المتكاملة</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <Users className="h-6 w-6 text-purple-600 mr-3" />
                      <h3 className="text-lg font-medium text-purple-800">توقعات سلوك العملاء</h3>
                    </div>
                    <ul className="space-y-3 text-purple-700">
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                        <span>زيادة في متوسط قيمة الفاتورة بنسبة 18%</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                        <span>تحول نحو المنتجات الصديقة للبيئة بنسبة 25%</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                        <span>ارتفاع معدل استبدال النقاط بنسبة 40%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-5">
                    <div className="flex items-center mb-4">
                      <BadgeAlert className="h-6 w-6 text-amber-600 mr-3" />
                      <h3 className="text-lg font-medium text-amber-800">المخاطر والفرص</h3>
                    </div>
                    <ul className="space-y-3 text-amber-700">
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                        <span>فرصة: توسيع قاعدة العملاء في قطاع محطات الوقود</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                        <span>فرصة: إطلاق منتجات جديدة للعناية بالسيارات الكهربائية</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                        <span>تحدي: زيادة المنافسة في قطاع منتجات العناية بالمحرك</span>
                      </li>
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
