
import { useState } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartLegend
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Percent, 
  Activity, 
  Star, 
  ShoppingBag, 
  Calendar,
  AlertCircle,
  Clock, 
  Lightbulb,
  PieChart as PieChartIcon,
  Target
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCategory, Product, Invoice } from '@/lib/types';
import { formatNumberEn, formatAmountEn } from '@/lib/formatters';

interface ProductAnalyticsProps {
  products: Product[];
  invoices: Invoice[];
  isLoading: boolean;
}

const ProductAnalytics = ({ products = [], invoices = [], isLoading = false }: ProductAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  if (isLoading) {
    return <AnalyticsLoadingState />;
  }
  
  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  
  // Filter invoices based on time range
  const filteredInvoices = filterInvoicesByTimeRange(invoices, timeRange);
  
  // Get product sales data from real DB data
  const productSalesData = calculateProductSalesData(filteredProducts, filteredInvoices);
  
  // Top 5 products by sales
  const topProducts = [...productSalesData].sort((a, b) => b.sales - a.sales).slice(0, 5);
  
  // Top 5 products by revenue
  const topRevenueProducts = [...productSalesData].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  
  // Category distribution
  const categoryData = calculateCategoryData(products, productSalesData);
  
  // Brand performance data
  const brandPerformanceData = calculateBrandPerformanceData(productSalesData);
  
  // Price vs. Sales correlation data
  const priceVsSalesData = productSalesData.map(product => ({
    name: product.name,
    price: product.price,
    sales: product.sales,
    revenue: product.revenue,
    // Add a size value for the scatter plot point
    z: Math.floor(product.revenue / 100) + 5
  }));
  
  // Radar chart data for category analysis
  const categoryRadarData = calculateCategoryRadarData(products, productSalesData);
  
  // Monthly sales trend from real invoice data
  const monthlyTrendData = calculateMonthlyTrendData(filteredInvoices, products);
  
  // Calculate total revenue
  const totalRevenue = productSalesData.reduce((sum, product) => sum + product.revenue, 0);
  
  // Calculate total sales
  const totalSales = productSalesData.reduce((sum, product) => sum + product.sales, 0);
  
  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            تحليل المنتجات والمبيعات
          </h2>
          <p className="text-muted-foreground mt-1">تحليلات متقدمة لأداء المنتجات ومبيعاتها</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
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
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="تصنيف المنتجات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {Object.values(ProductCategory).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{formatNumberEn(totalSales)} وحدة</div>
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                {calculateGrowthRate(invoices, 'sales')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">مقارنة بالفترة السابقة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</CardTitle>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{formatAmountEn(totalRevenue)} ج.م</div>
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                {calculateGrowthRate(invoices, 'revenue')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">مقارنة بالفترة السابقة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">متوسط قيمة المنتج</CardTitle>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {totalSales > 0 ? formatAmountEn(totalRevenue / totalSales) : '0'} ج.م
              </div>
              <Badge variant="outline" className="text-amber-500">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                {calculateAverageGrowth(invoices, products)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">متوسط سعر الوحدة المباعة</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sales" className="mb-6">
        <TabsList className="mb-4 grid grid-cols-4">
          <TabsTrigger value="sales">
            <ShoppingBag className="h-4 w-4 mr-2" />
            المبيعات والإيرادات
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" />
            تحليل الأقسام
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            أداء المنتجات
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            التوصيات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  المنتجات الأكثر مبيعاً
                </CardTitle>
                <CardDescription>ترتيب المنتجات حسب عدد الوحدات المباعة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {topProducts.length > 0 ? (
                  <ChartContainer
                    config={{
                      sales: {
                        label: "المبيعات",
                        color: "#8B5CF6"
                      }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={130} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="font-medium">المنتج:</div>
                                    <div>{payload[0].payload.name}</div>
                                    <div className="font-medium">المبيعات:</div>
                                    <div>{payload[0].value} وحدة</div>
                                    <div className="font-medium">الإيرادات:</div>
                                    <div>{formatAmountEn(payload[0].payload.revenue)} ج.م</div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="sales" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {topProducts.length > 0 
                      ? `تمثل هذه المنتجات نسبة كبيرة من إجمالي المبيعات. يُنصح بضمان توفرها دائمًا.`
                      : 'قم بإضافة منتجات وفواتير لرؤية التحليلات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Percent className="h-5 w-5 mr-2" />
                  المنتجات الأعلى إيرادًا
                </CardTitle>
                <CardDescription>ترتيب المنتجات حسب إجمالي قيمة المبيعات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {topRevenueProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topRevenueProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => `${formatAmountEn(value)} ج.م`}
                        labelFormatter={(label) => `المنتج: ${label}`}
                      />
                      <Legend />
                      <Bar name="الإيرادات" dataKey="revenue" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <TrendingUp className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {topRevenueProducts.length > 0 
                      ? 'تمثل هذه المنتجات نسبة كبيرة من إجمالي الإيرادات. تركيز جهود التسويق عليها سيزيد الأرباح.'
                      : 'قم بإضافة منتجات وفواتير لرؤية التحليلات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  اتجاهات المبيعات الشهرية
                </CardTitle>
                <CardDescription>تطور المبيعات والإيرادات على مر الأشهر</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="sales" name="المبيعات (وحدة)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name="الإيرادات (ج.م)" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات كافية لعرض الاتجاهات الشهرية</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Clock className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {monthlyTrendData.length > 0 
                      ? getMonthlyTrendInsight(monthlyTrendData)
                      : 'أضف المزيد من الفواتير بتواريخ مختلفة لرؤية تحليل الاتجاهات الشهرية.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  توزيع المبيعات حسب الأقسام
                </CardTitle>
                <CardDescription>نسبة مبيعات كل قسم من أقسام المنتجات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {categoryData.length > 0 && categoryData.some(c => c.sales > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `${value} وحدة`}
                        labelFormatter={(label) => `القسم: ${label}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات مبيعات كافية لعرض التوزيع</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {categoryData.length > 0 && categoryData.some(c => c.sales > 0)
                      ? getCategoryDistributionInsight(categoryData)
                      : 'قم بإضافة فواتير تحتوي على منتجات من فئات مختلفة لرؤية تحليلات توزيع المبيعات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  تحليل متعدد الأبعاد للأقسام
                </CardTitle>
                <CardDescription>مقارنة بين أداء أقسام المنتجات المختلفة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {categoryRadarData.length > 0 && categoryRadarData.some(c => c.sales > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={80} data={categoryRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="السعر" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="المبيعات" dataKey="sales" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="الإيرادات" dataKey="revenue" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Radar name="النقاط" dataKey="points" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات كافية لعرض التحليل متعدد الأبعاد</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-amber-50 text-amber-700 p-3 rounded-lg w-full">
                  <AlertCircle className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {categoryRadarData.length > 0 && categoryRadarData.some(c => c.sales > 0)
                      ? getCategoryMultiDimensionalAnalysisInsight(categoryRadarData)
                      : 'أضف المزيد من المنتجات والفواتير لرؤية التحليل متعدد الأبعاد للأقسام.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  أداء العلامات التجارية
                </CardTitle>
                <CardDescription>مقارنة بين العلامات التجارية المختلفة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {brandPerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={brandPerformanceData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="المبيعات" dataKey="sales" stackId="a" fill="#8884d8" />
                      <Bar name="المنتجات" dataKey="products" stackId="a" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات كافية لعرض أداء العلامات التجارية</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <Star className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {brandPerformanceData.length > 0
                      ? getBrandPerformanceInsight(brandPerformanceData)
                      : 'أضف المزيد من المنتجات ذات علامات تجارية مختلفة وفواتير لرؤية تحليل أداء العلامات التجارية.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  العلاقة بين السعر والمبيعات
                </CardTitle>
                <CardDescription>تحليل تأثير سعر المنتج على المبيعات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {priceVsSalesData.length > 0 && priceVsSalesData.some(item => item.sales > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis type="number" dataKey="price" name="السعر" unit=" ج.م" />
                      <YAxis type="number" dataKey="sales" name="المبيعات" unit=" وحدة" />
                      <ZAxis type="number" dataKey="z" range={[40, 160]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Legend />
                      <Scatter name="المنتجات" data={priceVsSalesData} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات مبيعات كافية لعرض العلاقة بين السعر والمبيعات</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {priceVsSalesData.length > 0 && priceVsSalesData.some(item => item.sales > 0)
                      ? getPriceVsSalesInsight(priceVsSalesData)
                      : 'أضف المزيد من الفواتير لمنتجات بأسعار متنوعة لرؤية تحليل العلاقة بين السعر والمبيعات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  تقييم أداء المنتجات
                </CardTitle>
                <CardDescription>تحليل شامل لأداء المنتجات وفق معايير متعددة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatAmountEn(product.revenue)} ج.م</p>
                          <p className="text-sm text-muted-foreground">{product.sales} وحدة</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>المبيعات</span>
                          <span className="font-medium">
                            {topProducts[0].sales > 0 ? Math.round((product.sales / topProducts[0].sales) * 100) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={topProducts[0].sales > 0 ? Math.round((product.sales / topProducts[0].sales) * 100) : 0} 
                          className="h-2"
                          indicatorClassName="bg-blue-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>الإيرادات</span>
                          <span className="font-medium">
                            {topRevenueProducts[0]?.revenue > 0 ? Math.round((product.revenue / topRevenueProducts[0].revenue) * 100) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={topRevenueProducts[0]?.revenue > 0 ? Math.round((product.revenue / topRevenueProducts[0].revenue) * 100) : 0} 
                          className="h-2"
                          indicatorClassName="bg-green-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>نقاط الولاء</span>
                          <span className="font-medium">
                            {Math.round((product.pointsEarned / 100) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.round((product.pointsEarned / 100) * 100)} 
                          className="h-2"
                          indicatorClassName="bg-amber-500" 
                        />
                      </div>
                    </div>
                  ))}
                  
                  {topProducts.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">لا توجد بيانات أداء متاحة، أضف منتجات وفواتير لرؤية تحليل الأداء.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">مبيعات مرتفعة</Badge>
                    <span className="mx-2">∙</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">إيرادات مرتفعة</Badge>
                    <span className="mx-2">∙</span>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">نقاط ولاء</Badge>
                  </div>
                  <Button variant="outline" size="sm">عرض كل المنتجات</Button>
                </div>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    المنتجات الأسرع نموًا
                  </CardTitle>
                  <CardDescription>المنتجات التي تظهر نموًا سريعًا</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getGrowingProducts(products, invoices).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-green-100 text-green-800">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {product.growthRate}%
                          </Badge>
                          <span>{product.name}</span>
                        </div>
                        <span className="text-sm font-medium">{product.sales} وحدة</span>
                      </div>
                    ))}
                    
                    {getGrowingProducts(products, invoices).length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">لا توجد بيانات كافية لتحديد المنتجات الأسرع نموًا</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">
                      {getGrowingProducts(products, invoices).length > 0
                        ? 'هذه المنتجات تظهر نموًا سريعًا ويجب زيادة المخزون منها.'
                        : 'أضف المزيد من الفواتير بتواريخ مختلفة لتحليل نمو المنتجات.'}
                    </p>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    المنتجات الأقل مبيعًا
                  </CardTitle>
                  <CardDescription>المنتجات التي تحتاج لتعزيز مبيعاتها</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getLowSellingProducts(products, invoices).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 border-red-200 text-red-800">
                            فقط {product.sales} وحدة
                          </Badge>
                          <span>{product.name}</span>
                        </div>
                        <span className="text-sm font-medium">{formatAmountEn(product.revenue)} ج.م</span>
                      </div>
                    ))}
                    
                    {getLowSellingProducts(products, invoices).length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">لا توجد منتجات منخفضة المبيعات لعرضها</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-red-50 text-red-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">
                      {getLowSellingProducts(products, invoices).length > 0
                        ? 'هذه المنتجات تحتاج لعروض ترويجية وتسويق أفضل لتعزيز مبيعاتها.'
                        : 'أضف المزيد من المنتجات والفواتير لتحليل المنتجات منخفضة المبيعات.'}
                    </p>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    المنتجات المتميزة
                  </CardTitle>
                  <CardDescription>منتجات تحقق نسبة ربح وولاء عالية</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getHighPointsProducts(products).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-purple-100 text-purple-800">
                            <Star className="h-3 w-3 mr-1" />
                            ممتاز
                          </Badge>
                          <span>{product.name}</span>
                        </div>
                        <span className="text-sm font-medium">{product.pointsEarned} نقطة</span>
                      </div>
                    ))}
                    
                    {getHighPointsProducts(products).length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">لا توجد منتجات ذات نقاط ولاء عالية</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">
                      {getHighPointsProducts(products).length > 0
                        ? 'هذه المنتجات تمنح نقاط ولاء عالية وتساهم في تحسين معدل احتفاظ العملاء.'
                        : 'أضف منتجات ذات نقاط ولاء عالية لرؤية تأثيرها على ولاء العملاء.'}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                التوصيات والرؤى التحليلية
              </CardTitle>
              <CardDescription>توصيات ذكية لتحسين أداء المنتجات والمبيعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <Target className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-medium text-blue-800">استراتيجية المخزون</h3>
                  </div>
                  <ul className="space-y-3 text-blue-700">
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                      <span>{getStockStrategyRecommendation(topProducts)}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                      <span>{getSlowMovingRecommendation(getLowSellingProducts(products, invoices))}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                      <span>وضع حد أدنى للمخزون لضمان عدم نفاد المنتجات سريعة الحركة.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <Percent className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-medium text-green-800">استراتيجية التسعير</h3>
                  </div>
                  <ul className="space-y-3 text-green-700">
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                      <span>{getPricingRecommendation(topProducts)}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                      <span>{getSlowMovingPricingRecommendation(getLowSellingProducts(products, invoices))}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                      <span>تقديم عروض حزم منتجات متكاملة لزيادة متوسط قيمة الفاتورة.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <ShoppingBag className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-lg font-medium text-purple-800">تطوير المنتجات</h3>
                  </div>
                  <ul className="space-y-3 text-purple-700">
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                      <span>{getProductDevelopmentRecommendation(categoryData)}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                      <span>{getPackagingRecommendation(categoryData)}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                      <span>تطوير خط منتجات صديق للبيئة لتلبية احتياجات شريحة متنامية من العملاء.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <Star className="h-6 w-6 text-amber-600 mr-3" />
                    <h3 className="text-lg font-medium text-amber-800">استراتيجية الولاء</h3>
                  </div>
                  <ul className="space-y-3 text-amber-700">
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-amber-500" />
                      <span>{getLoyaltyPointsRecommendation(getLowSellingProducts(products, invoices), products)}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-amber-500" />
                      <span>تقديم نقاط إضافية عند شراء منتجات من أقسام متعددة.</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-amber-500" />
                      <span>إنشاء حزم استبدال نقاط جذابة للمنتجات عالية الهامش.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-red-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-medium text-red-800">تنبيهات المنتجات</h3>
                  </div>
                  <ul className="space-y-3 text-red-700">
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                      <span>{getProductAlerts(topProducts)}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                      <span>{getSlowMovingAlerts(getLowSellingProducts(products, invoices))}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                      <span>منتجات موسمية يجب التحضير لها: منتجات العناية بالمكيف، منظفات الزجاج.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-6 w-6 text-slate-600 mr-3" />
                    <h3 className="text-lg font-medium text-slate-800">التوقيت المثالي</h3>
                  </div>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-slate-500" />
                      <span>{getTimingRecommendation(monthlyTrendData)}</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-slate-500" />
                      <span>زيادة مخزون المنتجات الموسمية قبل شهرين من بداية الموسم.</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-slate-500" />
                      <span>توقيت تقديم المنتجات الجديدة: بداية الربع لتحقيق أقصى استفادة.</span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Loading state component
const AnalyticsLoadingState = () => (
  <div className="space-y-6">
    <div className="flex justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <div>
      <Skeleton className="h-10 w-full mb-6" />
      <div className="h-80">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  </div>
);

// Helper functions to avoid large inline functions
function filterInvoicesByTimeRange(invoices: Invoice[], timeRange: string): Invoice[] {
  if (timeRange === 'all') return invoices;
  
  const now = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return invoices;
  }
  
  return invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date);
    return invoiceDate >= startDate && invoiceDate <= now;
  });
}

function calculateProductSalesData(products: Product[], invoices: Invoice[]) {
  return products.map(product => {
    // Calculate sales data for each product from invoices
    let totalSold = 0;
    let totalRevenue = 0;
    let lastSoldDate: Date | null = null;
    
    invoices.forEach(invoice => {
      const items = invoice.items || [];
      items.forEach(item => {
        if (item.productId === product.id) {
          totalSold += item.quantity;
          totalRevenue += item.totalPrice;
          
          const invoiceDate = new Date(invoice.date);
          if (!lastSoldDate || invoiceDate > lastSoldDate) {
            lastSoldDate = invoiceDate;
          }
        }
      });
    });
    
    return {
      id: product.id,
      name: product.name,
      sales: totalSold,
      revenue: totalRevenue,
      price: product.price,
      category: product.category,
      pointsEarned: product.pointsEarned,
      lastSoldDate,
      brand: product.brand || 'غير محدد'
    };
  });
}

function calculateCategoryData(products: Product[], productSalesData: any[]) {
  return Object.values(ProductCategory).map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    
    const categorySales = productSalesData
      .filter(product => product.category === category)
      .reduce((sum, product) => sum + product.sales, 0);
    
    const categoryRevenue = productSalesData
      .filter(product => product.category === category)
      .reduce((sum, product) => sum + product.revenue, 0);
    
    return {
      name: category,
      sales: categorySales,
      revenue: categoryRevenue,
      products: categoryProducts.length
    };
  });
}

function calculateBrandPerformanceData(productSalesData: any[]) {
  // Aggregate data by brand
  const brandData: Record<string, any> = {};
  
  productSalesData.forEach(product => {
    const brand = product.brand || 'غير محدد';
    
    if (!brandData[brand]) {
      brandData[brand] = {
        name: brand,
        sales: 0,
        revenue: 0,
        products: 0
      };
    }
    
    brandData[brand].sales += product.sales;
    brandData[brand].revenue += product.revenue;
    brandData[brand].products += 1;
  });
  
  // Convert to array and sort
  return Object.values(brandData)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function calculateCategoryRadarData(products: Product[], productSalesData: any[]) {
  return Object.values(ProductCategory).map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    if (categoryProducts.length === 0) {
      return {
        category,
        price: 0,
        sales: 0,
        revenue: 0,
        points: 0
      };
    }
    
    const avgPrice = categoryProducts.reduce((sum, product) => sum + product.price, 0) / categoryProducts.length;
    
    const totalSales = productSalesData
      .filter(product => product.category === category)
      .reduce((sum, product) => sum + product.sales, 0);
    
    const totalRevenue = productSalesData
      .filter(product => product.category === category)
      .reduce((sum, product) => sum + product.revenue, 0);
    
    const avgPoints = categoryProducts.reduce((sum, product) => sum + (product.pointsEarned || 0), 0) / categoryProducts.length;
    
    return {
      category,
      // Scale values for radar chart display
      price: Math.min(100, avgPrice > 0 ? (avgPrice / 5) : 0),
      sales: Math.min(100, totalSales > 0 ? (totalSales / 10) : 0),
      revenue: Math.min(100, totalRevenue > 0 ? (totalRevenue / 1000) : 0),
      points: Math.min(100, avgPoints > 0 ? (avgPoints * 5) : 0)
    };
  });
}

function calculateMonthlyTrendData(invoices: Invoice[], products: Product[]) {
  if (invoices.length === 0) return [];
  
  // Group invoices by month
  const monthlyData: Record<string, { sales: number; revenue: number }> = {};
  
  // Sort invoices by date
  const sortedInvoices = [...invoices].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Process only if we have invoices
  if (sortedInvoices.length > 0) {
    // Process each invoice
    sortedInvoices.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(date);
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          sales: 0,
          revenue: 0,
          name: monthName
        };
      }
      
      // Sum up sales quantities and revenue
      const items = invoice.items || [];
      items.forEach(item => {
        monthlyData[monthKey].sales += item.quantity;
        monthlyData[monthKey].revenue += item.totalPrice;
      });
    });
    
    // Convert to array for the chart
    return Object.keys(monthlyData)
      .sort()
      .slice(-6) // Last 6 months
      .map(key => ({
        name: monthlyData[key].name,
        sales: monthlyData[key].sales,
        revenue: monthlyData[key].revenue
      }));
  }
  
  return [];
}

function calculateGrowthRate(invoices: Invoice[], type: 'sales' | 'revenue'): string {
  if (invoices.length === 0) return '+0%';
  
  // Get current and previous periods
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  // Current period invoices
  const currentPeriodInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate >= oneMonthAgo && invDate <= now;
  });
  
  // Previous period invoices
  const previousPeriodInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate >= twoMonthsAgo && invDate < oneMonthAgo;
  });
  
  // Calculate totals for current and previous periods
  let currentTotal = 0;
  let previousTotal = 0;
  
  if (type === 'sales') {
    currentPeriodInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        currentTotal += item.quantity;
      });
    });
    
    previousPeriodInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        previousTotal += item.quantity;
      });
    });
  } else {
    currentTotal = currentPeriodInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    previousTotal = previousPeriodInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  }
  
  // Calculate growth rate
  if (previousTotal === 0) return currentTotal > 0 ? '+100%' : '+0%';
  
  const growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;
  const sign = growthRate >= 0 ? '+' : '';
  return `${sign}${Math.round(growthRate)}%`;
}

function calculateAverageGrowth(invoices: Invoice[], products: Product[]): string {
  if (invoices.length === 0) return '+0%';
  
  // Get current and previous periods
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  // Calculate average unit price for current and previous periods
  let currentTotalRevenue = 0;
  let currentTotalQuantity = 0;
  let previousTotalRevenue = 0;
  let previousTotalQuantity = 0;
  
  // Current period
  const currentPeriodInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate >= oneMonthAgo && invDate <= now;
  });
  
  currentPeriodInvoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      currentTotalRevenue += item.totalPrice;
      currentTotalQuantity += item.quantity;
    });
  });
  
  // Previous period
  const previousPeriodInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    return invDate >= twoMonthsAgo && invDate < oneMonthAgo;
  });
  
  previousPeriodInvoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      previousTotalRevenue += item.totalPrice;
      previousTotalQuantity += item.quantity;
    });
  });
  
  // Calculate average unit prices
  const currentAvgPrice = currentTotalQuantity > 0 ? currentTotalRevenue / currentTotalQuantity : 0;
  const previousAvgPrice = previousTotalQuantity > 0 ? previousTotalRevenue / previousTotalQuantity : 0;
  
  // Calculate growth rate
  if (previousAvgPrice === 0) return currentAvgPrice > 0 ? '+100%' : '+0%';
  
  const growthRate = ((currentAvgPrice - previousAvgPrice) / previousAvgPrice) * 100;
  const sign = growthRate >= 0 ? '+' : '';
  return `${sign}${Math.round(growthRate)}%`;
}

// Helper functions for insights
function getMonthlyTrendInsight(monthlyTrendData: any[]): string {
  if (monthlyTrendData.length < 2) return 'قم بإضافة المزيد من الفواتير لعرض تحليل الاتجاهات الشهرية.';
  
  const lastMonth = monthlyTrendData[monthlyTrendData.length - 1];
  const previousMonth = monthlyTrendData[monthlyTrendData.length - 2];
  
  if (lastMonth.sales > previousMonth.sales) {
    return `لوحظ ارتفاع في المبيعات خلال شهر ${lastMonth.name}، يُنصح بزيادة المخزون للشهر القادم.`;
  } else {
    return `لوحظ انخفاض في المبيعات خلال شهر ${lastMonth.name}، يمكن تعزيز المبيعات من خلال عروض ترويجية.`;
  }
}

function getCategoryDistributionInsight(categoryData: any[]): string {
  if (categoryData.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  // Find top and bottom categories
  const sortedCategories = [...categoryData].sort((a, b) => b.sales - a.sales);
  const topCategory = sortedCategories[0];
  const bottomCategory = sortedCategories[sortedCategories.length - 1];
  
  if (topCategory && bottomCategory) {
    return `قسم ${topCategory.name} هو الأكثر مبيعًا، بينما قسم ${bottomCategory.name} يحتاج تعزيز.`;
  }
  
  return 'قم بإضافة المزيد من المنتجات والفواتير لرؤية توصيات أكثر دقة.';
}

function getCategoryMultiDimensionalAnalysisInsight(categoryRadarData: any[]): string {
  if (categoryRadarData.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  // Find category with highest sales
  const highestSalesCategory = [...categoryRadarData].sort((a, b) => b.sales - a.sales)[0];
  
  // Find category with highest points
  const highestPointsCategory = [...categoryRadarData].sort((a, b) => b.points - a.points)[0];
  
  if (highestSalesCategory && highestPointsCategory) {
    return `منتجات ${highestSalesCategory.category} تتمتع بمبيعات عالية، بينما منتجات ${highestPointsCategory.category} عالية في النقاط.`;
  }
  
  return 'أضف المزيد من المنتجات المتنوعة والفواتير لرؤية تحليلات أكثر عمقًا.';
}

function getBrandPerformanceInsight(brandData: any[]): string {
  if (brandData.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  // Find top brand
  const topBrand = brandData[0];
  
  if (topBrand) {
    return `العلامة التجارية "${topBrand.name}" هي الأكثر مبيعًا ويمكن التفاوض على شروط أفضل معها.`;
  }
  
  return 'أضف المزيد من المنتجات لعلامات تجارية مختلفة لرؤية تحليلات أكثر دقة.';
}

function getPriceVsSalesInsight(priceVsSalesData: any[]): string {
  if (priceVsSalesData.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  // Group products by price ranges
  const lowPrice = priceVsSalesData.filter(p => p.price < 50);
  const midPrice = priceVsSalesData.filter(p => p.price >= 50 && p.price <= 100);
  const highPrice = priceVsSalesData.filter(p => p.price > 100);
  
  // Calculate average sales for each price range
  const lowPriceAvgSales = lowPrice.length > 0 ? lowPrice.reduce((sum, p) => sum + p.sales, 0) / lowPrice.length : 0;
  const midPriceAvgSales = midPrice.length > 0 ? midPrice.reduce((sum, p) => sum + p.sales, 0) / midPrice.length : 0;
  const highPriceAvgSales = highPrice.length > 0 ? highPrice.reduce((sum, p) => sum + p.sales, 0) / highPrice.length : 0;
  
  // Find the price range with highest average sales
  const priceRanges = [
    { range: 'المنخفض (أقل من 50 ج.م)', sales: lowPriceAvgSales },
    { range: 'المتوسط (50-100 ج.م)', sales: midPriceAvgSales },
    { range: 'المرتفع (أكثر من 100 ج.م)', sales: highPriceAvgSales }
  ];
  
  const bestSellingRange = priceRanges.sort((a, b) => b.sales - a.sales)[0];
  
  if (bestSellingRange && bestSellingRange.sales > 0) {
    return `المنتجات ذات السعر ${bestSellingRange.range} تحقق أعلى معدلات مبيعات. يُنصح بمراجعة تسعير المنتجات الأخرى.`;
  }
  
  return 'أضف المزيد من الفواتير لمنتجات بأسعار متنوعة لرؤية نمط العلاقة بين السعر والمبيعات.';
}

// Utility functions for performance tab
function getGrowingProducts(products: Product[], invoices: Invoice[]) {
  if (products.length === 0 || invoices.length === 0) return [];
  
  // Get current and previous periods
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  // Calculate sales for each product in both periods
  const productGrowth: Record<string, any> = {};
  
  // Process invoices
  invoices.forEach(invoice => {
    const invDate = new Date(invoice.date);
    const isPreviousPeriod = invDate >= twoMonthsAgo && invDate < oneMonthAgo;
    const isCurrentPeriod = invDate >= oneMonthAgo && invDate <= now;
    
    if (!isPreviousPeriod && !isCurrentPeriod) return;
    
    (invoice.items || []).forEach(item => {
      if (!productGrowth[item.productId]) {
        const product = products.find(p => p.id === item.productId);
        productGrowth[item.productId] = {
          id: item.productId,
          name: product ? product.name : 'منتج غير معروف',
          currentSales: 0,
          previousSales: 0
        };
      }
      
      if (isCurrentPeriod) {
        productGrowth[item.productId].currentSales += item.quantity;
      } else if (isPreviousPeriod) {
        productGrowth[item.productId].previousSales += item.quantity;
      }
    });
  });
  
  // Calculate growth rates
  const growingProducts = Object.values(productGrowth)
    .filter(product => product.previousSales > 0 || product.currentSales > 0)
    .map(product => {
      // Handle case where previous sales were zero
      let growthRate = 0;
      if (product.previousSales === 0) {
        growthRate = product.currentSales > 0 ? 100 : 0;
      } else {
        growthRate = Math.round(((product.currentSales - product.previousSales) / product.previousSales) * 100);
      }
      
      return {
        ...product,
        growthRate,
        sales: product.currentSales
      };
    })
    .filter(product => product.growthRate > 0)
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 3);
  
  return growingProducts;
}

function getLowSellingProducts(products: Product[], invoices: Invoice[]) {
  // Get product sales data
  const productSales: Record<string, number> = {};
  
  // Calculate total sales for each product
  invoices.forEach(invoice => {
    (invoice.items || []).forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = 0;
      }
      productSales[item.productId] += item.quantity;
    });
  });
  
  // Identify products with low sales
  const lowSellingProducts = products
    .map(product => {
      const sales = productSales[product.id] || 0;
      const revenue = sales * product.price;
      return {
        ...product,
        sales,
        revenue
      };
    })
    .filter(product => productSales[product.id] !== undefined) // Only consider products that have been sold
    .sort((a, b) => a.sales - b.sales)
    .slice(0, 3);
  
  return lowSellingProducts;
}

function getHighPointsProducts(products: Product[]) {
  // Sort products by points earned
  return [...products]
    .sort((a, b) => (b.pointsEarned || 0) - (a.pointsEarned || 0))
    .slice(0, 3);
}

// Recommendation functions
function getStockStrategyRecommendation(topProducts: any[]): string {
  if (topProducts.length === 0) return 'قم بإضافة منتجات وفواتير لرؤية توصيات المخزون.';
  
  const firstProduct = topProducts[0];
  if (firstProduct) {
    return `زيادة مخزون ${firstProduct.name} بنسبة 25% استعدادًا لموسم الذروة.`;
  }
  
  return 'زيادة مخزون المنتجات الأكثر مبيعًا بنسبة 25% استعدادًا لموسم الذروة.';
}

function getSlowMovingRecommendation(lowSellingProducts: any[]): string {
  if (lowSellingProducts.length === 0) return 'تخفيض مخزون المنتجات بطيئة الحركة لتقليل تكاليف التخزين.';
  
  const firstProduct = lowSellingProducts[0];
  if (firstProduct) {
    return `تخفيض مخزون ${firstProduct.name} وغيرها من المنتجات بطيئة الحركة لتقليل تكاليف التخزين.`;
  }
  
  return 'تخفيض مخزون المنتجات بطيئة الحركة لتقليل تكاليف التخزين.';
}

function getPricingRecommendation(topProducts: any[]): string {
  if (topProducts.length === 0) return 'راجع استراتيجية التسعير بناءً على أداء المنتجات.';
  
  const firstProduct = topProducts[0];
  if (firstProduct) {
    return `يمكن زيادة سعر ${firstProduct.name} بنسبة 5-10% نظرًا للطلب المرتفع عليه.`;
  }
  
  return 'رفع أسعار المنتجات ذات الطلب المرتفع والتي تتمتع بمرونة سعرية منخفضة.';
}

function getSlowMovingPricingRecommendation(lowSellingProducts: any[]): string {
  if (lowSellingProducts.length === 0) return 'خفض أسعار المنتجات بطيئة الحركة بنسبة 10-15% لتحفيز المبيعات.';
  
  const firstProduct = lowSellingProducts[0];
  if (firstProduct) {
    return `خفض سعر ${firstProduct.name} بنسبة 10-15% لتحفيز المبيعات.`;
  }
  
  return 'خفض أسعار المنتجات بطيئة الحركة بنسبة 10-15% لتحفيز المبيعات.';
}

function getProductDevelopmentRecommendation(categoryData: any[]): string {
  if (categoryData.length === 0) return 'إضافة منتجات جديدة لتلبية طلب السوق.';
  
  // Find category with lowest sales
  const lowestSalesCategory = [...categoryData]
    .filter(category => category.products > 0) // Only consider categories with products
    .sort((a, b) => a.sales - b.sales)[0];
  
  if (lowestSalesCategory) {
    return `إضافة منتجات جديدة إلى قسم ${lowestSalesCategory.name} لتلبية طلب السوق.`;
  }
  
  return 'إضافة منتجات جديدة لتلبية طلب السوق.';
}

function getPackagingRecommendation(categoryData: any[]): string {
  if (categoryData.length === 0) return 'تحسين تغليف المنتجات لزيادة جاذبيتها.';
  
  // Find middle performing category
  const sortedCategories = [...categoryData]
    .filter(category => category.products > 0) // Only consider categories with products
    .sort((a, b) => b.sales - a.sales);
  
  const middleCategory = sortedCategories[Math.floor(sortedCategories.length / 2)];
  
  if (middleCategory) {
    return `تحسين تغليف منتجات ${middleCategory.name} لزيادة جاذبيتها.`;
  }
  
  return 'تحسين تغليف المنتجات لزيادة جاذبيتها.';
}

function getLoyaltyPointsRecommendation(lowSellingProducts: any[], products: Product[]): string {
  if (lowSellingProducts.length === 0) return 'زيادة نقاط الولاء على المنتجات الأقل مبيعًا لتحفيز الطلب.';
  
  const firstProduct = lowSellingProducts[0];
  if (firstProduct) {
    return `زيادة نقاط الولاء على ${firstProduct.name} من ${firstProduct.pointsEarned} إلى ${firstProduct.pointsEarned + 10} نقطة لتحفيز الطلب.`;
  }
  
  return 'زيادة نقاط الولاء على المنتجات الأقل مبيعًا لتحفيز الطلب.';
}

function getProductAlerts(topProducts: any[]): string {
  if (topProducts.length === 0) return 'لا توجد تنبيهات للمنتجات حاليًا.';
  
  const firstTwoProducts = topProducts.slice(0, 2).map(p => p.name).join('، ');
  
  if (firstTwoProducts) {
    return `منتجات في خطر نفاد المخزون: ${firstTwoProducts}.`;
  }
  
  return 'منتجات في خطر نفاد المخزون: تأكد من توفر المنتجات الأكثر مبيعًا.';
}

function getSlowMovingAlerts(lowSellingProducts: any[]): string {
  if (lowSellingProducts.length === 0) return 'لا توجد منتجات بطيئة الحركة تحتاج لعروض حاليًا.';
  
  const firstTwoProducts = lowSellingProducts.slice(0, 2).map(p => p.name).join('، ');
  
  if (firstTwoProducts) {
    return `منتجات بطيئة الحركة تحتاج إلى عروض: ${firstTwoProducts}.`;
  }
  
  return 'منتجات بطيئة الحركة تحتاج إلى عروض ترويجية لتحسين مبيعاتها.';
}

function getTimingRecommendation(monthlyTrendData: any[]): string {
  if (monthlyTrendData.length < 2) return 'أفضل وقت للعروض الترويجية: بداية الشهر عندما يكون الإقبال أعلى.';
  
  // Find month with highest sales
  const highestSalesMonth = [...monthlyTrendData].sort((a, b) => b.sales - a.sales)[0];
  
  if (highestSalesMonth) {
    return `أفضل وقت للعروض الترويجية: خلال شهر ${highestSalesMonth.name} حيث يكون الإقبال أعلى.`;
  }
  
  return 'أفضل وقت للعروض الترويجية: بداية الشهر عندما يكون الإقبال أعلى.';
}

export default ProductAnalytics;
