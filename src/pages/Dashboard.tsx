import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Calendar as DateRangeCalendar } from '@/components/ui/calendar';
import SmartSearch from '@/components/search/SmartSearch';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InvoiceStatus } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { productsService, customersService, invoicesService, paymentsService, redemptionsService } from '@/services/database';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { ar, enGB } from 'date-fns/locale';

// Import dashboard components
import DashboardCards from '@/components/dashboard/DashboardCards';
import InvoiceStatusChart from '@/components/dashboard/InvoiceStatusChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import CustomersList from '@/components/dashboard/CustomersList';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import PointsRedemptionChart from '@/components/dashboard/PointsRedemptionChart';
import CustomerStatsCards from '@/components/dashboard/CustomerStatsCards';
import NewCustomersChart from '@/components/dashboard/NewCustomersChart';
import TopCustomersTable from '@/components/dashboard/TopCustomersTable';
import InactiveCustomersTable from '@/components/dashboard/InactiveCustomersTable';
import CategoryDiversityTable from '@/components/dashboard/CategoryDiversityTable';
import CustomerFrequencyTable from '@/components/dashboard/CustomerFrequencyTable';
import CustomerRFMTable from '@/components/dashboard/CustomerRFMTable';
import ChurnRiskTable from '@/components/dashboard/ChurnRiskTable';
import BusinessTypeDistribution from '@/components/dashboard/BusinessTypeDistribution';
import TopRedemptionCustomersTable from '@/components/dashboard/TopRedemptionCustomersTable';
import ProductsDashboard from '@/components/dashboard/ProductsDashboard';
import PointsSummary from '@/components/dashboard/PointsSummary';
import OutstandingSummaryCards from '@/components/customer/OutstandingSummaryCards';

// Utility functions
// 1. Filter data by date range
const filterDataByTimeRange = (data: any[], timeRange: string, dateField: string = 'date') => {
  if (!data || data.length === 0) return [];
  
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

// تعريف نوع الفلترة الزمنية بشكل صريح
type TimeRangeType = 'all' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// 1. إنشاء Context لتوفير البيانات المفلترة لكل المكونات الفرعية
import { createContext } from 'react';

export const DashboardTimeFilterContext = createContext({
  filteredPayments: [],
  filteredCustomers: [],
  filteredInvoices: [],
  filteredRedemptions: []
});

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('all');
  const [customRange, setCustomRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isMounted, setIsMounted] = useState(false);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalOverdue: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    totalManualAdded: 0,
    totalManualDeducted: 0
  });


// ... بقية الاستيرادات هنا ...

