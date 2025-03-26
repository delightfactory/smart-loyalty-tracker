
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
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
  ResponsiveContainer 
} from 'recharts';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { products, customers, invoices } from '@/lib/data';
import { ProductCategory, InvoiceStatus } from '@/lib/types';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdvancedAnalytics = () => {
  // Calculate product categories distribution
  const categoryCount: Record<ProductCategory, number> = {
    [ProductCategory.ENGINE_CARE]: 0,
    [ProductCategory.EXTERIOR_CARE]: 0,
    [ProductCategory.TIRE_CARE]: 0,
    [ProductCategory.DASHBOARD_CARE]: 0,
    [ProductCategory.INTERIOR_CARE]: 0,
  };
  
  products.forEach(product => {
    categoryCount[product.category]++;
  });
  
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  }));
  
  // Calculate invoice status distribution
  const statusCount: Record<InvoiceStatus, number> = {
    [InvoiceStatus.PAID]: 0,
    [InvoiceStatus.UNPAID]: 0,
    [InvoiceStatus.PARTIALLY_PAID]: 0,
    [InvoiceStatus.OVERDUE]: 0,
  };
  
  invoices.forEach(invoice => {
    statusCount[invoice.status]++;
  });
  
  const statusData = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value
  }));
  
  // Monthly sales data
  const monthlySalesData = [
    { month: 'يناير', sales: 12000, customers: 15 },
    { month: 'فبراير', sales: 18000, customers: 18 },
    { month: 'مارس', sales: 14000, customers: 16 },
    { month: 'أبريل', sales: 22000, customers: 25 },
    { month: 'مايو', sales: 19000, customers: 22 },
    { month: 'يونيو', sales: 25000, customers: 28 }
  ];
  
  // Points usage data
  const pointsData = [
    { month: 'يناير', earned: 2500, redeemed: 1000 },
    { month: 'فبراير', earned: 3000, redeemed: 1200 },
    { month: 'مارس', earned: 2800, redeemed: 1500 },
    { month: 'أبريل', earned: 3500, redeemed: 1800 },
    { month: 'مايو', earned: 3200, redeemed: 2000 },
    { month: 'يونيو', earned: 4000, redeemed: 2500 }
  ];
  
  // Customer retention rate
  const retentionData = [
    { month: 'يناير', rate: 85 },
    { month: 'فبراير', rate: 90 },
    { month: 'مارس', rate: 88 },
    { month: 'أبريل', rate: 95 },
    { month: 'مايو', rate: 93 },
    { month: 'يونيو', rate: 97 }
  ];
  
  // Calculate key metrics
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);
  const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const paymentRate = (paidInvoices.length / Math.max(invoices.length, 1)) * 100;
  
  const totalPoints = invoices.reduce((sum, invoice) => sum + invoice.pointsEarned, 0);
  const totalRedeemedPoints = invoices.reduce((sum, invoice) => sum + invoice.pointsRedeemed, 0);
  const pointsRedemptionRate = (totalRedeemedPoints / Math.max(totalPoints, 1)) * 100;
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+15%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">مقارنة بالشهر السابق</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">معدل السداد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{paymentRate.toFixed(1)}%</div>
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+5%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">نسبة الفواتير المسددة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">معدل استبدال النقاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{pointsRedemptionRate.toFixed(1)}%</div>
              <div className="flex items-center text-amber-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+2%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">نسبة النقاط المستبدلة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">متوسط قيمة الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue / Math.max(invoices.length, 1))}
              </div>
              <div className="flex items-center text-red-600">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span className="text-sm">-3%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">انخفاض عن الشهر السابق</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
            <CardDescription>تطور المبيعات والعملاء على مدار 6 أشهر</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => [
                  name === 'sales' ? formatCurrency(value as number) : value,
                  name === 'sales' ? 'المبيعات' : 'عدد العملاء'
                ]} />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="sales" 
                  name="المبيعات" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="customers" 
                  name="العملاء" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>نظام النقاط</CardTitle>
            <CardDescription>مقارنة بين النقاط المكتسبة والمستبدلة</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earned" name="النقاط المكتسبة" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="redeemed" name="النقاط المستبدلة" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>حالة الفواتير</CardTitle>
            <CardDescription>توزيع الفواتير حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>معدل الاحتفاظ بالعملاء</CardTitle>
            <CardDescription>نسبة العملاء المستمرين</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'معدل الاحتفاظ']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  name="معدل الاحتفاظ" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>رؤى وتوصيات تحليلية</CardTitle>
          <CardDescription>تحليلات ذكية ونصائح لتحسين الأداء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Growth Opportunities */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center text-green-700">
                <TrendingUp className="h-5 w-5 mr-2" />
                فرص النمو
              </h3>
              <Separator />
              <ul className="space-y-3 text-sm">
                <li className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-700">زيادة مبيعات فئة العناية بالإطارات</p>
                  <p className="text-green-600 mt-1">
                    فئة العناية بالإطارات تظهر نمواً بنسبة 15% وفرصة كبيرة للتوسع.
                  </p>
                </li>
                <li className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-700">استهداف معارض السيارات</p>
                  <p className="text-green-600 mt-1">
                    معارض السيارات تظهر أعلى معدل للشراء والولاء بين أنواع العملاء.
                  </p>
                </li>
                <li className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-700">حملات تسويقية للنقاط</p>
                  <p className="text-green-600 mt-1">
                    زيادة معدل استبدال النقاط يؤدي لزيادة الولاء ومعدل الشراء المتكرر.
                  </p>
                </li>
              </ul>
            </div>
            
            {/* Risk Areas */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center text-red-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                مناطق الخطر
              </h3>
              <Separator />
              <ul className="space-y-3 text-sm">
                <li className="bg-red-50 p-3 rounded-lg">
                  <p className="font-medium text-red-700">نسبة الفواتير المتأخرة مرتفعة</p>
                  <p className="text-red-600 mt-1">
                    12% من الفواتير متأخرة السداد، مما يؤثر على التدفق النقدي.
                  </p>
                </li>
                <li className="bg-red-50 p-3 rounded-lg">
                  <p className="font-medium text-red-700">انخفاض مبيعات العناية الداخلية</p>
                  <p className="text-red-600 mt-1">
                    انخفاض بنسبة 8% في مبيعات منتجات العناية الداخلية في الربع الأخير.
                  </p>
                </li>
                <li className="bg-red-50 p-3 rounded-lg">
                  <p className="font-medium text-red-700">ارتفاع متوسط الديون</p>
                  <p className="text-red-600 mt-1">
                    ارتفاع متوسط الديون للعملاء بنسبة 15% مقارنة بالفترة السابقة.
                  </p>
                </li>
              </ul>
            </div>
            
            {/* Strategic Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center text-blue-700">
                <TrendingUp className="h-5 w-5 mr-2" />
                توصيات استراتيجية
              </h3>
              <Separator />
              <ul className="space-y-3 text-sm">
                <li className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-700">عروض حزم متكاملة</p>
                  <p className="text-blue-600 mt-1">
                    إطلاق حزم منتجات متكاملة لزيادة متوسط قيمة الفاتورة بنسبة 20%.
                  </p>
                </li>
                <li className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-700">برنامج ولاء محسن</p>
                  <p className="text-blue-600 mt-1">
                    تحسين برنامج النقاط لزيادة معدل الاستبدال وجذب عملاء جدد.
                  </p>
                </li>
                <li className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-700">استراتيجية تحصيل محسنة</p>
                  <p className="text-blue-600 mt-1">
                    تطبيق آليات تحصيل أكثر كفاءة لتقليل نسبة الفواتير المتأخرة.
                  </p>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Current Trends */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">الاتجاهات الحالية</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">نمو مراكز الخدمة 🔥</Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">استخدام متزايد للنقاط ⭐</Badge>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">زيادة الطلب على منتجات المحرك 🚗</Badge>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">تحول للمنتجات عالية الجودة 💎</Badge>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200">انخفاض متوسط مدة السداد ⏱️</Badge>
              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">زيادة معدل العملاء الجدد 📈</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
