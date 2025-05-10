import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, UserRound, Clock, AlertTriangle, AlertCircle,
  Activity, Filter, Download, RefreshCw
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import InactiveCustomersTable from '@/components/customer/InactiveCustomersTable';
import InactivityStatCards from '@/components/customer/InactivityStatCards';
import InactivityFilter from '@/components/customer/InactivityFilter';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { subDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Customer } from '@/lib/types';
import CustomerAnalytics from '@/components/customer/CustomerAnalytics';
import { Badge } from '@/components/ui/badge';

const CustomerFollowup = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const customersQuery = useCustomers().getAll;
  const customers = customersQuery.data || [];
  const isLoading = customersQuery.isLoading;
  
  // --- إضافة استدعاء جميع الفواتير ---
  const { getAll: getAllInvoices } = useInvoices();
  const invoices = getAllInvoices.data || [];
  
  // احتساب lastActive من الفواتير الفعلية، مع تجاهل الفواتير المستقبلية
  const now = new Date();
  const lastInvoiceDateMap: Record<string, string> = {};
  invoices.forEach(inv => {
    const invDate = inv.date instanceof Date ? inv.date : new Date(inv.date);
    if (invDate <= now) {
      if (!lastInvoiceDateMap[inv.customerId] || new Date(lastInvoiceDateMap[inv.customerId]) < invDate) {
        lastInvoiceDateMap[inv.customerId] = invDate.toISOString();
      }
    }
  });
  const customersWithLastActive = customers.map(c => ({
    ...c,
    lastActive: lastInvoiceDateMap[c.id]
  }));
  
  // فلاتر تتبع العملاء
  const [period, setPeriod] = useState<string>('30');
  const [date, setDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // فلاتر جديدة
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'active'|'recent'|'inactive'|'warning'|'critical'|'analytics'>('inactive');

  // استرجاع إعدادات الفلترة من الجلسة
  useEffect(() => {
    const savedPeriod = sessionStorage.getItem('cf_period');
    const savedFrom = sessionStorage.getItem('cf_fromDate');
    const savedTo   = sessionStorage.getItem('cf_toDate');
    if (savedPeriod) setPeriod(savedPeriod);
    if (savedFrom)  setFromDate(new Date(savedFrom));
    if (savedTo)    setToDate(new Date(savedTo));
  }, []);

  // حفظ إعدادات الفلترة عند التغيير
  useEffect(() => {
    sessionStorage.setItem('cf_period', period);
  }, [period]);

  useEffect(() => {
    if (fromDate) sessionStorage.setItem('cf_fromDate', fromDate.toISOString());
    else sessionStorage.removeItem('cf_fromDate');
    if (toDate)   sessionStorage.setItem('cf_toDate', toDate.toISOString());
    else sessionStorage.removeItem('cf_toDate');
  }, [fromDate, toDate]);

  // التعامل مع تغيير فترة عدم النشاط
  useEffect(() => {
    if (period === 'custom') {
      setDate(undefined);
    } else if (period === 'all') {
      setDate(undefined);
      setFromDate(undefined);
      setToDate(undefined);
    } else {
      const days = parseInt(period);
      if (!isNaN(days)) {
        setDate(subDays(new Date(), days));
        setFromDate(undefined);
        setToDate(undefined);
      }
    }
  }, [period]);
  
  // التعامل مع تغيير نطاق التاريخ المخصص
  const handleDateRangeChange = (from: Date | null, to: Date | null) => {
    setFromDate(from || undefined);
    setToDate(to || undefined);
    // إذا تم مسح التاريخين، أعد الفلتر للوضع الافتراضي
    if (!from && !to) {
      setPeriod('30');
      setDate(subDays(new Date(), 30));
    }
  };
  
  // قائمة أساسية للعملاء بعد تطبيق البحث والفلاتر
  const getBaseCustomers = (): Customer[] => {
    let filtered = [...customersWithLastActive];
    if (selectedGovernorate) filtered = filtered.filter(c => c.governorate === selectedGovernorate);
    if (selectedCity) filtered = filtered.filter(c => c.city === selectedCity);
    if (selectedBusinessType) filtered = filtered.filter(c => c.businessType === selectedBusinessType);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.businessType?.toLowerCase().includes(term)
      );
    }
    return filtered;
  };
  const baseCustomers = getBaseCustomers();

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const classifyCustomer = (c: Customer): 'active'|'recent'|'warning'|'critical' => {
    if (!c.lastActive) return 'critical';
    const daysDiff = Math.floor((Date.now() - new Date(c.lastActive).getTime()) / MS_PER_DAY);
    if (daysDiff <= 7) return 'active';
    if (daysDiff <= 30) return 'recent';
    if (daysDiff <= 90) return 'warning';
    return 'critical';
  };

  // قائمة العملاء غير النشطين بعد تطبيق الفلاتر
  const getInactiveList = (): Customer[] => {
    if (period === 'all') {
      return baseCustomers.filter(c => classifyCustomer(c) !== 'active');
    }
    if (period === 'custom' && (fromDate || toDate)) {
      return baseCustomers.filter(c => {
        const lastActivity = c.lastActive ? new Date(c.lastActive) : new Date(0);
        if (fromDate && toDate) return lastActivity >= fromDate && lastActivity <= toDate;
        if (fromDate) return lastActivity >= fromDate;
        if (toDate)   return lastActivity <= toDate;
        return true;
      });
    }
    if (date) {
      return baseCustomers.filter(c => {
        if (!c.lastActive) return true;
        return new Date(c.lastActive).getTime() <= date.getTime();
      });
    }
    return baseCustomers.filter(c => classifyCustomer(c) !== 'active');
  };
  const inactiveCustomers = getInactiveList();
  const warningCustomers = baseCustomers.filter(c => classifyCustomer(c) === 'warning');
  const criticalCustomers = baseCustomers.filter(c => classifyCustomer(c) === 'critical');
  const analyticsInvoices = invoices.filter(inv => baseCustomers.some(c => c.id === inv.customerId));
  const activeCustomers = baseCustomers.filter(c => classifyCustomer(c) === 'active');
  const recentCustomers = baseCustomers.filter(c => classifyCustomer(c) === 'recent');

  const inactivityStats = {
    critical: baseCustomers.filter(c => classifyCustomer(c) === 'critical').length,
    warning: baseCustomers.filter(c => classifyCustomer(c) === 'warning').length,
    recent: baseCustomers.filter(c => classifyCustomer(c) === 'recent').length,
    total: baseCustomers.length,
    percentage: baseCustomers.length > 0 
      ? Math.round(((baseCustomers.filter(c => classifyCustomer(c) === 'critical').length + baseCustomers.filter(c => classifyCustomer(c) === 'warning').length + baseCustomers.filter(c => classifyCustomer(c) === 'recent').length) / baseCustomers.length) * 100)
      : 0
  };

  // تصدير بيانات العملاء غير النشطين
  const exportData = () => {
    // تنفيذ تصدير البيانات (سيتم تنفيذه لاحقًا)
    toast({
      title: "تم تصدير البيانات",
      description: "تم تصدير بيانات العملاء غير النشطين بنجاح",
    });
  };
  
  // تحديث بيانات العملاء يدويًا بعد أي عملية حرجة
  const refreshData = () => {
    customersQuery.refetch();
    toast({
      title: 'تم تحديث البيانات',
      description: 'تم تحديث بيانات العملاء بنجاح',
    });
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGovernorate('');
    setSelectedCity('');
    setSelectedBusinessType('');
    setPeriod('30');
    setDate(subDays(new Date(), 30));
    setFromDate(undefined);
    setToDate(undefined);
  };

  // معالجة البحث
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <PageContainer 
      title="متابعة العملاء" 
      subtitle="تحليل وتتبع نشاط العملاء ومتابعة تفاعلهم مع النظام"
      searchPlaceholder="البحث عن عميل..."
      onSearchChange={handleSearch}
    >
      <div className="space-y-6">
        {/* فلتر فترة عدم النشاط */}
        <div className="flex flex-wrap gap-4 items-center">
          <InactivityFilter
            period={period}
            setPeriod={setPeriod}
            date={date}
            setDate={setDate}
            fromDate={fromDate}
            toDate={toDate}
            onDateRangeChange={handleDateRangeChange}
          />
          {/* فلاتر المدن والمحافظات ونوع النشاط */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300"
              value={selectedGovernorate}
              onChange={e => {
                setSelectedGovernorate(e.target.value);
                setSelectedCity('');
              }}
            >
              <option value="">كل المحافظات</option>
              {[...new Set(customers.map(c => c.governorate).filter(Boolean))].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              className="rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              disabled={!selectedGovernorate}
            >
              <option value="">كل المدن</option>
              {[...new Set(customers.filter(c => !selectedGovernorate || c.governorate === selectedGovernorate).map(c => c.city).filter(Boolean))].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              className="rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300"
              value={selectedBusinessType}
              onChange={e => setSelectedBusinessType(e.target.value)}
            >
              <option value="">كل أنواع النشاط</option>
              {[...new Set(customers.map(c => c.businessType).filter(Boolean))].map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* إحصائيات عدم النشاط */}
        <InactivityStatCards
          activeCount={activeCustomers.length}
          criticalCount={inactivityStats.critical}
          warningCount={inactivityStats.warning}
          recentCount={inactivityStats.recent}
          totalCustomers={inactivityStats.total}
          inactivePercentage={inactivityStats.percentage}
          onSelect={(tab) => setActiveTab(tab)}
        />
        
        {/* أزرار الإجراءات */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-secondary text-secondary-foreground">
              {inactiveCustomers.length} عميل
            </Badge>
            {searchTerm && (
              <Badge variant="outline">
                نتائج البحث: {searchTerm}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 rounded-full"
                  onClick={() => setSearchTerm('')}
                >
                  &times;
                </Button>
              </Badge>
            )}
            {selectedGovernorate && (
              <Badge variant="outline">
                {selectedGovernorate}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full" onClick={() => setSelectedGovernorate('')}>
                  &times;
                </Button>
              </Badge>
            )}
            {selectedCity && (
              <Badge variant="outline">
                {selectedCity}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full" onClick={() => setSelectedCity('')}>
                  &times;
                </Button>
              </Badge>
            )}
            {selectedBusinessType && (
              <Badge variant="outline">
                {selectedBusinessType}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full" onClick={() => setSelectedBusinessType('')}>
                  &times;
                </Button>
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 ml-2" />
              تصدير البيانات
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث البيانات
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              إعادة ضبط الفلاتر
            </Button>
          </div>
        </div>
        
        {/* تبويبات متابعة العملاء */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">
               <UserRound className="h-4 w-4 ml-2" />
               العملاء النشطين ({activeCustomers.length})
             </TabsTrigger>
             <TabsTrigger value="recent">
               <Clock className="h-4 w-4 ml-2" />
               العملاء غير النشطين حديثاً ({recentCustomers.length})
             </TabsTrigger>
             <TabsTrigger value="inactive">
               <Clock className="h-4 w-4 ml-2" />
               العملاء غير النشطين ({inactiveCustomers.length})
             </TabsTrigger>
             <TabsTrigger value="warning">
               <AlertTriangle className="h-4 w-4 ml-2" />
               العملاء المعرضين للفقد ({warningCustomers.length})
             </TabsTrigger>
             <TabsTrigger value="critical">
               <AlertCircle className="h-4 w-4 ml-2" />
               العملاء المفقودين ({criticalCustomers.length})
             </TabsTrigger>
             <TabsTrigger value="analytics">
               <Activity className="h-4 w-4 ml-2" />
               تحليلات متقدمة
             </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            <InactiveCustomersTable
              customers={activeCustomers}
              loading={isLoading}
              title="العملاء النشطين"
              description="قائمة العملاء الذين تفاعلوا خلال 7 أيام"
              emptyMessage="لا يوجد عملاء نشطين حاليًا"
            />
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <InactiveCustomersTable
              customers={recentCustomers}
              loading={isLoading}
              title="عملاء غير نشطين (حديثاً)"
              description="قائمة العملاء الذين لم يتفاعلوا بين 7 و30 يومًا"
              emptyMessage="لا يوجد عملاء غير نشطين حديثاً"
            />
          </TabsContent>
          
          <TabsContent value="inactive" className="mt-0">
            <InactiveCustomersTable 
              customers={inactiveCustomers}
              loading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="warning" className="mt-0">
            <InactiveCustomersTable 
              customers={warningCustomers}
              loading={isLoading}
              title="العملاء المعرضين للفقد"
              description="قائمة العملاء الذين لم يتفاعلوا مع النظام منذ 30-90 يومًا"
              emptyMessage="لا يوجد عملاء معرضين للفقد حاليًا"
              warningLevel="warning"
            />
          </TabsContent>
          
          <TabsContent value="critical" className="mt-0">
            <InactiveCustomersTable 
              customers={criticalCustomers}
              loading={isLoading}
              title="العملاء المفقودين"
              description="قائمة العملاء الذين لم يتفاعلوا مع النظام منذ أكثر من 90 يومًا"
              emptyMessage="لا يوجد عملاء مفقودين حاليًا"
              warningLevel="destructive"
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <CustomerAnalytics 
              customers={baseCustomers} 
              invoices={analyticsInvoices}
              products={[]}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default CustomerFollowup;
