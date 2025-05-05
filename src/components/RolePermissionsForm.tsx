import React, { useEffect, useState } from 'react';
import type { Permission } from '@/services/roles-api';
import { fetchAllPermissions, fetchRolePermissions, updateRolePermissions } from '@/services/roles-api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface RolePermissionsFormProps {
  roleId: string;
}

export default function RolePermissionsForm({ roleId }: RolePermissionsFormProps) {
  const { toast } = useToast();
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [perms, rolePerms] = await Promise.all([
          fetchAllPermissions(),
          fetchRolePermissions(roleId),
        ]);
        setAllPerms(perms);
        setGranted(new Set(rolePerms));
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'خطأ', description: e.message });
      }
    })();
  }, [roleId, toast]);

  const toggle = (pid: string) => {
    setGranted(prev => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateRolePermissions(roleId, Array.from(granted));
      toast({ title: 'تم حفظ صلاحيات الدور بنجاح' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'خطأ في الحفظ', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">صلاحيات الدور</h3>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {allPerms.map(perm => (
          <label key={perm.id} className="flex items-center space-x-2">
            <Checkbox
              checked={granted.has(perm.id)}
              onCheckedChange={() => toggle(perm.id)}
            />
            <span>{perm.name}</span>
          </label>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="mt-4">
        {saving ? 'جاري الحفظ...' : 'حفظ صلاحيات الدور'}
      </Button>
    </div>
  );
}
