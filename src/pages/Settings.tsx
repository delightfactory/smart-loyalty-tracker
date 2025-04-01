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
          <SecurityTab />
        </TabsContent>
        
        {hasRole(UserRole.ADMIN) && (
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
};

const ProfileTab = () => {
  return (
    <div>
      <h2>الملف الشخصي</h2>
      <p>هذا الجزء قيد التطوير.</p>
    </div>
  );
};

const SecurityTab = () => {
  return (
    <SecuritySettingsTab />
  );
};

const UsersTab = () => {
  return (
    <UsersSettingsTab />
  );
};

export default Settings;

