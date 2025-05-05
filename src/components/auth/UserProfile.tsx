
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/services/users-api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PencilLine, User } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  fullName: z.string().min(2, {
    message: 'يجب أن يكون الاسم أكثر من حرفين',
  }),
  phone: z.string().optional(),
  position: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const UserProfile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      position: profile?.position || '',
      avatarUrl: profile?.avatarUrl || '',
    }
  });
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile({
        id: profile.id,
        fullName: data.fullName,
        phone: data.phone || null,
        position: data.position || null
      });
      
      // Refresh the profile to get updated data
      if (refreshProfile) {
        await refreshProfile();
      }
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الشخصي بنجاح",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to generate user initials for the avatar
  const getInitials = (name?: string): string => {
    if (!name) return 'UN';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.fullName} />
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {getInitials(profile?.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{profile?.fullName || user?.email}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {profile?.position && (
            <p className="text-xs text-muted-foreground mt-1">{profile.position}</p>
          )}
        </div>
      </div>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
            <PencilLine className="h-4 w-4" />
            تعديل الملف الشخصي
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            <DialogDescription>
              قم بتحديث معلومات ملفك الشخصي
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل اسمك الكامل" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل رقم هاتفك" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل المسمى الوظيفي" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الصورة الشخصية</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أدخل رابط الصورة الشخصية" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
