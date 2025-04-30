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
                    <Lightbulb className="
