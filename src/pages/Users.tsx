
import { UsersSettingsTab } from '@/components/settings/UsersSettingsTab';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/lib/auth-types';

const UsersPage = () => {
  const { hasRole } = useAuth();

  if (!hasRole(UserRole.ADMIN)) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <PageContainer title="المستخدمين" subtitle="إدارة مستخدمي النظام وصلاحياتهم">
      <UsersSettingsTab />
    </PageContainer>
  );
};

export default UsersPage;
