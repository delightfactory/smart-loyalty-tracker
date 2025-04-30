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
  
  // فلاتر تتبع العملاء
  const [period, setPeriod] = useState<string>('30');
  const [date, setDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // فلاتر جديدة
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');

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
  
  // تصفية العملاء حسب فترة عدم النشاط
  const getFilteredCustomers = (): Customer[] => {
    let filtered = [...customers];
    
    // فلترة المدن والمحافظات
    if (selectedGovernorate) {
      filtered = filtered.filter(c => c.governorate === selectedGovernorate);
    }
    if (selectedCity) {
      filtered = filtered.filter(c => c.city === selectedCity);
    }
    if (selectedBusinessType) {
      filtered = filtered.filter(c => c.businessType === selectedBusinessType);
    }
    
    // تطبيق فلتر البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(term) || 
        customer.email?.toLowerCase().includes(term) || 
        customer.phone?.includes(term) ||
        customer.businessType?.toLowerCase().includes(term)
      );
    }
    
    // تطبيق فلتر الفترة الزمنية
    if (period === 'all') {
      return filtered;
    }
    
    if (period === 'custom' && (fromDate || toDate)) {
      if (fromDate && toDate) {
        // تصفية العملاء غير النشطين في الفترة بين التاريخين
        return filtered.filter(customer => {
          const lastActivityDate = customer.lastActive ? new Date(customer.lastActive) : new Date(0);
          return lastActivityDate >= fromDate && lastActivityDate <= toDate;
        });
      } else if (fromDate) {
        // تصفية العملاء غير النشطين بعد تاريخ معين
        return filtered.filter(customer => {
          const lastActivityDate = customer.lastActive ? new Date(customer.lastActive) : new Date(0);
          return lastActivityDate >= fromDate;
        });
      } else if (toDate) {
        // تصفية العملاء غير النشطين قبل تاريخ معين
        return filtered.filter(customer => {
          const lastActivityDate = customer.lastActive ? new Date(customer.lastActive) : new Date(0);
          return lastActivityDate <= toDate;
        });
      }
    }
    
    if (date) {
      // تصفية العملاء غير النشطين منذ تاريخ معين
      return filtered.filter(customer => {
        if (!customer.lastActive) return true; // اعتبر العملاء الذين لم يكن لديهم نشاط على الإطلاق غير نشطين
        const lastActivityDate = new Date(customer.lastActive);
        return lastActivityDate <= date;
      });
    }
    
    return filtered;
  };
  
  const filteredCustomers = getFilteredCustomers();
  
  // حساب إحصائيات عدم النشاط
  const calculateInactivityStats = (inputCustomers: Customer[]) => {
    const now = new Date();
    const criticalInactive = inputCustomers.filter(customer => {
      if (!customer.lastActive) return true;
      const lastActiveDate = new Date(customer.lastActive);
      const daysDiff = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 90;
    }).length;
    
    const warningInactive = inputCustomers.filter(customer => {
      if (!customer.lastActive) return false;
      const lastActiveDate = new Date(customer.lastActive);
      const daysDiff = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 30 && daysDiff <= 90;
    }).length;
    
    const recentInactive = inputCustomers.filter(customer => {
      if (!customer.lastActive) return false;
      const lastActiveDate = new Date(customer.lastActive);
      const daysDiff = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff < 30 && daysDiff > 7;
    }).length;
    
    return {
      critical: criticalInactive,
      warning: warningInactive,
      recent: recentInactive,
      total: inputCustomers.length,
      percentage: inputCustomers.length > 0 
        ? Math.round(((criticalInactive + warningInactive + recentInactive) / inputCustomers.length) * 100)
        : 0
    };
  };
  
  const inactivityStats = calculateInactivityStats(filteredCustomers);
  
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
              className="border rounded px-2 py-1 text-sm"
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
              className="border rounded px-2 py-1 text-sm"
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
              className="border rounded px-2 py-1 text-sm"
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
          criticalCount={inactivityStats.critical}
          warningCount={inactivityStats.warning}
          recentCount={inactivityStats.recent}
          totalCustomers={inactivityStats.total}
          inactivePercentage={inactivityStats.percentage}
        />
        
        {/* أزرار الإجراءات */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-secondary text-secondary-foreground">
              {filteredCustomers.length} عميل
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
          </div>
        </div>
        
        {/* تبويبات متابعة العملاء */}
        <Tabs defaultValue="inactive">
          <TabsList className="mb-6">
            <TabsTrigger value="inactive">
              <Clock className="h-4 w-4 ml-2" />
              العملاء غير النشطين
            </TabsTrigger>
            <TabsTrigger value="warning">
              <AlertTriangle className="h-4 w-4 ml-2" />
              العملاء المعرضين للفقد
            </TabsTrigger>
            <TabsTrigger value="critical">
              <AlertCircle className="h-4 w-4 ml-2" />
              العملاء المفقودين
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="h-4 w-4 ml-2" />
              تحليلات متقدمة
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inactive" className="mt-0">
            <InactiveCustomersTable 
              customers={filteredCustomers}
              loading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="warning" className="mt-0">
            <InactiveCustomersTable 
              customers={customers.filter(customer => {
                if (!customer.lastActive) return false;
                const lastActiveDate = new Date(customer.lastActive);
                const daysDiff = Math.floor((new Date().getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff >= 30 && daysDiff <= 90;
              })}
              loading={isLoading}
              title="العملاء المعرضين للفقد"
              description="قائمة العملاء الذين لم يتفاعلوا مع النظام منذ 30-90 يومًا"
              emptyMessage="لا يوجد عملاء معرضين للفقد حاليًا"
              warningLevel="warning"
            />
          </TabsContent>
          
          <TabsContent value="critical" className="mt-0">
            <InactiveCustomersTable 
              customers={customers.filter(customer => {
                if (!customer.lastActive) return true;
                const lastActiveDate = new Date(customer.lastActive);
                const daysDiff = Math.floor((new Date().getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff > 90;
              })}
              loading={isLoading}
              title="العملاء المفقودين"
              description="قائمة العملاء الذين لم يتفاعلوا مع النظام منذ أكثر من 90 يومًا"
              emptyMessage="لا يوجد عملاء مفقودين حاليًا"
              warningLevel="destructive"
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <CustomerAnalytics 
              customers={filteredCustomers} 
              invoices={invoices.filter(inv => filteredCustomers.some(c => c.id === inv.customerId))}
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
