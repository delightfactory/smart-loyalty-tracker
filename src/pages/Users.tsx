import { UsersManagement } from '@/components/users/UsersManagement';
import PageContainer from '@/components/layout/PageContainer';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const UsersPage = () => {
  return (
    <ProtectedRoute permission="manage_users">
      <PageContainer title="إدارة المستخدمين" subtitle="إدارة مستخدمي النظام وصلاحياتهم">
        <UsersManagement />
      </PageContainer>
    </ProtectedRoute>
  );
};

export default UsersPage;
