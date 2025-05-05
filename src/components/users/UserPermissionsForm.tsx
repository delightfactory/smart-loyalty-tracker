
import React, { useEffect, useState } from 'react';
import { fetchAllPermissions, fetchUserPermissions } from '@/services/users-api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface UserPermissionsFormProps {
  userId: string;
  onChange: (perms: string[]) => void;
}

export default function UserPermissionsForm({ userId, onChange }: UserPermissionsFormProps) {
  const { toast } = useToast();
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      // تحميل جميع الصلاحيات المتاحة
      const perms = await fetchAllPermissions();
      setAllPerms(perms);
      
      // تحميل صلاحيات المستخدم الحالي
      const userPerms = await fetchUserPermissions(userId);
      setGranted(new Set(userPerms));
      onChange(userPerms);
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
    loadPermissions();
  }, [userId]);

  const toggle = (pid: string) => {
    setGranted(prev => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      onChange(Array.from(next));
      return next;
    });
  };

  // إضافة زر لإعادة تحميل الصلاحيات
  const handleRefresh = () => {
    loadPermissions();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>جاري تحميل الصلاحيات...</span>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">صلاحيات المستخدم</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <span>تحديث</span>
          <Loader2 className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {allPerms.length === 0 ? (
        <p className="text-muted-foreground">لا توجد صلاحيات متاحة</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          {allPerms.map(perm => (
            <label key={perm.id} className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
              <Checkbox 
                checked={granted.has(perm.id)} 
                onCheckedChange={() => toggle(perm.id)} 
                id={`perm-${perm.id}`}
              />
              <span className="mr-2">{perm.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
