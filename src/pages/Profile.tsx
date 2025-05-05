
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import PageContainer from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCurrentUserPassword } from '@/services/users-api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Shield, Key, Clock } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: 'كلمة المرور الحالية يجب أن تكون على الأقل 6 أحرف',
  }),
  newPassword: z.string().min(6, {
    message: 'كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف',
  }),
  confirmPassword: z.string().min(6, {
    message: 'تأكيد كلمة المرور يجب أن يكون على الأقل 6 أحرف',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handlePasswordChange = async (values: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      await updateCurrentUserPassword(values.currentPassword, values.newPassword);
      passwordForm.reset();
      
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تغيير كلمة المرور",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Get role display names for UI
  const getRoleDisplayName = (roleName: string): string => {
    const roleNames: Record<string, string> = {
      admin: "مدير النظام",
      manager: "مشرف",
      accountant: "محاسب",
      sales: "مبيعات",
      user: "مستخدم عادي",
    };
    
    return roleNames[roleName] || roleName;
  };
  
  // Get role badge color
  const getRoleBadgeColor = (roleName: string): string => {
    const badgeColors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 hover:bg-red-200",
      manager: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      accountant: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      sales: "bg-green-100 text-green-800 hover:bg-green-200",
      user: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };
    
    return badgeColors[roleName] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <PageContainer title="الملف الشخصي" subtitle="إدارة ملفك الشخصي وإعداداتك">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span>الملف الشخصي</span>
            </CardTitle>
            <CardDescription>عرض وتعديل معلومات ملفك الشخصي</CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfile />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <span>التفاصيل والإعدادات</span>
            </CardTitle>
            <CardDescription>تفاصيل حسابك ومعلوماتك الأخرى</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="account">معلومات الحساب</TabsTrigger>
                <TabsTrigger value="password">تغيير كلمة المرور</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">البيانات الشخصية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</div>
                          <div className="font-medium">{user?.email}</div>
                        </div>
                      
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">الاسم الكامل</div>
                          <div className="font-medium">{profile?.fullName || 'غير محدد'}</div>
                        </div>
                      
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">رقم الهاتف</div>
                          <div className="font-medium">{profile?.phone || 'غير محدد'}</div>
                        </div>
                      
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">المسمى الوظيفي</div>
                          <div className="font-medium">{profile?.position || 'غير محدد'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>الأدوار والصلاحيات</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">الأدوار المسندة</div>
                        <div className="flex flex-wrap gap-2">
                          {profile?.roles && profile.roles.length > 0 ? (
                            profile.roles.map((role, index) => (
                              <Badge 
                                key={index} 
                                className={getRoleBadgeColor(role.toLowerCase())}
                              >
                                {getRoleDisplayName(role)}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">لا توجد أدوار مخصصة</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>معلومات النشاط</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="text-sm font-medium text-muted-foreground">آخر تسجيل دخول</div>
                    <p>{user?.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleString('ar-EG') 
                      : 'غير متوفر'}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="password" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">تغيير كلمة المرور</CardTitle>
                    <CardDescription>
                      قم بتحديث كلمة المرور الخاصة بك. بعد تغيير كلمة المرور، سيتم تسجيل خروجك تلقائيًا.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور الحالية</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="أدخل كلمة المرور الحالية" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور الجديدة</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="أدخل كلمة المرور الجديدة" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأكيد كلمة المرور</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="أعد إدخال كلمة المرور الجديدة" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={isChangingPassword}>
                          {isChangingPassword && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                          تغيير كلمة المرور
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Profile;
