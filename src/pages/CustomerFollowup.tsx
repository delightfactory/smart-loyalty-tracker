
import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { customers } from '@/lib/data';
import CustomerPerformanceTab from '@/components/customer/CustomerPerformanceTab';
import InactiveCustomersTable from '@/components/customer/InactiveCustomersTable';
import InactivityStatCards from '@/components/customer/InactivityStatCards';
import InactivityFilter from '@/components/customer/InactivityFilter';

const inactiveCustomers = customers.map(customer => ({
  ...customer,
  lastPurchase: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000),
  inactiveDays: Math.floor(Math.random() * 180) + 1,
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customer.name)}`,
  email: `${customer.contactPerson.replace(/\s+/g, '.').toLowerCase()}@${customer.name.replace(/\s+/g, '-').toLowerCase()}.com`,
  loyaltyPoints: customer.currentPoints // Using currentPoints as loyaltyPoints
}));

const CustomerFollowup = () => {
  const [period, setPeriod] = useState<string>("30");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [filteredCustomers, setFilteredCustomers] = useState(inactiveCustomers);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  useEffect(() => {
    const days = parseInt(period);
    const filtered = inactiveCustomers.filter(customer => 
      customer.inactiveDays >= days
    );
    setFilteredCustomers(filtered.sort((a, b) => b.inactiveDays - a.inactiveDays));
  }, [period]);

  const criticalCustomers = filteredCustomers.filter(c => c.inactiveDays > 90);
  const warningCustomers = filteredCustomers.filter(c => c.inactiveDays >= 30 && c.inactiveDays <= 90);
  const recentCustomers = filteredCustomers.filter(c => c.inactiveDays < 30);

  return (
    <PageContainer 
      title="متابعة العملاء"
      subtitle="متابعة العملاء غير النشطين وتحفيزهم على العودة للشراء"
      showSearch
      searchPlaceholder="بحث عن عميل..."
    >
      <div className="space-y-6">
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
