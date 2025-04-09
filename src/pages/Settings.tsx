
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/auth-types';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersSettingsTab } from '@/components/settings/UsersSettingsTab';
import { SecuritySettingsTab } from '@/components/settings/SecuritySettingsTab';

const Settings = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  return (
    <PageContainer title="الإعدادات" subtitle="إدارة إعدادات النظام والمستخدمين">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
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
