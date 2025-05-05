import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRoles, Role } from '@/services/roles-api';
import RolePermissionsForm from '@/components/RolePermissionsForm';
import PageContainer from '@/components/layout/PageContainer';

export default function RoleDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: roles = [], isLoading, isError } = useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: fetchAllRoles,
  });

  if (isLoading) {
    return <PageContainer title="صلاحية الدور"><div>جارٍ التحميل...</div></PageContainer>;
  }
  if (isError) {
    return <PageContainer title="صلاحية الدور"><div>حدث خطأ أثناء جلب الدور</div></PageContainer>;
  }

  const role = roles.find((r: Role) => r.id === id);
  if (!role) {
    return <PageContainer title="صلاحية الدور"><div>الدور غير موجود</div></PageContainer>;
  }

  return (
    <PageContainer title={role.name} subtitle={role.description}>
      <RolePermissionsForm roleId={role.id} />
    </PageContainer>
  );
}
