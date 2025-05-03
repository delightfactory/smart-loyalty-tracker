
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/services/users-api';
import { useToast } from '@/components/ui/use-toast';
import { UserRole, convertRolesToUserRoles, isUserRoleArray } from '@/lib/auth-types';
import { Role } from '@/lib/auth-rbac-types'; // Add this import for Role type

export const UserProfile = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    position: profile?.position || '',
    avatarUrl: profile?.avatarUrl || '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      // Convert Role[] to UserRole[] when updating the profile
      const userRoles: UserRole[] = profile.roles ? 
        (isUserRoleArray(profile.roles) ? 
          profile.roles as UserRole[] : 
          convertRolesToUserRoles(profile.roles as Role[])
        ) : [];
        
      await updateUserProfile({
        id: profile.id,
        fullName: formData.fullName,
        email: profile.email || user?.email || '',
        phone: formData.phone,
        position: formData.position,
        avatarUrl: formData.avatarUrl,
        roles: userRoles,
        customPermissions: []
      });
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الشخصي بنجاح",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const nameInitials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || 'UN';
  
  // Get the first role name as a string for display purposes
  const displayPosition = profile?.position || 
    (profile?.roles && profile.roles.length > 0 ? 
      profile.roles[0].name : 'مستخدم');
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile?.avatarUrl || ''} />
          <AvatarFallback>{nameInitials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile?.fullName || user?.email}</p>
          <p className="text-sm text-muted-foreground">
            {displayPosition}
          </p>
        </div>
      </div>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">تعديل الملف الشخصي</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            <DialogDescription>
              قم بتحديث معلومات ملفك الشخصي
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="الاسم الكامل"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="رقم الهاتف"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">المسمى الوظيفي</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="المسمى الوظيفي"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">رابط الصورة الشخصية</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="رابط الصورة الشخصية"
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">حفظ التغييرات</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
