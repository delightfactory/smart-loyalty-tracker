import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import SmartSearch from '@/components/search/SmartSearch';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InvoiceStatus } from '@/lib/types';
import { products, customers, invoices, payments } from '@/lib/data';

// Import dashboard components
import DashboardCards from '@/components/dashboard/DashboardCards';
import InvoiceStatusChart from '@/components/dashboard/InvoiceStatusChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import CustomersList from '@/components/dashboard/CustomersList';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import PointsRedemptionChart from '@/components/dashboard/PointsRedemptionChart';

// Utility functions
// 1. Filter data by date range
const filterDataByTimeRange = (data: any[], timeRange: string, dateField: string = 'date') => {
  const now = new Date();
  const startDate = new Date();

  switch (timeRange) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
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
      // For 'all', return all data
      return data;
  }

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= now;
  });
};

// 2. Format currency
const formatCurrency = (value: number) => {
  return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalOverdue: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0
  });

  // Filter invoices based on time range
  const filteredInvoices = filterDataByTimeRange(invoices, timeRange);
  const filteredPayments = filterDataByTimeRange(payments, timeRange);

  // Calculate monthly revenue data
  const getMonthlyRevenueData = () => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const monthlyData = Array(12).fill(0).map((_, index) => ({
      name: months[index],
      revenue: 0,
      invoiceCount: 0
    }));
    
    filteredInvoices.forEach(invoice => {
      const month = new Date(invoice.date).getMonth();
      monthlyData[month].revenue += invoice.totalAmount;
      monthlyData[month].invoiceCount += 1;
    });
    
    // Only include months with data
    return monthlyData.filter(month => month.invoiceCount > 0);
  };

  const monthlyRevenueData = getMonthlyRevenueData();

  // Calculate top customers by points
  const topCustomers = [...customers]
    .sort((a, b) => b.pointsEarned - a.pointsEarned)
    .slice(0, 5);

  // Calculate recent invoices
  const recentInvoices = [...filteredInvoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate points redemption rate data
  const pointsRedemptionData = [
    { name: 'نقاط مكتسبة', value: customers.reduce((sum, c) => sum + c.pointsEarned, 0) },
    { name: 'نقاط مستبدلة', value: customers.reduce((sum, c) => sum + c.pointsRedeemed, 0) }
  ];

  // Calculate payment trend data
  const getPaymentTrendData = () => {
    const paymentsByDay: Record<string, { date: string, total: number }> = {};
    
    filteredPayments.forEach(payment => {
      if (payment.type === 'payment') {
        const dateStr = new Date(payment.date).toISOString().split('T')[0];
        if (!paymentsByDay[dateStr]) {
          paymentsByDay[dateStr] = {
            date: dateStr,
            total: 0
          };
        }
        paymentsByDay[dateStr].total += payment.amount;
      }
    });
    
    return Object.values(paymentsByDay)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        name: new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        revenue: item.total
      }))
      .slice(-15); // Last 15 days with data
  };

  const paymentTrendData = getPaymentTrendData();

  // Calculate overdue amount data
  const overdueData = filteredInvoices
    .filter(inv => inv.status === InvoiceStatus.OVERDUE)
    .map(inv => ({
      id: inv.id,
      customer: customers.find(c => c.id === inv.customerId)?.name || 'غير معروف',
      customerId: inv.customerId,
      amount: inv.totalAmount,
      date: new Date(inv.date).toLocaleDateString('ar-EG'),
      dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ar-EG') : 'غير محدد',
      daysOverdue: inv.dueDate ? Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24)) : 0
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  useEffect(() => {
    // Calculate dashboard summary based on filtered data
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = filteredInvoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOverdue = filteredInvoices
      .filter(inv => inv.status === InvoiceStatus.OVERDUE)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    setSummary({
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalInvoices: filteredInvoices.length,
      totalRevenue,
      totalPaid,
      totalOverdue,
      totalPointsIssued: filteredInvoices.reduce((sum, inv) => sum + inv.pointsEarned, 0),
      totalPointsRedeemed: filteredInvoices.reduce((sum, inv) => sum + inv.pointsRedeemed, 0)
    });
  }, [filteredInvoices]);

  return (
    <PageContainer title="لوحة التحكم" subtitle="نظرة عامة على أداء النظام">
      <div className="flex justify-between items-center mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="sales">المبيعات</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="ml-2 h-4 w-4" />
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفترات</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="quarter">آخر 3 شهور</SelectItem>
              <SelectItem value="year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>

          <SmartSearch className="w-[300px]" placeholder="بحث عن عميل أو منتج..." />
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="overview">
          {/* Summary Cards */}
          <DashboardCards 
            summary={summary} 
            view="overview" 
            formatCurrency={formatCurrency}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Invoice Status */}
            <InvoiceStatusChart />

            {/* Monthly Revenue */}
            <RevenueChart 
              data={monthlyRevenueData} 
              formatCurrency={formatCurrency}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Top Customers */}
            <CustomersList customers={topCustomers} />

            {/* Recent Invoices */}
            <RecentInvoices 
              invoices={recentInvoices} 
              customers={customers} 
              formatCurrency={formatCurrency} 
            />

            {/* Points Redemption */}
            <PointsRedemptionChart />
          </div>
        </TabsContent>

        <TabsContent value="sales">
          {/* Sales Cards */}
          <DashboardCards 
            summary={summary} 
            view="sales" 
            formatCurrency={formatCurrency}
          />

          <div className="grid grid-cols-1 gap-6">
            {/* Revenue Trends */}
            <RevenueChart 
              data={monthlyRevenueData} 
              formatCurrency={formatCurrency} 
              type="area"
              title="تطور الإيرادات"
              description="التغير في حجم المبيعات على مدار الوقت"
            />

            {/* Overdue Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>الفواتير المتأخرة</CardTitle>
                <CardDescription>قائمة الفواتير المتأخرة عن موعد السداد</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-2">رقم الفاتورة</th>
                          <th className="text-right p-2">العميل</th>
                          <th className="text-right p-2">المبلغ</th>
                          <th className="text-right p-2">تاريخ الفاتورة</th>
                          <th className="text-right p-2">تاريخ الاستحقاق</th>
                          <th className="text-right p-2">أيام التأخير</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overdueData.map((invoice, index) => (
                          <tr key={invoice.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="p-2">{invoice.id}</td>
                            <td className="p-2">{invoice.customer}</td>
                            <td className="p-2">{formatCurrency(invoice.amount)}</td>
                            <td className="p-2">{invoice.date}</td>
                            <td className="p-2">{invoice.dueDate}</td>
                            <td className="p-2 text-red-500">{invoice.daysOverdue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد فواتير متأخرة حالياً
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Trends */}
            <RevenueChart 
              data={paymentTrendData} 
              formatCurrency={formatCurrency}
              title="تفاصيل المدفوعات"
              description="تطور المدفوعات على مدار الوقت"
            />
          </div>
        </TabsContent>

        <TabsContent value="customers">
          {/* Customer analysis components will be here */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Will be populated with charts and tables */}
            <Card>
              <CardHeader>
                <CardTitle>قريباً</CardTitle>
                <CardDescription>سيتم إضافة تحليلات العملاء هنا</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="py-10 text-center text-muted-foreground">
                  يتم حالياً تطوير هذا القسم ليعرض تحليلات مفصلة عن العملاء.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          {/* Products analysis components will be here */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Will be populated with charts and tables */}
            <Card>
              <CardHeader>
                <CardTitle>قريباً</CardTitle>
                <CardDescription>سيتم إضافة تحليلات المنتجات هنا</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="py-10 text-center text-muted-foreground">
                  يتم حالياً تطوير هذا القسم ليعرض تحليلات مفصلة عن المنتجات.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Dashboard;
