
import React, { useEffect, useState } from 'react';
import { fetchAllPermissions, fetchUserPermissions, updateUserPermissions } from '@/services/users-api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface UserPermissionsFormProps {
  userId: string;
  onSuccess?: () => void;
}

export default function UserPermissionsForm({ userId, onSuccess }: UserPermissionsFormProps) {
  const { toast } = useToast();
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      // تحميل جميع الصلاحيات المتاحة
      const perms = await fetchAllPermissions();
      setAllPerms(perms);
      
      // تحميل صلاحيات المستخدم الحالي
      const userPerms = await fetchUserPermissions(userId);
      setGranted(new Set(userPerms));
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      toast({ 
        variant: 'destructive', 
        title: 'خطأ في جلب الصلاحيات', 
        description: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadPermissions();
    }
  }, [userId]);

  const toggle = (pid: string) => {
    setGranted(prev => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      await updateUserPermissions(userId, Array.from(granted));
      toast({
        title: "تم حفظ الصلاحيات",
        description: "تم حفظ صلاحيات المستخدم بنجاح",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الصلاحيات",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // إضافة زر لإعادة تحميل الصلاحيات
  const handleRefresh = () => {
    loadPermissions();
  };

  // تنظيم الصلاحيات في مجموعات منطقية
  const groupPermissions = (permissions: Permission[]) => {
    const groups: Record<string, Permission[]> = {};
    
    permissions.forEach(perm => {
      // استخراج اسم المجموعة من اسم الصلاحية (مثال: "customer.view" -> "customer")
      const groupName = perm.name.split('.')[0] || 'general';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(perm);
    });
    
    return groups;
  };

  const permissionGroups = groupPermissions(allPerms);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>جاري تحميل الصلاحيات...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">صلاحيات المستخدم</CardTitle>
          <CardDescription>إدارة الصلاحيات المباشرة للمستخدم</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <span>تحديث</span>
          <Loader2 className="h-3 w-3 mr-1" />
        </Button>
      </CardHeader>

      <CardContent>
        {allPerms.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <Shield className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد صلاحيات متاحة</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(permissionGroups).map(([groupName, permissions]) => (
              <div key={groupName} className="space-y-2">
                <h3 className="font-semibold capitalize text-md border-b pb-1">{groupName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  {permissions.map(perm => (
                    <label key={perm.id} className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse cursor-pointer">
                      <Checkbox 
                        checked={granted.has(perm.id)} 
                        onCheckedChange={() => toggle(perm.id)} 
                        id={`perm-${perm.id}`}
                      />
                      <div className="mr-2 space-y-0.5">
                        <span className="font-medium text-sm">{perm.name}</span>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ الصلاحيات
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
