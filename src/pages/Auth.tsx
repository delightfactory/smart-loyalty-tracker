
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
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <PageContainer title="المصادقة" subtitle="تسجيل الدخول لبدء استخدام النظام">
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          {isLoading ? (
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
