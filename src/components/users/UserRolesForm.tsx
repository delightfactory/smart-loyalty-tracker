
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRoles } from '@/services/roles-api';
import { UserRole } from '@/lib/auth-types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  };

  const handleSaveRoles = () => {
    onChange(selectedRoles);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN: return "bg-red-100 text-red-800 hover:bg-red-200";
      case UserRole.MANAGER: return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case UserRole.ACCOUNTANT: return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case UserRole.SALES: return "bg-green-100 text-green-800 hover:bg-green-200";
      case UserRole.USER: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default: return "";
    }
  };

  if (rolesLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          جاري تحميل الأدوار...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">أدوار المستخدم</CardTitle>
        <CardDescription>
          حدد الأدوار التي سيتم منحها للمستخدم. كل دور يحتوي على مجموعة من الصلاحيات.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {selectedRoles.length > 0 ? (
              selectedRoles.map((role) => (
                <Badge 
                  key={role} 
                  className={getRoleBadgeColor(role)}
                >
                  {getRoleDisplayName(role)}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="bg-gray-100">
                لم يتم تحديد أي أدوار
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-4 border rounded-lg p-3">
          {allRoles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.name as UserRole)}
                  onCheckedChange={(checked) => 
                    handleRoleToggle(role.name, checked === true)
                  }
                />
                <div className="mr-2">
                  <label
                    htmlFor={`role-${role.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {getRoleDisplayName(role.name)}
                  </label>
                  {role.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={getRoleBadgeColor(role.name)}
              >
                {role.name}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button 
          onClick={handleSaveRoles}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          حفظ الأدوار
        </Button>
      </CardFooter>
    </Card>
  );
}
