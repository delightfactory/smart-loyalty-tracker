
import { UsersManagement } from '@/components/users/UsersManagement';
import PageContainer from '@/components/layout/PageContainer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import RequireAuth from '@/components/auth/RequireAuth'; // إضافة استيراد RequireAuth
import { useAuth } from '@/hooks/useAuth';

const UsersPage = () => {
  const { hasPermission } = useAuth();
  
  return (
    <RequireAuth>
      <ProtectedRoute permission="manage_users">
        <PageContainer 
          title="إدارة المستخدمين" 
          subtitle="إدارة مستخدمي النظام وصلاحياتهم"
        >
          <UsersManagement />
        </PageContainer>
      </ProtectedRoute>
    </RequireAuth>
  );
};

export default UsersPage;
