import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Users, 
  Calendar, 
  PieChart as PieChartIcon,
  Map,
  Building, 
  ShoppingBag,
  Wallet,
  TrendingUp,
  Clock,
  Star,
  Lightbulb
} from 'lucide-react';
import { Customer } from '@/lib/types';
import { addDays, format, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CustomerAnalyticsProps {
  customers: any[];
  invoices: any[];
  products: any[];
  isLoading: boolean;
}

const CustomerAnalytics = ({ customers, invoices, products, isLoading }: CustomerAnalyticsProps) => {
  const [activeMetric, setActiveMetric] = useState<string>('activity');

  // Calculate inactivity stats
  const calculateInactivityStats = () => {
    const now = new Date();
    const criticalInactive = customers.filter(customer => {
      if (!customer.lastActive) return true;
      const lastActiveDate = new Date(customer.lastActive);
      const daysDiff = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 90;
    }).length;
    
    const warningInactive = customers.filter(customer => {
      if (!customer.lastActive) return false;
      const lastActiveDate = new Date(customer.lastActive);
      const daysDiff = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 30 && daysDiff <= 90;
    }).length;
    
    const recentInactive = customers.filter(customer => {
      if (!customer.lastActive) return false;
      const lastActiveDate = new Date(customer.lastActive);
      const daysDiff = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff < 30 && daysDiff > 7;
    }).length;
    
    return {
      critical: criticalInactive,
      warning: warningInactive,
      recent: recentInactive,
      total: customers.length,
      percentage: customers.length > 0 
        ? Math.round(((criticalInactive + warningInactive + recentInactive) / customers.length) * 100)
        : 0
    };
  };

  const inactivityStats = calculateInactivityStats();
  
  // حساب توزيع العملاء حسب المناطق
  const calculateRegionDistribution = () => {
    const regions: { [key: string]: number } = {};
    let unknownCount = 0;

    customers.forEach(customer => {
      const city = customer.city || 'غير محدد';
      
      if (city === 'غير محدد') {
        unknownCount++;
      } else {
        regions[city] = (regions[city] || 0) + 1;
      }
    });

    // تحويل البيانات إلى تنسيق مناسب للرسم البياني
    const data = Object.entries(regions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // إضافة العملاء ذوي المناطق غير المحددة
    if (unknownCount > 0) {
      data.push({ name: 'غير محدد', value: unknownCount });
    }

    return data;
  };

  // حساب توزيع العملاء حسب نوع النشاط التجاري
  const calculateBusinessTypeDistribution = () => {
    const types: { [key: string]: number } = {};
    let unknownCount = 0;

    customers.forEach(customer => {
      const type = customer.businessType || 'غير محدد';
      
      if (type === 'غير محدد') {
        unknownCount++;
      } else {
        types[type] = (types[type] || 0) + 1;
      }
    });

    // تحويل البيانات إلى تنسيق مناسب للرسم البياني
    const data = Object.entries(types)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // إضافة العملاء ذوي الأنواع غير المحددة
    if (unknownCount > 0) {
      data.push({ name: 'غير محدد', value: unknownCount });
    }

    return data;
  };

  // حساب توزيع نشاط العملاء
  const calculateActivityDistribution = () => {
    const now = new Date();
    const veryActive = [];
    const active = [];
    const moderate = [];
    const inactive = [];
    const lost = [];

    for (const customer of customers) {
      const lastActive = customer.lastActive ? new Date(customer.lastActive) : null;
      
      if (!lastActive) {
        lost.push(customer);
        continue;
      }
      
      const daysSinceLastActive = differenceInDays(now, lastActive);
      
      if (daysSinceLastActive <= 7) {
        veryActive.push(customer);
      } else if (daysSinceLastActive <= 30) {
        active.push(customer);
      } else if (daysSinceLastActive <= 60) {
        moderate.push(customer);
      } else if (daysSinceLastActive <= 90) {
        inactive.push(customer);
      } else {
        lost.push(customer);
      }
    }

    return [
      { name: 'نشط جداً', value: veryActive.length, color: '#10B981' },
      { name: 'نشط', value: active.length, color: '#6366F1' },
      { name: 'متوسط', value: moderate.length, color: '#F59E0B' },
      { name: 'غير نشط', value: inactive.length, color: '#EF4444' },
      { name: 'مفقود', value: lost.length, color: '#6B7280' }
    ];
  };

  // حساب اتجاهات نشاط العملاء
  const calculateActivityTrends = () => {
    const now = new Date();
    const sixMonthsAgo = addDays(now, -180);
    const monthNames = [];
    
    // إنشاء أسماء الأشهر الستة الماضية
    for (let i = 0; i < 6; i++) {
      const date = addDays(now, -i * 30);
      monthNames.unshift(format(date, 'MMM', { locale: ar }));
    }
    
    // تهيئة مصفوفة البيانات
    const data = monthNames.map(month => ({
      name: month,
      active: 0,
      inactive: 0,
      lost: 0
    }));
    
    // حساب أعداد العملاء لكل فئة شهرياً
    customers.forEach(customer => {
      // Skip if no lastActive or invalid date
      if (!customer.lastActive) return;
      const lastActiveDate = new Date(customer.lastActive);
      if (isNaN(lastActiveDate.getTime())) return;
      const daysSinceLastActive = differenceInDays(now, lastActiveDate);
      if (!Number.isFinite(daysSinceLastActive)) return;
      // Skip future dates or dates older than six months
      if (daysSinceLastActive < 0 || daysSinceLastActive > 180) return;
      const monthIndex = Math.floor(daysSinceLastActive / 30);
      if (monthIndex < 0 || monthIndex >= data.length) return;
      if (daysSinceLastActive <= 30) {
        data[monthIndex].active += 1;
      } else if (daysSinceLastActive <= 90) {
        data[monthIndex].inactive += 1;
      } else {
        data[monthIndex].lost += 1;
      }
    });
    
    return data;
  };

  // حساب مقارنة بين حجم المشتريات والنشاط
  const calculatePurchaseVsActivity = () => {
    return customers.map(customer => {
      const totalSpent = customer.totalSpent || 0;
      const lastActive = customer.lastActive ? new Date(customer.lastActive) : null;
      const daysSinceActive = lastActive ? differenceInDays(new Date(), lastActive) : 365;
      
      return {
        name: customer.name,
        totalSpent,
        daysSinceActive,
        z: Math.max(5, Math.sqrt(totalSpent) / 10) // حجم النقطة في الرسم البياني
      };
    });
  };

  const regionData = calculateRegionDistribution();
  const businessTypeData = calculateBusinessTypeDistribution();
  const activityDistribution = calculateActivityDistribution();
  const activityTrends = calculateActivityTrends();
  const purchaseVsActivity = calculatePurchaseVsActivity();
  
  // الألوان للرسومات البيانية
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
  
  // معلومات أساسية عن العملاء
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(customer => {
    const lastActive = customer.lastActive ? new Date(customer.lastActive) : null;
    return lastActive && differenceInDays(new Date(), lastActive) <= 30;
  }).length;
  const inactiveCustomers = customers.filter(customer => {
    const lastActive = customer.lastActive ? new Date(customer.lastActive) : null;
    return !lastActive || differenceInDays(new Date(), lastActive) > 30;
  }).length;
  
  const activePercentage = totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0;
  const inactivePercentage = totalCustomers > 0 ? Math.round((inactiveCustomers / totalCustomers) * 100) : 0;
  
  // حساب متوسط قيمة العميل وأعلى قيمة
  const avgCustomerValue = totalCustomers > 0 
    ? customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0) / totalCustomers
    : 0;
  
  const topCustomerValue = customers.length > 0
    ? Math.max(...customers.map(customer => customer.totalSpent || 0))
    : 0;
  
  return (
    <div className="space-y-6">
      {/* ملخص التحليلات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-300">إجمالي العملاء</p>
                <h2 className="text-2xl font-bold">{totalCustomers}</h2>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <Badge variant="outline" className="font-normal">
                100%
              </Badge>
              <span className="text-muted-foreground dark:text-gray-300">من قاعدة العملاء</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-300">العملاء النشطون</p>
                <h2 className="text-2xl font-bold">{activeCustomers}</h2>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground dark:text-gray-300">نسبة النشاط</span>
                <span>{activePercentage}%</span>
              </div>
              <Progress value={activePercentage} className="h-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-300">العملاء غير النشطين</p>
                <h2 className="text-2xl font-bold">{inactiveCustomers}</h2>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground dark:text-gray-300">نسبة عدم النشاط</span>
                <span>{inactivePercentage}%</span>
              </div>
              <Progress value={inactivePercentage} className="h-1" indicatorClassName="bg-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-300">متوسط قيمة العميل</p>
                <h2 className="text-2xl font-bold">{avgCustomerValue.toFixed(0)} ج.م</h2>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <Star className="h-3 w-3 mr-1" />
                أعلى قيمة: {topCustomerValue.toFixed(0)} ج.م
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تبويبات التحليلات المتقدمة */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="activity" onClick={() => setActiveMetric('activity')}>
            <Activity className="h-4 w-4 ml-2" />
            تحليل النشاط
          </TabsTrigger>
          <TabsTrigger value="geography" onClick={() => setActiveMetric('geography')}>
            <Map className="h-4 w-4 ml-2" />
            التوزيع الجغرافي
          </TabsTrigger>
          <TabsTrigger value="business" onClick={() => setActiveMetric('business')}>
            <Building className="h-4 w-4 ml-2" />
            نوع النشاط التجاري
          </TabsTrigger>
          <TabsTrigger value="purchases" onClick={() => setActiveMetric('purchases')}>
            <ShoppingBag className="h-4 w-4 ml-2" />
            تحليل المشتريات
          </TabsTrigger>
        </TabsList>

        {/* تحليل النشاط */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 ml-2" />
                  توزيع نشاط العملاء
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-300">
                  تقسيم العملاء حسب فترة نشاطهم الأخير
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {activityDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {activityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} عميل`, 'العدد']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground dark:text-gray-300">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 ml-2" />
                  اتجاهات نشاط العملاء
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-300">
                  تطور نشاط العملاء على مدار الأشهر الستة الماضية
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {activityTrends.some(item => item.active > 0 || item.inactive > 0 || item.lost > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activityTrends}
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
                      <Bar name="نشط" dataKey="active" stackId="a" fill="#10B981" />
                      <Bar name="غير نشط" dataKey="inactive" stackId="a" fill="#F59E0B" />
                      <Bar name="مفقود" dataKey="lost" stackId="a" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground dark:text-gray-300">لا توجد بيانات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 ml-2" />
                التحليل الزمني لنشاط العملاء
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-gray-300">
                مقارنة بين أنماط نشاط العملاء على مدار الأشهر الستة الماضية
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {activityTrends.some(item => item.active > 0 || item.inactive > 0 || item.lost > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityTrends}
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
                    <Line name="نشط" type="monotone" dataKey="active" stroke="#10B981" activeDot={{ r: 8 }} />
                    <Line name="غير نشط" type="monotone" dataKey="inactive" stroke="#F59E0B" />
                    <Line name="مفقود" type="monotone" dataKey="lost" stroke="#EF4444" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground dark:text-gray-300">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* التوزيع الجغرافي */}
        <TabsContent value="geography" className="space-y-6 mt-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="h-5 w-5 ml-2" />
                توزيع العملاء حسب المناطق
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-gray-300">
                تقسيم العملاء حسب المناطق الجغرافية
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {regionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip formatter={(value) => [`${value} عميل`, 'العدد']} />
                    <Legend />
                    <Bar name="عدد العملاء" dataKey="value" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground dark:text-gray-300">لا توجد بيانات جغرافية كافية للعرض</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* نوع النشاط التجاري */}
        <TabsContent value="business" className="space-y-6 mt-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 ml-2" />
                توزيع العملاء حسب نوع النشاط
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-gray-300">
                تقسيم العملاء حسب نوع النشاط التجاري
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {businessTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={businessTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {businessTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} عميل`, 'العدد']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground dark:text-gray-300">لا توجد بيانات كافية عن أنواع النشاط التجاري</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تحليل المشتريات */}
        <TabsContent value="purchases" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 ml-2" />
                  مقارنة بين المشتريات والنشاط
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-300">
                  العلاقة بين إجمالي المشتريات والوقت منذ آخر نشاط
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {purchaseVsActivity.length > 0 && purchaseVsActivity.some(item => item.totalSpent > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="daysSinceActive" 
                        name="الأيام منذ آخر نشاط" 
                        unit=" يوم" 
                      />
                      <YAxis 
                        type="number" 
                        dataKey="totalSpent" 
                        name="إجمالي المشتريات" 
                        unit=" ج.م" 
                      />
                      <ZAxis type="number" dataKey="z" range={[50, 400]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => {
                          if (name === 'الأيام منذ آخر نشاط') return [`${value} يوم`, name];
                          if (name === 'إجمالي المشتريات') return [`${value} ج.م`, name];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Scatter 
                        name="العميل" 
                        data={purchaseVsActivity} 
                        fill="#8884d8" 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground dark:text-gray-300">لا توجد بيانات مشتريات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 ml-2" />
                  تحليل قيمة العملاء
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-300">
                  تقسيم العملاء حسب إجمالي مشترياتهم
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-8">
                  {/* تصنيف مستويات العملاء */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
                        <h4>عملاء VIP</h4>
                      </div>
                      <span className="text-sm font-semibold">
                        {customers.filter(c => (c.totalSpent || 0) > 10000).length} عميل
                      </span>
                    </div>
                    <Progress 
                      value={
                        totalCustomers > 0 
                          ? (customers.filter(c => (c.totalSpent || 0) > 10000).length / totalCustomers) * 100
                          : 0
                      } 
                      className="h-2" 
                      indicatorClassName="bg-purple-600"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-300">
                      العملاء الذين أنفقوا أكثر من 10,000 ج.م
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">ذهبي</Badge>
                        <h4>عملاء ذهبيون</h4>
                      </div>
                      <span className="text-sm font-semibold">
                        {customers.filter(c => (c.totalSpent || 0) > 5000 && (c.totalSpent || 0) <= 10000).length} عميل
                      </span>
                    </div>
                    <Progress 
                      value={
                        totalCustomers > 0 
                          ? (customers.filter(c => (c.totalSpent || 0) > 5000 && (c.totalSpent || 0) <= 10000).length / totalCustomers) * 100
                          : 0
                      } 
                      className="h-2" 
                      indicatorClassName="bg-blue-500"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-300">
                      العملاء الذين أنفقوا بين 5,000 و 10,000 ج.م
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">فضي</Badge>
                        <h4>عملاء فضيون</h4>
                      </div>
                      <span className="text-sm font-semibold">
                        {customers.filter(c => (c.totalSpent || 0) > 1000 && (c.totalSpent || 0) <= 5000).length} عميل
                      </span>
                    </div>
                    <Progress 
                      value={
                        totalCustomers > 0 
                          ? (customers.filter(c => (c.totalSpent || 0) > 1000 && (c.totalSpent || 0) <= 5000).length / totalCustomers) * 100
                          : 0
                      } 
                      className="h-2" 
                      indicatorClassName="bg-green-500"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-300">
                      العملاء الذين أنفقوا بين 1,000 و 5,000 ج.م
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-800">عادي</Badge>
                        <h4>عملاء عاديون</h4>
                      </div>
                      <span className="text-sm font-semibold">
                        {customers.filter(c => (c.totalSpent || 0) <= 1000).length} عميل
                      </span>
                    </div>
                    <Progress 
                      value={
                        totalCustomers > 0 
                          ? (customers.filter(c => (c.totalSpent || 0) <= 1000).length / totalCustomers) * 100
                          : 0
                      } 
                      className="h-2"
                      indicatorClassName="bg-gray-400" 
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-300">
                      العملاء الذين أنفقوا أقل من 1,000 ج.م
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* خلاصة التوصيات والنصائح */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 ml-2" />
            توصيات ونصائح بناءً على التحليلات
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-gray-300">
            اقتراحات لتحسين التفاعل مع العملاء ورفع معدلات النشاط
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* نصائح متعلقة بالنشاط */}
            <div className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-md">
              <h4 className="font-semibold mb-2 flex items-center">
                <Activity className="h-4 w-4 ml-2" />
                تحسين نشاط العملاء
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>هناك {inactivityStats.warning} عميل معرض للضياع - يجب التواصل معهم في أقرب وقت</li>
                <li>تطبيق حملة ترويجية خاصة للعملاء الذين لم يتفاعلوا منذ أكثر من 60 يوم</li>
                <li>إرسال رسائل تذكير للعملاء الذين لم يتفاعلوا منذ أكثر من 30 يوم</li>
              </ul>
            </div>
            
            {/* نصائح متعلقة بالتوزيع الجغرافي */}
            {regionData.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-md">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Map className="h-4 w-4 ml-2" />
                  استهداف المناطق الجغرافية
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>المنطقة الأكثر نشاطاً هي {regionData[0]?.name} - يمكن إطلاق مبادرات جديدة فيها</li>
                  <li>المناطق ذات الكثافة المنخفضة تحتاج إلى حملات تسويقية مخصصة</li>
                  <li>استكشاف فرص نمو في المناطق المجاورة للمناطق النشطة</li>
                </ul>
              </div>
            )}
            
            {/* نصائح متعلقة بنوع النشاط التجاري */}
            {businessTypeData.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-4 rounded-md">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Building className="h-4 w-4 ml-2" />
                  استهداف أنواع النشاط التجاري
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>نشاط {businessTypeData[0]?.name} يمثل النسبة الأكبر - تخصيص عروض مناسبة له</li>
                  <li>تطوير منتجات وخدمات تلبي احتياجات الأنشطة التجارية الأكثر تمثيلاً</li>
                  <li>البحث عن فرص توسع في قطاعات أنشطة جديدة</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
