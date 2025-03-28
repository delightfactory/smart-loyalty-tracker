
import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings2, 
  User, 
  Building, 
  Award, 
  Receipt, 
  CreditCard, 
  Download,
  Shield
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useSettings } from '@/hooks/useSettings';

// استيراد مكونات نماذج الإعدادات
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import { CompanySettingsForm } from '@/components/settings/CompanySettingsForm';
import { InvoiceSettingsForm } from '@/components/settings/InvoiceSettingsForm';
import { PaymentSettingsForm } from '@/components/settings/PaymentSettingsForm';
import { LoyaltySettingsForm } from '@/components/settings/LoyaltySettingsForm';
import { UsersSettingsTab } from '@/components/settings/UsersSettingsTab';
import { BackupSettingsTab } from '@/components/settings/BackupSettingsTab';
import { SecuritySettingsTab } from '@/components/settings/SecuritySettingsTab';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { 
    allSettings, 
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

  if (isLoading) {
    return (
      <PageContainer title="الإعدادات" subtitle="جاري تحميل الإعدادات...">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="الإعدادات" subtitle="إدارة إعدادات النظام">
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 md:col-span-3">
          <CardHeader>
            <CardTitle>الإعدادات</CardTitle>
            <CardDescription>إدارة إعدادات النظام المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="general" 
              orientation="vertical" 
              onValueChange={setActiveTab}
              value={activeTab}
              className="h-full"
            >
              <TabsList className="flex flex-col items-stretch h-full space-y-1 bg-transparent">
                <TabsTrigger value="general" className="justify-start">
                  <Settings2 className="ml-2 h-4 w-4" />
                  الإعدادات العامة
                </TabsTrigger>
                <TabsTrigger value="company" className="justify-start">
                  <Building className="ml-2 h-4 w-4" />
                  بيانات الشركة
                </TabsTrigger>
                <TabsTrigger value="users" className="justify-start">
                  <User className="ml-2 h-4 w-4" />
                  المستخدمين
                </TabsTrigger>
                <TabsTrigger value="loyalty" className="justify-start">
                  <Award className="ml-2 h-4 w-4" />
                  برنامج الولاء
                </TabsTrigger>
                <TabsTrigger value="invoices" className="justify-start">
                  <Receipt className="ml-2 h-4 w-4" />
                  الفواتير
                </TabsTrigger>
                <TabsTrigger value="payments" className="justify-start">
                  <CreditCard className="ml-2 h-4 w-4" />
                  المدفوعات
                </TabsTrigger>
                <TabsTrigger value="backup" className="justify-start">
                  <Download className="ml-2 h-4 w-4" />
                  النسخ الاحتياطي
                </TabsTrigger>
                <TabsTrigger value="security" className="justify-start">
                  <Shield className="ml-2 h-4 w-4" />
                  الأمان
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="col-span-12 md:col-span-9">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="general" className="mt-0">
              {generalSettings && (
                <GeneralSettingsForm 
                  settings={generalSettings} 
                  onSave={(data) => updateGeneralSettings.mutate(data)}
                  isLoading={updateGeneralSettings.isPending}
                />
              )}
            </TabsContent>

            <TabsContent value="company" className="mt-0">
              {companySettings && (
                <CompanySettingsForm 
                  settings={companySettings} 
                  onSave={(data) => updateCompanySettings.mutate(data)}
                  isLoading={updateCompanySettings.isPending}
                />
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersSettingsTab />
            </TabsContent>

            <TabsContent value="loyalty" className="mt-0">
              {loyaltySettings && (
                <LoyaltySettingsForm 
                  settings={loyaltySettings} 
                  onSave={(data) => updateLoyaltySettings.mutate(data)}
                  isLoading={updateLoyaltySettings.isPending}
                />
              )}
            </TabsContent>

            <TabsContent value="invoices" className="mt-0">
              {invoiceSettings && (
                <InvoiceSettingsForm 
                  settings={invoiceSettings} 
                  onSave={(data) => updateInvoiceSettings.mutate(data)}
                  isLoading={updateInvoiceSettings.isPending}
                />
              )}
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              {paymentSettings && (
                <PaymentSettingsForm 
                  settings={paymentSettings} 
                  onSave={(data) => updatePaymentSettings.mutate(data)}
                  isLoading={updatePaymentSettings.isPending}
                />
              )}
            </TabsContent>

            <TabsContent value="backup" className="mt-0">
              {backupSettings && (
                <BackupSettingsTab 
                  settings={backupSettings} 
                  onSave={(data) => updateBackupSettings.mutate(data)}
                  isLoading={updateBackupSettings.isPending}
                />
              )}
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              {securitySettings && (
                <SecuritySettingsTab 
                  settings={securitySettings} 
                  onSave={(data) => updateSecuritySettings.mutate(data)}
                  isLoading={updateSecuritySettings.isPending}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
