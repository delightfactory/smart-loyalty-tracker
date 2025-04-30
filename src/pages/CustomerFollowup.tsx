
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

const CustomerFollowup = () => {
  const [period, setPeriod] = useState<string>("30");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // جلب العملاء والفواتير والمنتجات الحقيقية
  const { getAll: getAllCustomers } = useCustomers();
  const { data: customers = [], isLoading: customersLoading } = getAllCustomers;
  const { getAll: getAllInvoices } = useInvoices();
  const { data: invoices = [], isLoading: invoicesLoading } = getAllInvoices;
  const { getAll: getAllProducts } = useProducts();
  const { data: products = [], isLoading: productsLoading } = getAllProducts;

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
        
      return {
        ...customer,
        lastPurchase: lastPurchaseDate,
        inactiveDays: inactiveDays,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customer.name)}`,
        email: customer.contactPerson || '',
        loyaltyPoints: customer.currentPoints,
        invoices: customerInvoicesWithItems // إضافة فواتير العميل مع معلومات المنتجات
      };
    });
  }, [customers, invoices, products]);

  // حساب ملخص النقاط لكل العملاء
  const totalEarned = invoices.reduce((sum, inv) => sum + (inv.pointsEarned || 0), 0);
  const totalRedeemed = invoices.reduce((sum, inv) => sum + (inv.pointsRedeemed || 0), 0);
  const totalRemaining = totalEarned - totalRedeemed;

  // فلترة العملاء حسب فترة الغياب
  const filteredCustomers = useMemo(() => {
    return inactiveCustomers
      .filter(customer => {
        if (customer.inactiveDays === null) return false;
        return customer.inactiveDays >= parseInt(period);
      })
      .filter(customer => {
        if (!searchTerm) return true;
        return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customer.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => (b.inactiveDays || 0) - (a.inactiveDays || 0));
  }, [inactiveCustomers, period, searchTerm]);

  const criticalCustomers = useMemo(() => filteredCustomers.filter(c => (c.inactiveDays || 0) > 90), [filteredCustomers]);
  const warningCustomers = useMemo(() => filteredCustomers.filter(c => (c.inactiveDays || 0) >= 30 && (c.inactiveDays || 0) <= 90), [filteredCustomers]);
  const recentCustomers = useMemo(() => filteredCustomers.filter(c => (c.inactiveDays || 0) < 30), [filteredCustomers]);

  // معالجة البحث
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <PageContainer 
      title="متابعة العملاء"
      subtitle="متابعة العملاء غير النشطين وتحفيزهم على العودة للشراء"
      showSearch
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
        />

        <InactivityStatCards
          criticalCount={criticalCustomers.length}
          warningCount={warningCustomers.length}
          recentCount={recentCustomers.length}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">جميع العملاء</TabsTrigger>
            <TabsTrigger value="critical">عملاء غير نشطين جدًا</TabsTrigger>
            <TabsTrigger value="warning">عملاء في خطر الضياع</TabsTrigger>
            <TabsTrigger value="recent">عملاء حديثي الغياب</TabsTrigger>
            <TabsTrigger value="performance">تحليل الأداء</TabsTrigger>
          </TabsList>
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
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default CustomerFollowup;
