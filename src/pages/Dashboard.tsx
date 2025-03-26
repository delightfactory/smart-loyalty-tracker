
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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
import { Button } from '@/components/ui/button';
import { Package, Users, FileText, CreditCard, TrendingUp } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { ProductCategory, Invoice, Customer } from '@/lib/types';
import { products, customers, invoices } from '@/lib/data';
import { cn } from '@/lib/utils';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0
  });

  // Calculate category distribution for pie chart
  const categoryData = Object.values(ProductCategory).map(category => {
    const productCount = products.filter(p => p.category === category).length;
    return {
      name: category,
      value: productCount
    };
  });

  // Calculate monthly revenue data
  const monthlyRevenueData = [
    { name: 'يناير', revenue: 12500 },
    { name: 'فبراير', revenue: 15000 },
    { name: 'مارس', revenue: 18000 },
    { name: 'أبريل', revenue: 16500 },
    { name: 'مايو', revenue: 19500 },
    { name: 'يونيو', revenue: 22000 }
  ];

  // Calculate top customers by points
  const topCustomers = [...customers]
    .sort((a, b) => b.pointsEarned - a.pointsEarned)
    .slice(0, 5);

  // Calculate recent invoices
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate points redemption rate data
  const pointsRedemptionData = [
    { name: 'نقاط مكتسبة', value: customers.reduce((sum, c) => sum + c.pointsEarned, 0) },
    { name: 'نقاط مستبدلة', value: customers.reduce((sum, c) => sum + c.pointsRedeemed, 0) }
  ];

  useEffect(() => {
    // Calculate dashboard summary
    setSummary({
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalPointsIssued: invoices.reduce((sum, inv) => sum + inv.pointsEarned, 0),
      totalPointsRedeemed: invoices.reduce((sum, inv) => sum + inv.pointsRedeemed, 0)
    });
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };

  return (
    <PageContainer title="لوحة التحكم" subtitle="نظرة عامة على أداء النظام">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Summary Cards */}
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المنتجات</p>
                <h3 className="text-2xl font-bold mt-2">{summary.totalProducts}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي العملاء</p>
                <h3 className="text-2xl font-bold mt-2">{summary.totalCustomers}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الفواتير</p>
                <h3 className="text-2xl font-bold mt-2">{summary.totalInvoices}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <h3 className="text-2xl font-bold mt-2">{formatCurrency(summary.totalRevenue)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Category Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>توزيع المنتجات حسب الأقسام</CardTitle>
            <CardDescription>عدد المنتجات في كل قسم</CardDescription>
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
                <Tooltip formatter={(value) => [value, 'عدد المنتجات']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
            <CardDescription>إجمالي الإيرادات لكل شهر</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'الإيرادات']} />
                <Legend />
                <Bar dataKey="revenue" name="الإيرادات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Top Customers */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>أفضل العملاء</CardTitle>
            <CardDescription>بناءً على النقاط المكتسبة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-white",
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-400" : 
                      index === 2 ? "bg-amber-700" : "bg-gray-200"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.businessType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{customer.pointsEarned} نقطة</p>
                    <p className="text-sm text-muted-foreground">المستوى {customer.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>أحدث الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                return (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{customer?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                      <p className={cn(
                        "text-sm",
                        invoice.status === 'مدفوع' ? "text-green-500" : 
                        invoice.status === 'متأخر' ? "text-red-500" : "text-amber-500"
                      )}>
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Points Redemption */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>معدل استبدال النقاط</CardTitle>
            <CardDescription>النقاط المكتسبة مقابل المستبدلة</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pointsRedemptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip formatter={(value) => [value, 'النقاط']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>معدل نمو المبيعات</CardTitle>
            <CardDescription>تحليل نمو المبيعات على مدار الوقت</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyRevenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'الإيرادات']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="الإيرادات" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
