
import { UsersManagement } from '@/components/users/UsersManagement';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/lib/auth-types';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

const UsersPage = () => {
  const { hasRole } = useAuth();
  
  // Subscribe to realtime updates for user-related tables
  useRealtimeSubscription([
    'profiles', 
    'user_roles', 
    'roles', 
    'permissions', 
    'user_permissions',
    'role_permissions'
  ]);

  // التحقق من صلاحيات المستخدم للوصول إلى هذه الصفحة
  if (!hasRole(UserRole.ADMIN)) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <PageContainer 
      title="إدارة المستخدمين" 
      subtitle="إدارة مستخدمي النظام وصلاحياتهم"
    >
      <UsersManagement />
    </PageContainer>
  );
};

export default UsersPage;
