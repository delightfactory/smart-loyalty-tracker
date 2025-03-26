
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCategory } from '@/lib/types';
import { calculateCategoryDistribution, getOnTimePaymentRate } from '@/lib/calculations';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface CustomerAnalyticsProps {
  customerId: string;
}

const CustomerAnalytics = ({ customerId }: CustomerAnalyticsProps) => {
  // Get category distribution
  const categoryDistribution = calculateCategoryDistribution(customerId);
  
  // Get on-time payment rate
  const onTimePaymentRate = getOnTimePaymentRate(customerId);
  
  // Format category distribution data for pie chart
  const categoryData = Object.entries(categoryDistribution)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value
    }));
  
  // Format monthly purchase data
  const monthlyPurchaseData = [
    { name: 'يناير', amount: 1200 },
    { name: 'فبراير', amount: 1800 },
    { name: 'مارس', amount: 1400 },
    { name: 'أبريل', amount: 2200 },
    { name: 'مايو', amount: 1900 },
    { name: 'يونيو', amount: 2500 }
  ];
  
  // Format retention data
  const retentionData = [
    { month: 'يناير', rate: 85 },
    { month: 'فبراير', rate: 90 },
    { month: 'مارس', rate: 88 },
    { month: 'أبريل', rate: 95 },
    { month: 'مايو', rate: 93 },
    { month: 'يونيو', rate: 97 }
  ];
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>توزيع المشتريات حسب الأقسام</CardTitle>
          <CardDescription>النسبة المئوية للإنفاق في كل قسم</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'النسبة المئوية']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>تطور المشتريات الشهرية</CardTitle>
          <CardDescription>قيمة المشتريات على مدار الأشهر</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPurchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'قيمة المشتريات']} />
              <Legend />
              <Bar dataKey="amount" name="قيمة المشتريات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>معدل الالتزام بالسداد</CardTitle>
          <CardDescription>نسبة السداد في الوقت المحدد</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative h-40 w-40">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={cn(
                    "stroke-current",
                    onTimePaymentRate >= 75 ? "text-green-500" :
                    onTimePaymentRate >= 50 ? "text-amber-500" : "text-red-500"
                  )}
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${onTimePaymentRate * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{onTimePaymentRate.toFixed(0)}%</span>
              </div>
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              {onTimePaymentRate >= 75 ? "معدل التزام ممتاز بالسداد" :
               onTimePaymentRate >= 50 ? "معدل التزام متوسط بالسداد" : "معدل التزام ضعيف بالسداد"}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>معدل الولاء والاحتفاظ</CardTitle>
          <CardDescription>نسبة استمرارية العميل شهرياً</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'معدل الولاء']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rate" 
                name="معدل الولاء" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>توصيات وتحليلات متقدمة</CardTitle>
          <CardDescription>تحليلات ذكية بناءً على سلوك العميل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-700 mb-2">توصيات المنتجات</h3>
              <ul className="space-y-2 text-blue-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>زيادة عروض منتجات العناية بالمحرك</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>اقتراح منتجات العناية بالإطارات</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>تقديم خصومات على منتجات التابلوه</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-700 mb-2">فرص زيادة المبيعات</h3>
              <ul className="space-y-2 text-green-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>عروض حزم منتجات متكاملة</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>مضاعفة النقاط في أوقات معينة</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>عروض حصرية للعملاء المميزين</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-amber-700 mb-2">سلوك الشراء</h3>
              <ul className="space-y-2 text-amber-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>يفضل الشراء في بداية الشهر</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>متوسط قيمة الفاتورة في زيادة مستمرة</span>
                </li>
                <li className="flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  <span>انخفاض طلبات فئة العناية الخارجية</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-700 mb-2">فرص التحسين</h3>
              <ul className="space-y-2 text-purple-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>تحسين معدل السداد في الوقت المحدد</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>زيادة تنوع المنتجات المشتراة</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>تشجيع استبدال النقاط لزيادة الولاء</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
