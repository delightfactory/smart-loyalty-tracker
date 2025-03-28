
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageContainer from '@/components/layout/PageContainer';
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import { CompanySettingsForm } from '@/components/settings/CompanySettingsForm';
import { InvoiceSettingsForm } from '@/components/settings/InvoiceSettingsForm';
import { PaymentSettingsForm } from '@/components/settings/PaymentSettingsForm';
import { LoyaltySettingsForm } from '@/components/settings/LoyaltySettingsForm';
import { BackupSettingsTab } from '@/components/settings/BackupSettingsTab';
import { SecuritySettingsTab } from '@/components/settings/SecuritySettingsTab';
import { UsersSettingsTab } from '@/components/settings/UsersSettingsTab';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/lib/auth-types';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { isLoading } = useSettings();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  
  return (
    <PageContainer title="الإعدادات" subtitle="تخصيص النظام وضبط الإعدادات">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="company">الشركة</TabsTrigger>
            <TabsTrigger value="invoice">الفواتير</TabsTrigger>
            <TabsTrigger value="payment">المدفوعات</TabsTrigger>
            <TabsTrigger value="loyalty">نقاط الولاء</TabsTrigger>
            <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">المستخدمين</TabsTrigger>}
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="mb-2">جاري تحميل الإعدادات...</p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="general">
                <GeneralSettingsForm />
              </TabsContent>
              
              <TabsContent value="company">
                <CompanySettingsForm />
              </TabsContent>
              
              <TabsContent value="invoice">
                <InvoiceSettingsForm />
              </TabsContent>
              
              <TabsContent value="payment">
                <PaymentSettingsForm />
              </TabsContent>
              
              <TabsContent value="loyalty">
                <LoyaltySettingsForm />
              </TabsContent>
              
              <TabsContent value="backup">
                <BackupSettingsTab />
              </TabsContent>
              
              <TabsContent value="security">
                <SecuritySettingsTab />
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="users">
                  <UsersSettingsTab />
                </TabsContent>
              )}
            </>
          )}
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Settings;
