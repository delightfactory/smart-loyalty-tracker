
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Set a loading timeout to prevent infinite loading display
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // If loading takes too long, show the form anyway
  const showForm = !isLoading || loadingTimeout;
  
  return (
    <PageContainer title="المصادقة" subtitle="تسجيل الدخول لبدء استخدام النظام">
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          {isLoading && !loadingTimeout ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
              <p>جاري التحقق من حالة تسجيل الدخول...</p>
            </div>
          ) : (
            <AuthForm />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Auth;
