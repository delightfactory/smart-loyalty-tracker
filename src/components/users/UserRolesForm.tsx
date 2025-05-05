
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRoles } from '@/services/roles-api';
import { UserRole } from '@/lib/auth-types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface UserRolesFormProps {
  userId: string;
  initialRoles: UserRole[];
  onChange: (roles: UserRole[]) => void;
  isLoading: boolean;
}

export default function UserRolesForm({ userId, initialRoles, onChange, isLoading }: UserRolesFormProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(initialRoles || []);
  
  // Fetch all available roles
  const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchAllRoles
  });

  useEffect(() => {
    setSelectedRoles(initialRoles || []);
  }, [initialRoles]);

  const handleRoleToggle = (role: string, isChecked: boolean) => {
    const updatedRoles = isChecked
      ? [...selectedRoles, role as UserRole]
      : selectedRoles.filter(r => r !== role);
      
    setSelectedRoles(updatedRoles);
    onChange(updatedRoles);
  };

  // Role display names for UI
  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case UserRole.ADMIN: return "مدير النظام";
      case UserRole.MANAGER: return "مشرف";
      case UserRole.ACCOUNTANT: return "محاسب";
      case UserRole.SALES: return "مبيعات";
      case UserRole.USER: return "مستخدم عادي";
      default: return role;
    }
  };

  if (rolesLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        جاري تحميل الأدوار...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        اختر الصلاحيات التي تريد منحها للمستخدم:
      </p>
      
      <div className="space-y-2">
        {allRoles.map((role) => (
          <div key={role.id} className="flex items-center space-x-2">
            <Checkbox
              id={`role-${role.id}`}
              checked={selectedRoles.includes(role.name as UserRole)}
              onCheckedChange={(checked) => 
                handleRoleToggle(role.name, checked === true)
              }
            />
            <label
              htmlFor={`role-${role.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-2"
            >
              {getRoleDisplayName(role.name)}
            </label>
          </div>
        ))}
      </div>
      
      <Button 
        type="button" 
        disabled={isLoading}
        className="w-full mt-4"
        onClick={() => onChange(selectedRoles)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        حفظ الصلاحيات
      </Button>
    </div>
  );
}
