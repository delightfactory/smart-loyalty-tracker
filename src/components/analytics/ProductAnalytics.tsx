
import { useState } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
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
import { products, invoices, getProductById } from '@/lib/data';
import { ProductCategory } from '@/lib/types';

const ProductAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  
  // Get product sales data
  const productSalesData = filteredProducts.map(product => {
    const productSales = invoices.reduce((total, invoice) => {
      const item = invoice.items.find(item => item.productId === product.id);
      return total + (item ? item.quantity : 0);
    }, 0);
    
    const revenue = invoices.reduce((total, invoice) => {
      const item = invoice.items.find(item => item.productId === product.id);
      return total + (item ? item.totalPrice : 0);
    }, 0);
    
    return {
      id: product.id,
      name: product.name,
      sales: productSales,
      revenue: revenue,
      price: product.price,
      category: product.category,
      pointsEarned: product.pointsEarned,
      brand: product.brand
    };
  }).sort((a, b) => b.sales - a.sales);
  
  // Top 5 products by sales
  const topProducts = productSalesData.slice(0, 5);
  
  // Top 5 products by revenue
  const topRevenueProducts = [...productSalesData].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  
  // Category distribution
  const categoryData = Object.values(ProductCategory).map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    const categorySales = productSalesData
      .filter(product => categoryProducts.some(p => p.id === product.id))
      .reduce((sum, product) => sum + product.sales, 0);
    
    const categoryRevenue = productSalesData
      .filter(product => categoryProducts.some(p => p.id === product.id))
      .reduce((sum, product) => sum + product.revenue, 0);
    
    return {
      name: category,
      sales: categorySales,
      revenue: categoryRevenue,
      products: categoryProducts.length
    };
  });
  
  // Brand performance data
  const brandData = productSalesData.reduce((acc, product) => {
    if (!acc[product.brand]) {
      acc[product.brand] = {
        name: product.brand,
        sales: 0,
        revenue: 0,
        products: 0
      };
    }
    
    acc[product.brand].sales += product.sales;
    acc[product.brand].revenue += product.revenue;
    acc[product.brand].products += 1;
    
    return acc;
  }, {} as Record<string, { name: string, sales: number, revenue: number, products: number }>);
  
  const brandPerformanceData = Object.values(brandData)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
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
  const categoryRadarData = Object.values(ProductCategory).map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    const avgPrice = categoryProducts.reduce((sum, product) => sum + product.price, 0) / categoryProducts.length;
    const totalSales = productSalesData
      .filter(product => categoryProducts.some(p => p.id === product.id))
      .reduce((sum, product) => sum + product.sales, 0);
    const totalRevenue = productSalesData
      .filter(product => categoryProducts.some(p => p.id === product.id))
      .reduce((sum, product) => sum + product.revenue, 0);
    const avgPoints = categoryProducts.reduce((sum, product) => sum + product.pointsEarned, 0) / categoryProducts.length;
    
    return {
      category,
      price: Math.min(100, avgPrice), // Scale for radar chart
      sales: Math.min(100, totalSales / 5), // Scale for radar chart
      revenue: Math.min(100, totalRevenue / 500), // Scale for radar chart
      points: Math.min(100, avgPoints * 2) // Scale for radar chart
    };
  });
  
  // Monthly sales trend (mock data for visualization)
  const monthlyTrendData = [
    { name: 'يناير', sales: 65, revenue: 9800 },
    { name: 'فبراير', sales: 59, revenue: 8900 },
    { name: 'مارس', sales: 80, revenue: 12000 },
    { name: 'أبريل', sales: 81, revenue: 12200 },
    { name: 'مايو', sales: 56, revenue: 8400 },
    { name: 'يونيو', sales: 55, revenue: 8300 },
    { name: 'يوليو', sales: 40, revenue: 6000 }
  ];
  
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
              <div className="text-2xl font-bold">{totalSales} وحدة</div>
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +15%
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
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('ar-EG')} ج.م</div>
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                +18%
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
                {(totalRevenue / totalSales).toFixed(1)} ج.م
              </div>
              <Badge variant="outline" className="text-amber-500">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                +3%
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
                                  <div>{payload[0].payload.revenue.toLocaleString('ar-EG')} ج.م</div>
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">تمثل هذه المنتجات 60% من إجمالي المبيعات. يُنصح بضمان توفرها دائمًا.</p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRevenueProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString('ar-EG')} ج.م`}
                      labelFormatter={(label) => `المنتج: ${label}`}
                    />
                    <Legend />
                    <Bar name="الإيرادات" dataKey="revenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <TrendingUp className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">تمثل هذه المنتجات 75% من إجمالي الإيرادات. تركيز جهود التسويق عليها سيزيد الأرباح.</p>
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Clock className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">لوحظ ارتفاع في المبيعات خلال شهري مارس وأبريل، ويُنصح بزيادة المخزون قبل هذه الفترة.</p>
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
                  <PieChart className="h-5 w-5 mr-2" />
                  توزيع المبيعات حسب الأقسام
                </CardTitle>
                <CardDescription>نسبة مبيعات كل قسم من أقسام المنتجات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">قسم {Object.values(ProductCategory)[0]} هو الأكثر مبيعًا، بينما قسم {Object.values(ProductCategory)[4]} يحتاج تعزيز.</p>
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-amber-50 text-amber-700 p-3 rounded-lg w-full">
                  <AlertCircle className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">منتجات العناية بالمحرك تتمتع بمبيعات عالية وسعر عالٍ، بينما منتجات العناية بالتابلوه عالية في النقاط.</p>
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <Star className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">العلامة التجارية "{brandPerformanceData[0]?.name}" هي الأكثر مبيعًا ويمكن التفاوض على شروط أفضل معها.</p>
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
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">المنتجات ذات السعر المتوسط (50-100 ج.م) تحقق أعلى معدلات مبيعات. يُنصح بمراجعة تسعير المنتجات الأخرى.</p>
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
                          <p className="font-medium">{product.revenue.toLocaleString('ar-EG')} ج.م</p>
                          <p className="text-sm text-muted-foreground">{product.sales} وحدة</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>المبيعات</span>
                          <span className="font-medium">
                            {Math.round((product.sales / topProducts[0].sales) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.round((product.sales / topProducts[0].sales) * 100)} 
                          className="h-2"
                          indicatorClassName="bg-blue-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>الإيرادات</span>
                          <span className="font-medium">
                            {Math.round((product.revenue / topRevenueProducts[0].revenue) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.round((product.revenue / topRevenueProducts[0].revenue) * 100)} 
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
                    {["زيت محرك سوبر بريميوم", "ملمع إطارات", "منظف تابلوه"].map((productName, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-green-100 text-green-800">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {30 - index * 5}%
                          </Badge>
                          <span>{productName}</span>
                        </div>
                        <span className="text-sm font-medium">{150 - index * 25} وحدة</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">هذه المنتجات تظهر نموًا سريعًا ويجب زيادة المخزون منها.</p>
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
                    {["معطر داخلي فاخر", "شامبو سيارات ممتاز", "فلتر زيت"].map((productName, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 border-red-200 text-red-800">
                            فقط {10 + index * 5} وحدة
                          </Badge>
                          <span>{productName}</span>
                        </div>
                        <span className="text-sm font-medium">{(10 + index * 5) * 45} ج.م</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-red-50 text-red-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">هذه المنتجات تحتاج لعروض ترويجية وتسويق أفضل لتعزيز مبيعاتها.</p>
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
                    {["زيت محرك سوبر بريميوم", "معطر داخلي فاخر", "ملمع إطارات"].map((productName, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-purple-100 text-purple-800">
                            <Star className="h-3 w-3 mr-1" />
                            ممتاز
                          </Badge>
                          <span>{productName}</span>
                        </div>
                        <span className="text-sm font-medium">{75 - index * 15} نقطة</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">هذه المنتجات تمنح نقاط ولاء عالية وتساهم في تحسين معدل احتفاظ العملاء.</p>
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
                      <span>زيادة مخزون المنتجات الأكثر مبيعًا بنسبة 25% استعدادًا لموسم الذروة.</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                      <span>تخفيض مخزون المنتجات بطيئة الحركة لتقليل تكاليف التخزين.</span>
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
                      <span>رفع أسعار المنتجات ذات الطلب المرتفع والتي تتمتع بمرونة سعرية منخفضة.</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                      <span>خفض أسعار المنتجات بطيئة الحركة بنسبة 10-15% لتحفيز المبيعات.</span>
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
                      <span>إضافة منتجات جديدة إلى قسم {ProductCategory.DASHBOARD_CARE} لتلبية طلب السوق.</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-purple-500" />
                      <span>تحسين تغليف منتجات {ProductCategory.TIRE_CARE} لزيادة جاذبيتها.</span>
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
                      <span>زيادة نقاط الولاء على المنتجات الأقل مبيعًا لتحفيز الطلب.</span>
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
                      <span>منتجات في خطر نفاد المخزون: زيت محرك سوبر بريميوم، ملمع إطارات.</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowUpRight className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                      <span>منتجات بطيئة الحركة تحتاج إلى عروض: معطر داخلي فاخر، شامبو سيارات.</span>
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
                      <span>أفضل وقت للعروض الترويجية: بداية الشهر عندما يكون الإقبال أعلى.</span>
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

export default ProductAnalytics;
