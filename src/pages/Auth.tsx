
import PageContainer from '@/components/layout/PageContainer';
import { AuthForm } from '@/components/auth/AuthForm';
import { CreateAdminAccount } from '@/components/auth/CreateAdminAccount';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('login');
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <PageContainer title="المصادقة" subtitle="تسجيل الدخول أو إنشاء حساب جديد">
      <div className="flex items-center justify-center min-h-[70vh]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="admin">حساب المدير</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <AuthForm />
          </TabsContent>
          
          <TabsContent value="admin">
            <CreateAdminAccount />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Auth;
