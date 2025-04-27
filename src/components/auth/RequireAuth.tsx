import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
}

// [تعطيل الحماية] السماح بالوصول لجميع الصفحات بدون تسجيل دخول
const RequireAuth = ({ children }: RequireAuthProps) => {
  return <>{children}</>;
};

export default RequireAuth;
