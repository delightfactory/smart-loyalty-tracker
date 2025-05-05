
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRoles, fetchAllPermissions, fetchRolePermissions, updateRolePermissions, Role, Permission } from '@/services/roles-api';
import PageContainer from '@/components/layout/PageContainer';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function RoleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Subscribe to realtime updates for role-related tables
  useRealtimeSubscription(['roles', 'role_permissions', 'permissions']);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  
  // Get role data
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchAllRoles,
  });

  // Get all available permissions
  const { data: allPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: fetchAllPermissions,
  });

  // Get permissions assigned to this role
  const { data: rolePermissions = [], isLoading: rolePermissionsLoading, refetch } = useQuery({
    queryKey: ['role-permissions', id],
    queryFn: () => id ? fetchRolePermissions(id) : Promise.resolve([]),
    enabled: !!id,
  });

  const role = roles.find((r) => r.id === id);
  
  // Update selected permissions when role permissions load
  useEffect(() => {
    if (rolePermissions.length > 0) {
      setSelectedPermissions(new Set(rolePermissions));
    }
  }, [rolePermissions]);

  // Filter permissions based on search term
  const filteredPermissions = allPermissions.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group permissions by category (based on prefix)
  const groupedPermissions = filteredPermissions.reduce((groups: Record<string, Permission[]>, permission) => {
    // Extract category from permission name (e.g., "user.create" -> "user")
    const category = permission.name.split('.')[0] || 'other';
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {});

  const handleTogglePermission = (permissionId: string) => {
    const newSelectedPermissions = new Set(selectedPermissions);
    
    if (newSelectedPermissions.has(permissionId)) {
      newSelectedPermissions.delete(permissionId);
    } else {
      newSelectedPermissions.add(permissionId);
    }
    
    setSelectedPermissions(newSelectedPermissions);
  };

  const handleSavePermissions = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      await updateRolePermissions(id, Array.from(selectedPermissions));
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث صلاحيات الدور",
      });
      
      // Refresh the data
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ الصلاحيات",
      });
    } finally {
      setSaving(false);
    }
  };

  const isLoading = rolesLoading || permissionsLoading || rolePermissionsLoading;

  if (isLoading) {
    return (
      <PageContainer title="إدارة الدور">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!role) {
    return (
      <PageContainer title="الدور غير موجود">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <ShieldX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">الدور المطلوب غير موجود</h3>
              <p className="text-muted-foreground mb-6">لا يمكن العثور على الدور المحدد</p>
              <Button onClick={() => navigate('/roles')}>العودة إلى قائمة الأدوار</Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      title={`إدارة دور: ${role.name}`} 
      subtitle={role.description || 'إدارة صلاحيات الدور'}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>{role.name}</span>
                  <Badge className="mr-2">{(selectedPermissions?.size || 0)} صلاحية</Badge>
                </CardTitle>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="بحث عن صلاحية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.keys(groupedPermissions).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لم يتم العثور على صلاحيات مطابقة لبحثك
                  </div>
                )}
                
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold capitalize text-lg flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1 text-primary" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-3 space-x-reverse border rounded-md px-3 py-2 hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={() => handleTogglePermission(permission.id)}
                          />
                          <div className="grid gap-0.5">
                            <label
                              htmlFor={permission.id}
                              className="font-medium cursor-pointer text-sm"
                            >
                              {permission.name}
                            </label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/roles')}
            >
              العودة
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : (
                'حفظ الصلاحيات'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
