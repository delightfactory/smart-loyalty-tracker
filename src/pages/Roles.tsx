
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRoles, Role } from '@/services/roles-api';
import { Link } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import CreateRoleDialog from '@/components/CreateRoleDialog';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Shield, ShieldCheck, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RolesPage() {
  // استخدام اشتراك الوقت الحقيقي لمراقبة التغييرات في جدول الأدوار
  useRealtimeSubscription(['roles', 'role_permissions']);
  
  const { data: roles = [], isLoading, isError } = useQuery<Role[], Error>({
    queryKey: ['roles'],
    queryFn: fetchAllRoles,
  });
  
  if (isLoading) {
    return (
      <PageContainer title="الأدوار">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }
  
  if (isError) {
    return (
      <PageContainer title="الأدوار">
        <Card>
          <CardContent className="text-center py-10">
            <div className="text-destructive mb-4 text-xl">حدث خطأ أثناء جلب الأدوار</div>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer 
      title="إدارة الأدوار" 
      subtitle="إدارة وتكوين أدوار المستخدمين وصلاحياتهم في النظام"
    >
      <div className="flex justify-end mb-4">
        <CreateRoleDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>قائمة الأدوار</span>
          </CardTitle>
          <CardDescription>
            اضغط على اسم الدور لإدارة صلاحياته
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto opacity-20 mb-3" />
              <p>لا توجد أدوار حتى الآن</p>
              <p className="text-sm mt-1">قم بإضافة دور جديد باستخدام زر "إضافة دور جديد"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدور</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary opacity-70" />
                        <span>{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link to={`/roles/${role.id}`}>
                          <Pencil className="h-4 w-4 mr-2" /> 
                          إدارة الصلاحيات
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
