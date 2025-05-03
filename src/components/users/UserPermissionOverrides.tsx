
import React, { useEffect, useState } from 'react';
import {
  getAllUsers,
  getUserById
} from '@/services/users-api';
import {
  getAllPermissions,
  getPermissionsForUser,
  setPermissionsForUser
} from '@/services/roles-permissions-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/lib/auth-types';

// واجهة إدارة صلاحيات المستخدمين الفردية
export default function UserPermissionOverrides() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // جلب المستخدمين والصلاحيات عند أول تحميل
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [usersData, permissionsData] = await Promise.all([
          getAllUsers(),
          getAllPermissions()
        ]);
        setUsers(usersData);
        setPermissions(permissionsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل بيانات المستخدمين والصلاحيات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [toast]);

  // عند اختيار مستخدم
  const handleSelectUser = async (user: any) => {
    if (!user || !user.id) {
      setSelectedUser(null);
      setUserPerms([]);
      return;
    }
    
    setSelectedUser(user);
    setLoading(true);
    
    try {
      // جلب بيانات المستخدم مع الأدوار والصلاحيات
      const userData = await getUserById(user.id);
      if (userData) {
        // جلب الصلاحيات الفردية للمستخدم
        const perms = await getPermissionsForUser(user.id);
        setUserPerms(perms.map((p: any) => p.id || p.permission_id || ''));
      }
    } catch (err) {
      console.error("Error fetching user permissions:", err);
      toast({
        title: "خطأ في تحميل صلاحيات المستخدم",
        description: "حدث خطأ أثناء تحميل صلاحيات المستخدم",
        variant: "destructive"
      });
      setUserPerms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUser || !selectedUser.id) return;
    
    setSaveLoading(true);
    
    try {
      await setPermissionsForUser(selectedUser.id, userPerms);
      toast({
        title: "تم حفظ صلاحيات المستخدم بنجاح",
        description: `تم تحديث الصلاحيات الفردية للمستخدم ${selectedUser.fullName}`,
      });
    } catch (error) {
      console.error("Error saving user permissions:", error);
      toast({
        title: "خطأ في حفظ صلاحيات المستخدم",
        description: "حدث خطأ أثناء حفظ صلاحيات المستخدم",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // تصفية المستخدمين حسب البحث
  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // عرض اسم الدور بشكل مناسب
  const getRoleDisplay = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN: return "مدير";
      case UserRole.MANAGER: return "مشرف";
      case UserRole.ACCOUNTANT: return "محاسب";
      case UserRole.SALES: return "مبيعات";
      case UserRole.USER: return "مستخدم عادي";
      default: return "مستخدم عادي";
    }
  };

  // الحصول على الحرفين الأولين من اسم المستخدم للأفاتار
  const getUserInitials = (fullName: string): string => {
    if (!fullName) return "؟؟";
    
    const nameParts = fullName.split(' ');
    if (nameParts.length === 1) return fullName.substring(0, 2).toUpperCase();
    
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">إدارة صلاحيات المستخدمين الفردية</h2>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث عن مستخدم بالاسم أو البريد..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="pr-8"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 border rounded-md h-[400px] overflow-hidden">
            <ScrollArea className="h-full">
              {loading && !users.length ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
                  <span>جاري تحميل المستخدمين...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  {search ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمين"}
                </div>
              ) : (
                <ul className="p-0">
                  {filteredUsers.map(user => (
                    <li 
                      key={user.id} 
                      className={`p-3 cursor-pointer border-b hover:bg-muted/50 transition-colors ${selectedUser?.id === user.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || ''} />
                          <AvatarFallback>{getUserInitials(user.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.fullName || 'بدون اسم'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.roles && user.roles.map((role: string, index: number) => (
                              <Badge 
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {getRoleDisplay(role as UserRole)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>
          
          <div className="flex-1">
            {selectedUser ? (
              <>
                <div className="mb-4 p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedUser.avatarUrl || ''} alt={selectedUser.fullName || ''} />
                      <AvatarFallback>{getUserInitials(selectedUser.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedUser.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedUser.roles && selectedUser.roles.map((role: string, index: number) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {getRoleDisplay(role as UserRole)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-36">
                    <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
                    <span>جاري تحميل الصلاحيات...</span>
                  </div>
                ) : (
                  <>
                    <h4 className="font-medium mb-2">الصلاحيات الفردية للمستخدم</h4>
                    <div className="border rounded-md p-4 mb-4 max-h-[250px] overflow-y-auto">
                      {permissions.length === 0 ? (
                        <p className="text-muted-foreground text-center">لا توجد صلاحيات متاحة</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {permissions.map(perm => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`perm-${perm.id}`}
                                checked={userPerms.includes(perm.id)}
                                onCheckedChange={checked => {
                                  if (checked) {
                                    setUserPerms([...userPerms, perm.id]);
                                  } else {
                                    setUserPerms(userPerms.filter(pid => pid !== perm.id));
                                  }
                                }}
                              />
                              <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer">
                                {perm.name}
                                {perm.description && (
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={saveLoading}>
                        {saveLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        حفظ الصلاحيات
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center border rounded-md bg-muted/30">
                <div className="text-muted-foreground mb-2">
                  قم باختيار مستخدم من القائمة لإدارة صلاحياته الفردية
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
