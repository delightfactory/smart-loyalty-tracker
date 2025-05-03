
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import RolesPermissionsManagement from './RolesPermissionsManagement';
import UserPermissionOverrides from './UserPermissionOverrides';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roleService, permissionService } from '@/lib/user-rbac-service';

export function UserRolesList() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [roleCount, setRoleCount] = useState(0);
  const [permCount, setPermCount] = useState(0);
  const [activeTab, setActiveTab] = useState('roles');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [roles, permissions] = await Promise.all([
          roleService.getAllRoles(),
          permissionService.getAllPermissions()
        ]);
        
        setRoleCount(roles.length);
        setPermCount(permissions.length);
      } catch (error) {
        console.error('Error fetching counts:', error);
        toast({
          title: 'خطأ في تحميل البيانات',
          description: 'حدث خطأ أثناء جلب بيانات الأدوار والصلاحيات',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCounts();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span className="text-lg">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold">{roleCount}</h3>
              <p className="text-muted-foreground">عدد الأدوار</p>
              <Badge className="mt-4" variant="outline">
                يتم تعيين الأدوار للمستخدمين لتحديد صلاحياتهم
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold">{permCount}</h3>
              <p className="text-muted-foreground">عدد الصلاحيات</p>
              <Badge className="mt-4" variant="outline">
                الصلاحيات هي إجراءات محددة يمكن منحها للأدوار أو المستخدمين
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start h-12">
          <TabsTrigger value="roles" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-base py-3">
            الأدوار والصلاحيات
          </TabsTrigger>
          <TabsTrigger value="user-permissions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-base py-3">
            الصلاحيات الفردية
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="mt-6">
          <RolesPermissionsManagement />
        </TabsContent>
        
        <TabsContent value="user-permissions" className="mt-6">
          <UserPermissionOverrides />
        </TabsContent>
      </Tabs>
    </div>
  );
}
