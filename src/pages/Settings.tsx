
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/auth-types';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersSettingsTab } from '@/components/settings/UsersSettingsTab';
import { SecuritySettingsTab } from '@/components/settings/SecuritySettingsTab';
import { BackupSettingsTab } from '@/components/settings/BackupSettingsTab';
import { DatabaseManagementTab } from '@/components/settings/DatabaseManagementTab';
import { useSettings } from '@/hooks/useSettings';

const Settings = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const { 
    backupSettings, 
    updateBackupSettings, 
    isLoading 
  } = useSettings();
  
  return (
    <PageContainer title="الإعدادات" subtitle="إدارة إعدادات النظام والمستخدمين">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
          <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
          {hasRole(UserRole.ADMIN) && (
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettingsTab />
        </TabsContent>

        <TabsContent value="backup">
          <BackupSettingsTab 
            settings={backupSettings || {
              enableAutoBackup: true,
              backupFrequency: 'weekly',
              backupRetention: 30
            }}
            onSave={updateBackupSettings.mutate}
            isLoading={isLoading || updateBackupSettings.isPending}
          />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseManagementTab />
        </TabsContent>
        
        {hasRole(UserRole.ADMIN) && (
          <TabsContent value="users">
            <UsersSettingsTab />
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
};

const ProfileTab = () => {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold">الملف الشخصي</h2>
        <p className="text-muted-foreground">هذا القسم قيد التطوير. سيتم قريبًا إضافة خيارات لتحديث بيانات الملف الشخصي وتغيير صورة المستخدم.</p>
      </div>
    </div>
  );
};

export default Settings;
