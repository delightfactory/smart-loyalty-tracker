
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { CreateAdminAccount } from '@/components/auth/CreateAdminAccount';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isAdminExists } from '@/services/admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(true);
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
    
    // التحقق مما إذا كان هناك مدير موجود
    const checkAdmin = async () => {
      setIsCheckingAdmin(true);
      try {
        const hasAdmin = await isAdminExists();
        console.log("Admin exists check result:", hasAdmin);
        setAdminExists(hasAdmin);
        
        // إذا لم يكن هناك مدير، انتقل تلقائيًا إلى تبويب إنشاء المدير
        if (!hasAdmin) {
          setActiveTab('admin');
        }
      } catch (error) {
        console.error("Error checking admin existence:", error);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdmin();
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <PageContainer title="المصادقة" subtitle="تسجيل الدخول أو إنشاء حساب جديد">
      <div className="flex items-center justify-center min-h-[70vh]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="admin">حساب المدير</TabsTrigger>
          </TabsList>
          
          {isCheckingAdmin ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
              <p>جاري التحقق من وجود مستخدم مسؤول...</p>
            </div>
          ) : (
            <>
              <TabsContent value="login">
                <AuthForm />
              </TabsContent>
              
              <TabsContent value="admin">
                <CreateAdminAccount />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Auth;
