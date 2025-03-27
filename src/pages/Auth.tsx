
import PageContainer from '@/components/layout/PageContainer';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <PageContainer title="المصادقة" subtitle="تسجيل الدخول أو إنشاء حساب جديد">
      <div className="flex items-center justify-center min-h-[70vh]">
        <AuthForm />
      </div>
    </PageContainer>
  );
};

export default Auth;
