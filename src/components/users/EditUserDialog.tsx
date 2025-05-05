import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile, getUserById, updateUserRoles } from '@/services/users-api';
import { UserProfile, UserRole } from '@/lib/auth-types';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import UserForm from './UserForm';
import UserRolesForm from './UserRolesForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
          title: 'Error fetching user',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUser();
    }
  }, [userId, isOpen, toast]);

  const updateProfileMutation = useMutation(updateUserProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'تم تحديث بيانات المستخدم بنجاح' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error updating user profile',
        description: error.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateRolesMutation = useMutation(
    () => updateUserRoles(userId, userRoles),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users', userId] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast({ title: 'تم تحديث صلاحيات المستخدم بنجاح' });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error updating user roles',
          description: error.message,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    }
  );

  const handleProfileUpdate = async (profileData: { fullName: string; phone?: string | null; position?: string | null }) => {
    if (!user) return;
    await updateProfileMutation.mutateAsync({ id: user.id, ...profileData });
  };

  const handleRolesUpdate = async (roles: UserRole[]) => {
    setUserRoles(roles);
    await updateRolesMutation.mutateAsync();
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
              <TabsTrigger value="roles">الصلاحيات</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <UserForm
                user={user}
                onSubmit={handleProfileUpdate}
                isLoading={updateProfileMutation.isLoading}
              />
            </TabsContent>

            <TabsContent value="roles">
              <UserRolesForm
                userId={userId}
                initialRoles={user.roles}
                onChange={handleRolesUpdate}
                isLoading={updateRolesMutation.isLoading}
              />
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
