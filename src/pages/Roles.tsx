
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRoles, Role } from '@/services/roles-api';
import { Link } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import CreateRoleDialog from '@/components/CreateRoleDialog';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export default function RolesPage() {
  // استخدام اشتراك الوقت الحقيقي لمراقبة التغييرات في جدول الأدوار
  useRealtimeSubscription(['roles', 'role_permissions']);
  
  const { data: roles = [], isLoading, isError } = useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: fetchAllRoles,
  });
  
  if (isLoading) return <PageContainer title="الأدوار"><div>جارٍ التحميل...</div></PageContainer>;
  if (isError) return <PageContainer title="الأدوار"><div>حدث خطأ أثناء جلب الأدوار</div></PageContainer>;
  
  return (
    <PageContainer title="الأدوار" subtitle="إدارة الأدوار">
      <div className="flex justify-end">
        <CreateRoleDialog />
      </div>
      <ul className="mt-4 list-disc list-inside">
        {roles.map(role => (
          <li key={role.id}>
            <Link to={`/roles/${role.id}`} className="text-blue-600 hover:underline">
              {role.name}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
