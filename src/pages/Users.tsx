
import { UsersManagement } from '@/components/users/UsersManagement';
import PageContainer from '@/components/layout/PageContainer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const UsersPage = () => {
  const { hasPermission } = useAuth();
  
  return (
    <ProtectedRoute permission="manage_users">
      <PageContainer 
        title="إدارة المستخدمين" 
        subtitle="إدارة مستخدمي النظام وصلاحياتهم"
      >
        <UsersManagement />
      </PageContainer>
    </ProtectedRoute>
  );
};

export default UsersPage;
