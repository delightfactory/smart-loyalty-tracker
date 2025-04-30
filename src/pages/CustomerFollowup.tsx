
import { useState, useEffect, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import CustomerPerformanceTab from '@/components/customer/CustomerPerformanceTab';
import InactiveCustomersTable from '@/components/customer/InactiveCustomersTable';
import InactivityStatCards from '@/components/customer/InactivityStatCards';
import InactivityFilter from '@/components/customer/InactivityFilter';
import PointsSummary from '@/components/dashboard/PointsSummary';
import CustomerAnalytics from '@/components/customer/CustomerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

const CustomerFollowup = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<string>("30");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // جلب العملاء والفواتير والمنتجات الحقيقية
  const { getAll: getAllCustomers } = useCustomers();
  const { data: customers = [], isLoading: customersLoading } = getAllCustomers;
  const { getAll: getAllInvoices } = useInvoices();
  const { data: invoices = [], isLoading: invoicesLoading } = getAllInvoices;
  const { getAll: getAllProducts } = useProducts();
  const { data: products = [], isLoading: productsLoading } = getAllProducts;

  // تأثير للتعامل مع تحديثات فترة التاريخ
  useEffect(() => {
    if (period === "custom") {
      // لا تفعل شيئًا، سيقوم المستخدم بتحديد نطاق التاريخ المخصص
    } else {
      // إعادة تعيين نطاق التاريخ المخصص عند تغيير الفترة
      setFromDate(undefined);
      setToDate(undefined);
      
      // تعيين تاريخ البداية بناءً على الفترة المحددة
      const days = parseInt(period, 10);
      if (!isNaN(days)) {
        setDate(subDays(new Date(), days));
      } else {
        setDate(undefined);
      }
    }
  }, [period]);

  // بناء بيانات العملاء غير النشطين من البيانات الحقيقية
  const inactiveCustomers = useMemo(() => {
    return customers.map(customer => {
      const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
      
      // إيجاد تاريخ آخر شراء
      const lastPurchaseDate = customerInvoices.length
        ? new Date(Math.max(...customerInvoices.map(inv => new Date(inv.date).getTime())))
        : null;
        
      // حساب عدد أيام عدم النشاط
      const inactiveDays = lastPurchaseDate
        ? Math.floor((Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;
        
      // إضافة العناصر لكل فاتورة للعميل
      const customerInvoicesWithItems = customerInvoices.map(invoice => {
        const items = invoice.items || [];
        // إضافة معلومات المنتج لكل عنصر
        const itemsWithProducts = items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return { ...item, product };
        });
        
        return { ...invoice, items: itemsWithProducts };
      });
      
      // حساب إجمالي المشتريات
      const totalPurchases = customerInvoicesWithItems.reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      // حساب متوسط قيمة الفاتورة
      const avgInvoiceValue = customerInvoicesWithItems.length > 0 
        ? totalPurchases / customerInvoicesWithItems.length 
        : 0;
      
      // تحديد الفئات المفضلة
      const categoryCounts: Record<string, number> = {};
      customerInvoicesWithItems.forEach(invoice => {
        invoice.items.forEach(item => {
          if (item.product?.category) {
            categoryCounts[item.product.category] = (categoryCounts[item.product.category] || 0) + 1;
          }
        });
      });
      
      // ترتيب الفئات حسب عدد المشتريات
      const favoriteCategories = Object.entries(categoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([category]) => category);
        
      return {
        ...customer,
        lastPurchase: lastPurchaseDate,
        inactiveDays: inactiveDays,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customer.name)}`,
        email: customer.contactPerson || '',
        loyaltyPoints: customer.currentPoints,
        totalPurchases: totalPurchases,
        avgInvoiceValue: avgInvoiceValue,
        invoiceCount: customerInvoicesWithItems.length,
        favoriteCategories: favoriteCategories,
        invoices: customerInvoicesWithItems // إضافة فواتير العميل مع معلومات المنتجات
      };
    });
  }, [customers, invoices, products]);

  // حساب ملخص النقاط لكل العملاء
  const totalEarned = invoices.reduce((sum, inv) => sum + (inv.pointsEarned || 0), 0);
  const totalRedeemed = invoices.reduce((sum, inv) => sum + (inv.pointsRedeemed || 0), 0);
  const totalRemaining = totalEarned - totalRedeemed;

  // تطبيق فلتر الفترة الزمنية المخصصة إذا تم تحديدها
  const applyDateFilter = (customer: any) => {
    if (fromDate && toDate && customer.lastPurchase) {
      return customer.lastPurchase >= fromDate && customer.lastPurchase <= toDate;
    } else if (fromDate && customer.lastPurchase) {
      return customer.lastPurchase >= fromDate;
    } else if (toDate && customer.lastPurchase) {
      return customer.lastPurchase <= toDate;
    }
    
    return true;
  };

  // فلترة العملاء حسب فترة الغياب
  const filteredCustomers = useMemo(() => {
    return inactiveCustomers
      .filter(customer => {
        // إذا كان العميل بلا تاريخ شراء، يعتبر غير نشط تمامًا
        if (customer.inactiveDays === null) {
          return period === "all" || period === "custom"; // إظهار في حالة "الكل" أو "مخصص"
        }
        
        // فلترة حسب فترة الزمنية
        if (period === "custom") {
          return applyDateFilter(customer);
        } else {
          return customer.inactiveDays >= parseInt(period);
        }
      })
      .filter(customer => {
        if (!searchTerm) return true;
        return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customer.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customer.businessType?.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => (b.inactiveDays || 0) - (a.inactiveDays || 0));
  }, [inactiveCustomers, period, searchTerm, fromDate, toDate]);

  const criticalCustomers = useMemo(() => filteredCustomers.filter(c => (c.inactiveDays || 0) > 90), [filteredCustomers]);
  const warningCustomers = useMemo(() => filteredCustomers.filter(c => (c.inactiveDays || 0) >= 30 && (c.inactiveDays || 0) <= 90), [filteredCustomers]);
  const recentCustomers = useMemo(() => filteredCustomers.filter(c => (c.inactiveDays || 0) < 30), [filteredCustomers]);

  // معالجة تغيير نطاق التاريخ المخصص
  const handleDateRangeChange = (from: Date | null, to: Date | null) => {
    setFromDate(from || undefined);
    setToDate(to || undefined);
    
    if (from || to) {
      // التبديل إلى وضع "مخصص" عندما يحدد المستخدم تاريخًا
      setPeriod("custom");
    }
  };

  // معالجة البحث
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // عرض رسالة عند تغيير التبويب
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "performance" && filteredCustomers.length === 0) {
      toast({
        title: "لا توجد بيانات كافية",
        description: "لا توجد عملاء يطابقون معايير التصفية الحالية لعرض التحليلات",
        variant: "warning"
      });
    }
  };

  return (
    <PageContainer 
      title="متابعة العملاء"
      subtitle="متابعة العملاء غير النشطين وتحفيزهم على العودة للشراء"
      searchPlaceholder="بحث عن عميل..."
      onSearch={handleSearch}
    >
      <div className="space-y-6">
        {/* ملخص النقاط */}
        <PointsSummary
          totalEarned={totalEarned}
          totalRedeemed={totalRedeemed}
          totalRemaining={totalRemaining}
          loading={customersLoading || invoicesLoading}
        />
        
        <InactivityFilter 
          period={period}
          setPeriod={setPeriod}
          date={date}
          setDate={setDate}
          fromDate={fromDate}
          toDate={toDate}
          onDateRangeChange={handleDateRangeChange}
        />

        <InactivityStatCards
          criticalCount={criticalCustomers.length}
          warningCount={warningCustomers.length}
          recentCount={recentCustomers.length}
          totalCustomers={customers.length}
          inactivePercentage={customers.length > 0 ? Math.round((filteredCustomers.length / customers.length) * 100) : 0}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">جميع العملاء</TabsTrigger>
            <TabsTrigger value="critical">
              عملاء غير نشطين جدًا
              {criticalCustomers.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                  {criticalCustomers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="warning">
              عملاء في خطر الضياع
              {warningCustomers.length > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                  {warningCustomers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="recent">
              عملاء حديثي الغياب
              {recentCustomers.length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                  {recentCustomers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="performance">تحليل الأداء</TabsTrigger>
            <TabsTrigger value="analytics">تحليلات متقدمة</TabsTrigger>
          </TabsList>
          
          {(customersLoading || invoicesLoading || productsLoading) ? (
            <Card className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </Card>
          ) : (
            <>
              <TabsContent value="all">
                <InactiveCustomersTable customers={filteredCustomers} />
              </TabsContent>
              <TabsContent value="critical">
                <InactiveCustomersTable customers={criticalCustomers} />
              </TabsContent>
              <TabsContent value="warning">
                <InactiveCustomersTable customers={warningCustomers} />
              </TabsContent>
              <TabsContent value="recent">
                <InactiveCustomersTable customers={recentCustomers} />
              </TabsContent>
              <TabsContent value="performance">
                <CustomerPerformanceTab customers={inactiveCustomers} />
              </TabsContent>
              <TabsContent value="analytics">
                <CustomerAnalytics 
                  customers={inactiveCustomers} 
                  invoices={invoices} 
                  products={products} 
                  isLoading={customersLoading || invoicesLoading || productsLoading}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default CustomerFollowup;
