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

  useEffect(() => {
    (async () => {
      try {
        const perms = await fetchAllPermissions();
        setAllPerms(perms);
        const userPerms = await fetchUserPermissions(userId);
        setGranted(new Set(userPerms));
        onChange(userPerms);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'خطأ في جلب الصلاحيات', description: error.message });
      }
    })();
  }, [userId, onChange]);

  const toggle = (pid: string) => {
    setGranted(prev => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      onChange(Array.from(next));
      return next;
    });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">صلاحيات المستخدم</h3>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {allPerms.map(perm => (
          <label key={perm.id} className="flex items-center space-x-2">
            <Checkbox checked={granted.has(perm.id)} onCheckedChange={() => toggle(perm.id)} />
            <span>{perm.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
