import React, { useState } from 'react';
import {
  getAllUsers,
} from '@/services/users-api';
import {
  getAllPermissions,
  getPermissionsForUser,
  setPermissionsForUser
} from '@/services/roles-permissions-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// واجهة إدارة صلاحيات المستخدمين الفردية
export default function UserPermissionOverrides() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // جلب المستخدمين والصلاحيات عند أول تحميل
  React.useEffect(() => {
    getAllUsers().then(setUsers);
    getAllPermissions().then(setPermissions);
  }, []);

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
      const perms = await getPermissionsForUser(user.id);
      setUserPerms(perms.map((p: any) => p.id || p.permission_id));
    } catch (err) {
      setUserPerms([]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedUser || !selectedUser.id) return;
    setLoading(true);
    await setPermissionsForUser(selectedUser.id, userPerms);
    setLoading(false);
    alert('تم حفظ صلاحيات المستخدم بنجاح');
  };

  // تصفية المستخدمين حسب البحث
  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 border rounded bg-white mt-8">
      <h3 className="text-lg font-semibold mb-2">إدارة صلاحيات المستخدمين الفردية</h3>
      <div className="mb-4 flex gap-2">
        <Input placeholder="بحث عن مستخدم بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="flex gap-8">
        <div className="w-1/3 max-h-72 overflow-y-auto border rounded">
          <ul>
            {filteredUsers.map(user => (
              <li key={user.id} className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user.id ? 'bg-gray-200' : ''}`}
                onClick={() => handleSelectUser(user)}>
                <div className="font-bold">{user.full_name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          {selectedUser && (
            <>
              <div className="mb-4">
                <span className="font-semibold">المستخدم:</span> {selectedUser.full_name} ({selectedUser.email})
              </div>
              {loading ? (
                <div>جاري التحميل...</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {permissions.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={userPerms.includes(perm.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setUserPerms([...userPerms, perm.id]);
                          } else {
                            setUserPerms(userPerms.filter(pid => pid !== perm.id));
                          }
                        }}
                      />
                      <span>{perm.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <Button className="mt-4" onClick={handleSave} disabled={loading}>حفظ الصلاحيات</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
