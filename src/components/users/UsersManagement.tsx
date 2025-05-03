
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersList } from './UsersList';
import { UserRolesList } from './UserRolesList';

export function UsersManagement() {
  const [activeTab, setActiveTab] = useState<string>('users');

  return (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b px-4">
          <TabsList className="w-full justify-start h-14">
            <TabsTrigger value="users" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-base py-4">
              قائمة المستخدمين
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-base py-4">
              الصلاحيات والأدوار
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="p-6">
          <TabsContent value="users" className="mt-0">
            <UsersList />
          </TabsContent>
          
          <TabsContent value="roles" className="mt-0">
            <UserRolesList />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
