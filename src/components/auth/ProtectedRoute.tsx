import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Permission } from '@/lib/roles-permissions';

interface ProtectedRouteProps {
  permission: Permission;
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * مكون لحماية الصفحات/المكونات بناءً على الصلاحية
 * إذا لم يكن لدى المستخدم الصلاحية المطلوبة، يتم إعادة توجيهه لمسار آخر أو عرض رسالة
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  permission,
  children,
  fallbackPath = '/profile',
}) => {
  const { isAuthenticated, hasPermission, isLoading } = useAuth();

  if (isLoading) return null; // يمكن استبداله بـ Loader

  if (!isAuthenticated || !hasPermission(permission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
