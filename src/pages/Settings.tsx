
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
  const { 
    isLoading,
    generalSettings,
    companySettings,
    invoiceSettings,
    paymentSettings,
    loyaltySettings,
    backupSettings,
    securitySettings,
    updateGeneralSettings,
    updateCompanySettings,
    updateInvoiceSettings,
    updatePaymentSettings,
    updateLoyaltySettings,
    updateBackupSettings,
    updateSecuritySettings
  } = useSettings();
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
                <GeneralSettingsForm 
                  settings={generalSettings || {
                    language: 'ar',
                    timezone: 'cairo',
                    currency: 'egp',
                    dateFormat: 'dd_mm_yyyy',
                    sendEmailNotifications: true,
                    collectAnalytics: true
                  }} 
                  onSave={(data) => updateGeneralSettings.mutate(data)}
                  isLoading={updateGeneralSettings.isPending}
                />
              </TabsContent>
              
              <TabsContent value="company">
                <CompanySettingsForm 
                  settings={companySettings || {
                    name: '',
                    taxNumber: '',
                    phone: '',
                    email: '',
                    address: ''
                  }} 
                  onSave={(data) => updateCompanySettings.mutate(data)}
                  isLoading={updateCompanySettings.isPending}
                />
              </TabsContent>
              
              <TabsContent value="invoice">
                <InvoiceSettingsForm 
                  settings={invoiceSettings || {
                    invoicePrefix: 'INV',
                    nextInvoiceNumber: 1001,
                    defaultPaymentTerms: 30,
                    taxRate: 14,
                    showTax: true,
                    showPoints: true,
                    defaultNotes: '',
                    footer: ''
                  }} 
                  onSave={(data) => updateInvoiceSettings.mutate(data)}
                  isLoading={updateInvoiceSettings.isPending}
                />
              </TabsContent>
              
              <TabsContent value="payment">
                <PaymentSettingsForm 
                  settings={paymentSettings || {
                    enabledMethods: {
                      cash: true,
                      credit: true,
                      bankTransfer: true,
                      card: true
                    },
                    defaultMethod: 'cash',
                    paymentPrefix: 'PAY',
                    allowPartialPayments: true,
                    enableOverdueNotifications: false,
                    overdueReminders: {
                      firstReminder: 3,
                      secondReminder: 7
                    }
                  }} 
                  onSave={(data) => updatePaymentSettings.mutate(data)}
                  isLoading={updatePaymentSettings.isPending}
                />
              </TabsContent>
              
              <TabsContent value="loyalty">
                <LoyaltySettingsForm 
                  settings={loyaltySettings || {
                    enableLoyaltyProgram: true,
                    pointsPerCurrency: 0.5,
                    pointsExpiry: 365,
                    minPointsRedemption: 100,
                    pointsValue: 0.25,
                    levels: [
                      { id: 1, name: 'برونزي', minPoints: 0, maxPoints: 500 }
                    ]
                  }} 
                  onSave={(data) => updateLoyaltySettings.mutate(data)}
                  isLoading={updateLoyaltySettings.isPending}
                />
              </TabsContent>
              
              <TabsContent value="backup">
                <BackupSettingsTab 
                  settings={backupSettings || {
                    enableAutoBackup: true,
                    backupFrequency: 'weekly',
                    backupRetention: 30
                  }} 
                  onSave={(data) => updateBackupSettings.mutate(data)}
                  isLoading={updateBackupSettings.isPending}
                />
              </TabsContent>
              
              <TabsContent value="security">
                <SecuritySettingsTab 
                  settings={securitySettings || {
                    twoFactorEnabled: false,
                    sessionTimeout: true,
                    sessionTimeoutMinutes: 30
                  }} 
                  onSave={(data) => updateSecuritySettings.mutate(data)}
                  isLoading={updateSecuritySettings.isPending}
                />
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
