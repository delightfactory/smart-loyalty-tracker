import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { profile, user } = useAuth();
  
  return (
    <PageContainer title="الملف الشخصي" subtitle="إدارة ملفك الشخصي وإعداداتك">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
            <CardDescription>عرض وتعديل معلومات ملفك الشخصي</CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfile />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>التفاصيل</CardTitle>
            <CardDescription>تفاصيل حسابك ومعلوماتك الأخرى</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="account">معلومات الحساب</TabsTrigger>
                <TabsTrigger value="roles">الصلاحيات والأدوار</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</h3>
                    <p>{user?.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">الاسم الكامل</h3>
                    <p>{profile?.fullName || 'غير محدد'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">رقم الهاتف</h3>
                    <p>{profile?.phone || 'غير محدد'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">المسمى الوظيفي</h3>
                    <p>{profile?.position || 'غير محدد'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">آخر تسجيل دخول</h3>
                  <p>{user?.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleString('ar-EG') 
                    : 'غير متوفر'}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="roles" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">الأدوار المسندة</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile?.roles && profile.roles.length > 0 ? (
                        profile.roles.map(role => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">لا توجد أدوار مخصصة</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">وصف الأدوار</h3>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">admin</h4>
                        <p className="text-xs text-muted-foreground">
                          المسؤول الكامل عن النظام. يمكنه الوصول إلى جميع الميزات وإدارة المستخدمين.
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">manager</h4>
                        <p className="text-xs text-muted-foreground">
                          مدير النظام. يمكنه الوصول إلى معظم الميزات باستثناء إدارة المستخدمين.
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">accountant</h4>
                        <p className="text-xs text-muted-foreground">
                          محاسب النظام. يمكنه الوصول إلى الفواتير والمدفوعات والتقارير المالية.
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">sales</h4>
                        <p className="text-xs text-muted-foreground">
                          مندوب المبيعات. يمكنه الوصول إلى العملاء وإنشاء الفواتير وعمليات استبدال النقاط.
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">user</h4>
                        <p className="text-xs text-muted-foreground">
                          مستخدم عادي. يمكنه الوصول إلى الميزات الأساسية فقط.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Profile;