useEffect(() => {
    setIsMounted(true);
    // دالة async لجلب وتجميع النقاط اليدوية
    const fetchManualPoints = async () => {
      try {
        const { data: allPointsHistory, error } = await supabase
          .from('points_history')
          .select('*');
        let totalManualAdded = 0;
        let totalManualDeducted = 0;
        if (!error && Array.isArray(allPointsHistory)) {
          totalManualAdded = allPointsHistory
            .filter((entry) => entry.type === 'manual_add')
            .reduce((sum, entry) => sum + (entry.points || 0), 0);
          totalManualDeducted = allPointsHistory
            .filter((entry) => entry.type === 'manual_deduct')
            .reduce((sum, entry) => sum + Math.abs(entry.points || 0), 0);
        }
        setSummary(prev => ({
          ...prev,
          totalManualAdded,
          totalManualDeducted
        }));
      } catch (e) {
        console.error('Error aggregating manual points:', e);
      }
    };
    fetchManualPoints();
    return () => setIsMounted(false);
  }, []);

  // Fetch data from API
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        return await productsService.getAll();
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    enabled: isMounted
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        return await customersService.getAll();
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
    },
    enabled: isMounted
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        return await invoicesService.getAll();
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    },
    enabled: isMounted
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      try {
        return await paymentsService.getAll();
      } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
      }
    },
    enabled: isMounted
  });

  const { data: redemptionsData, isLoading: isRedemptionsLoading } = useQuery({
    queryKey: ['redemptions'],
    queryFn: async () => {
      try {
        return await redemptionsService.getAll();
      } catch (error) {
        console.error('Error fetching redemptions:', error);
        return [];
      }
    },
    enabled: isMounted
  });

  const products = productsData || [];
  const customers = customersData || [];
  const invoices = invoicesData || [];
  const payments = paymentsData || [];
  const redemptions = redemptionsData || [];

  // Handle time range change
  const handleTimeRangeChange = (value: TimeRangeType) => {
    setTimeRange(value);
    if (value !== 'custom') {
      setCustomRange({ from: undefined, to: undefined });
    }
  };

  // Filter data with custom range if selected
  const getFilteredData = (data: any[], dateField: string = 'date') => {
    if (timeRange === 'custom' && customRange.from && customRange.to) {
      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= customRange.from && itemDate <= customRange.to;
      });
    }
    return filterDataByTimeRange(data, timeRange, dateField);
  };

  // Filter invoices based on time range
  const filteredInvoices = getFilteredData(invoices, 'date');
  const filteredPayments = getFilteredData(payments, 'date');
  const filteredRedemptions = getFilteredData(redemptions, 'date');

  // Calculate monthly revenue data
  const getMonthlyRevenueData = () => {
    if (!filteredInvoices.length) return [];
    
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
  const topCustomers = customers.length
    ? [...customers]
        .sort((a, b) => b.pointsEarned - a.pointsEarned)
        .slice(0, 5)
    : [];

  // Calculate recent invoices
  const recentInvoices = filteredInvoices.length
    ? [...filteredInvoices]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : [];

  // Calculate payment trend data
  const getPaymentTrendData = () => {
    if (!filteredPayments.length) return [];
    
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
  const overdueData = filteredInvoices.length
    ? filteredInvoices
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
        .sort((a, b) => b.daysOverdue - a.daysOverdue)
    : [];

  useEffect(() => {
    // Calculate dashboard summary based on filtered data
    if (isMounted) {
      const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalPaid = filteredInvoices
        .filter(inv => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalOverdue = filteredInvoices
        .filter(inv => inv.status === InvoiceStatus.OVERDUE)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      // تلخيص النقاط اليدوية بشكل فعلي
      let totalManualAdded = 0;
      let totalManualDeducted = 0;
      // سيتم جلب وتجميع النقاط اليدوية في دالة async منفصلة داخل useEffect

      setSummary({
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalInvoices: filteredInvoices.length,
        totalRevenue,
        totalPaid,
        totalOverdue,
        totalPointsIssued: filteredInvoices.reduce((sum, inv) => sum + (inv.pointsEarned || 0), 0),
        totalPointsRedeemed: filteredRedemptions.reduce((sum, redemption) => sum + (redemption.totalPointsRedeemed || 0), 0),
        totalManualAdded,
        totalManualDeducted
      });
    }
  }, [filteredInvoices, products, customers, filteredRedemptions, isMounted]);

  // Calculate total redeemed points from all filtered redemptions
  const totalPointsRedeemed = filteredRedemptions.reduce((sum, redemption) => sum + (redemption.totalPointsRedeemed || 0), 0);

  // حل نهائي لمقارنة union type وتجنب خطأ TypeScript
  const isNotAll = timeRange !== 'all';
  const isCustomActive = timeRange === 'custom' && !!customRange.from && !!customRange.to;
  const isCustomFilterActive = isNotAll || isCustomActive;

  // زر إعادة تعيين الفلتر
  const handleResetFilter = () => {
    setTimeRange('all');
    setCustomRange({ from: undefined, to: undefined });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DashboardTimeFilterContext.Provider value={{
      filteredPayments,
      filteredCustomers: customers, // يمكنك لاحقًا تطبيق الفلترة الزمنية لو احتجت
      filteredInvoices,
      filteredRedemptions
    }}>
      <PageContainer title="لوحة التحكم" subtitle="نظرة عامة وتحليلات عن الأداء">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="sales">المبيعات</TabsTrigger>
              <TabsTrigger value="customers">العملاء</TabsTrigger>
              <TabsTrigger value="products">المنتجات</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="تصفية حسب المدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفترات</SelectItem>
                  <SelectItem value="week">الأسبوع الأخير</SelectItem>
                  <SelectItem value="month">الشهر الأخير</SelectItem>
                  <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
              {timeRange === 'custom' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center px-3 py-2 border rounded-md bg-background text-sm"
                      type="button"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {customRange.from && customRange.to
                        ? `${customRange.from.toLocaleDateString('en-GB')} - ${customRange.to.toLocaleDateString('en-GB')}`
                        : 'اختر الفترة'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <DateRangeCalendar
                      mode="range"
                      selected={customRange}
                      onSelect={setCustomRange}
                      numberOfMonths={2}
                      locale={enGB}
                    />
                  </PopoverContent>
                </Popover>
              )}
              {isCustomFilterActive && (
                <button
                  onClick={handleResetFilter}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 text-sm"
                  type="button"
                >
                  إعادة تعيين الفلتر
                </button>
              )}
            </div>
          </div>
          <TabsContent value="overview">
            {/* ملخص النظام: بطاقات + رسوم بيانية عامة */}
            <PointsSummary
              totalEarned={summary.totalPointsIssued}
              totalRedeemed={totalPointsRedeemed}
              totalManualAdded={summary.totalManualAdded}
              totalManualDeducted={summary.totalManualDeducted}
              totalRemaining={customers.reduce((sum, c) => sum + (Number(c.currentPoints) || 0), 0)}
              loading={!isMounted || isRedemptionsLoading}
            />
            <DashboardCards
              summary={{
                totalProducts: products.length,
                totalCustomers: customers.length,
                totalInvoices: invoices.length,
                totalRevenue: invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0),
                totalOverdue: customers.reduce((sum, c) => sum + (Number(c.creditBalance) || 0), 0),
                totalPointsIssued: customers.reduce((sum, c) => sum + (Number(c.pointsEarned) || 0), 0),
                totalPointsRedeemed: customers.reduce((sum, c) => sum + (Number(c.pointsRedeemed) || 0), 0),
              }}
              view="overview"
              formatCurrency={formatCurrency}
            />
            <OutstandingSummaryCards
              customers={customers}
              invoices={invoices} // تمرير جميع الفواتير بدون أي تصفية زمنية
              loading={!customers.length || !invoices.length}
            />
            <InvoiceStatusChart data={undefined} />
            <RevenueChart data={[]} formatCurrency={formatCurrency} />
            <PointsRedemptionChart data={undefined} />
          </TabsContent>
          <TabsContent value="sales">
            {/* تحليلات المبيعات */}
            <DashboardCards summary={summary} view="sales" formatCurrency={formatCurrency} />
            <div className="grid grid-cols-1 gap-6">
              <RevenueChart data={monthlyRevenueData} formatCurrency={formatCurrency} type="area" title="تطور الإيرادات" description="التغير في حجم المبيعات على مدار الوقت" />
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
                    <div className="text-center py-8 text-muted-foreground">لا توجد فواتير متأخرة حالياً</div>
                  )}
                </CardContent>
              </Card>
              <RevenueChart data={paymentTrendData} formatCurrency={formatCurrency} title="تفاصيل المدفوعات" description="تطور المدفوعات على مدار الوقت" />
            </div>
          </TabsContent>
          <TabsContent value="customers">
            {/* تحليلات العملاء */}
            <CustomerStatsCards
              totalCustomers={(() => {
                if (!customers.length) return 0;
                return customers.length;
              })()}
              newCustomers={(() => {
                if (!customers.length) return 0;
                const now = new Date();
                // استخدم created_at فقط لأنه هو الحقل الموجود في قاعدة البيانات
                return customers.filter((c) => {
                  const createdAt = c.created_at ? new Date(c.created_at) : null;
                  return createdAt && createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                }).length;
              })()}
              activeCustomers={(() => {
                if (!customers.length || !invoices.length) return 0;
                const now = new Date();
                return customers.filter((c) => {
                  const lastInvoice = invoices.filter((inv) => inv.customerId === c.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  if (!lastInvoice) return false;
                  const lastDate = new Date(lastInvoice.date);
                  const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                  return diffDays <= 60;
                }).length;
              })()}
              inactiveCustomers={(() => {
                if (!customers.length || !invoices.length) return 0;
                const now = new Date();
                return customers.filter((c) => {
                  const lastInvoice = invoices.filter((inv) => inv.customerId === c.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  if (!lastInvoice) return true;
                  const lastDate = new Date(lastInvoice.date);
                  const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                  return diffDays > 60;
                }).length;
              })()}
              loading={!customers.length || !invoices.length}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewCustomersChart customers={getFilteredData(customers, 'created_at')} />
              <TopCustomersTable customers={getFilteredData(customers, 'created_at')} invoices={getFilteredData(invoices)} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <InactiveCustomersTable customers={getFilteredData(customers, 'created_at')} invoices={getFilteredData(invoices)} />
              <CategoryDiversityTable customers={getFilteredData(customers, 'created_at')} invoices={getFilteredData(invoices)} products={getFilteredData(products)} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <CustomerFrequencyTable customers={getFilteredData(customers, 'created_at')} invoices={getFilteredData(invoices)} />
              <CustomerRFMTable customers={getFilteredData(customers, 'created_at')} invoices={getFilteredData(invoices)} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ChurnRiskTable customers={getFilteredData(customers, 'created_at')} invoices={getFilteredData(invoices)} thresholdDays={90} />
              <BusinessTypeDistribution customers={getFilteredData(customers, 'created_at')} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <TopRedemptionCustomersTable customers={getFilteredData(customers, 'created_at')} />
              {/* يمكن إضافة تحليلات أخرى هنا */}
            </div>
          </TabsContent>
          <TabsContent value="products">
            <ProductsDashboard products={getFilteredData(products)} invoices={getFilteredData(invoices)} />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </DashboardTimeFilterContext.Provider>
  );
};

export default Dashboard;
