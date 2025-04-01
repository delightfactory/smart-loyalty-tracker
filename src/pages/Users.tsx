import { UsersSettingsTab } from '@/components/settings/UsersSettingsTab';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const UsersPage = () => {
  const { hasRole } = useAuth();

  if (!hasRole('admin')) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <PageContainer title="المستخدمين" subtitle="إدارة مستخدمي النظام وصلاحياتهم">
      <UsersSettingsTab />
    </PageContainer>
  );
};

export default UsersPage;

