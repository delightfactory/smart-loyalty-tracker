
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile, getUserById, updateUserRoles } from '@/services/users-api';
import { UserProfile, UserRole } from '@/lib/auth-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import UserForm from './UserForm';
import UserRolesForm from './UserRolesForm';
import UserPermissionsForm from './UserPermissionsForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface EditUserDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserDialog({ userId, isOpen, onClose }: EditUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        setUserRoles(userData?.roles || []);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'خطأ في جلب بيانات المستخدم',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && userId) {
      fetchUser();
    }
  }, [userId, isOpen, toast]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profile: { id: string; fullName: string; phone?: string | null; position?: string | null }) => {
      await updateUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'تم تحديث بيانات المستخدم بنجاح' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ في تحديث بيانات المستخدم',
        description: error.message,
      });
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: async (roles: UserRole[]) => {
      await updateUserRoles(userId, roles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'تم تحديث صلاحيات المستخدم بنجاح' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'خطأ في تحديث صلاحيات المستخدم',
        description: error.message,
      });
    },
  });

  const handleProfileUpdate = async (profileData: { fullName: string; phone?: string | null; position?: string | null }) => {
    if (!user) return;
    await updateProfileMutation.mutateAsync({ id: user.id, ...profileData });
  };

  const handleRolesUpdate = async (roles: UserRole[]) => {
    setUserRoles(roles);
    await updateRolesMutation.mutateAsync(roles);
  };

  const handlePermissionsUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['users', userId] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['permissions'] });
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'كلمة المرور قصيرة جداً',
        description: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      // Update user password using Supabase admin API
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) throw error;

      toast({
        title: 'تم تغيير كلمة المرور',
        description: 'تم تغيير كلمة المرور للمستخدم بنجاح',
      });
      
      setNewPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ في تغيير كلمة المرور',
        description: error.message || 'حدث خطأ أثناء تغيير كلمة المرور',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري تحميل بيانات المستخدم...
          </div>
        ) : user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
              <TabsTrigger value="roles">الأدوار</TabsTrigger>
              <TabsTrigger value="permissions">الصلاحيات المباشرة</TabsTrigger>
              <TabsTrigger value="security">الأمان</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <UserForm
                user={user}
                onSubmit={handleProfileUpdate}
                isLoading={updateProfileMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <UserRolesForm
                userId={userId}
                initialRoles={user.roles}
                onChange={handleRolesUpdate}
                isLoading={updateRolesMutation.isPending}
              />
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <UserPermissionsForm 
                userId={userId}
                onSuccess={handlePermissionsUpdated}
              />
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">تغيير كلمة المرور</CardTitle>
                  <CardDescription>
                    يمكنك تعيين كلمة مرور جديدة للمستخدم
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                      <Input 
                        id="new-password"
                        type="password" 
                        placeholder="كلمة المرور الجديدة" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="max-w-sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        يجب أن تكون كلمة المرور 6 أحرف على الأقل
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={!newPassword || newPassword.length < 6 || isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري تغيير كلمة المرور...
                      </>
                    ) : (
                      'تعيين كلمة المرور'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            لم يتم العثور على المستخدم
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
