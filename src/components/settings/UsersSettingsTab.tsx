
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { UserCog, Users } from 'lucide-react';
import { getAllUsers } from '@/services/users-api';
import { UserRole } from '@/lib/auth-types';

export function UsersSettingsTab() {
  const navigate = useNavigate();

  // جلب معلومات عن المستخدمين
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  // إحصائيات المستخدمين
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.roles.includes(UserRole.ADMIN)).length;
  const managerUsers = users.filter(user => user.roles.includes(UserRole.MANAGER)).length;
  const accountantUsers = users.filter(user => user.roles.includes(UserRole.ACCOUNTANT)).length;
  const salesUsers = users.filter(user => user.roles.includes(UserRole.SALES)).length;
  const regularUsers = users.filter(user => 
    user.roles.length === 1 && user.roles.includes(UserRole.USER)
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المستخدمين</CardTitle>
        <CardDescription>
          إدارة مستخدمي النظام وصلاحياتهم
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* إجمالي المستخدمين */}
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">إجمالي المستخدمين</div>
          </div>
          
          {/* المسؤولون */}
          <div className="bg-primary/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{adminUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">المسؤولون</div>
          </div>
          
          {/* المشرفون */}
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{managerUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">المشرفون</div>
          </div>
          
          {/* المحاسبون */}
          <div className="bg-amber-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{accountantUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">المحاسبون</div>
          </div>
          
          {/* المبيعات */}
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{salesUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">المبيعات</div>
          </div>
          
          {/* المستخدمون العاديون */}
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{regularUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">المستخدمون العاديون</div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium">الإجراءات المتاحة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => navigate('/users')}
            >
              <div className="flex flex-col items-center text-center p-2 w-full">
                <Users className="h-10 w-10 mb-2" />
                <div className="text-lg font-semibold">إدارة المستخدمين</div>
                <p className="text-sm text-muted-foreground mt-1">
                  إضافة، تعديل، وحذف المستخدمين وإدارة صلاحياتهم
                </p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start"
              onClick={() => navigate('/profile')}
            >
              <div className="flex flex-col items-center text-center p-2 w-full">
                <UserCog className="h-10 w-10 mb-2" />
                <div className="text-lg font-semibold">الملف الشخصي</div>
                <p className="text-sm text-muted-foreground mt-1">
                  تعديل بيانات الملف الشخصي وتغيير كلمة المرور
                </p>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
