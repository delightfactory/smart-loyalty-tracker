
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/lib/auth-types';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Shield, User, Key, UserCog } from 'lucide-react';

export const UserMenu = () => {
  const { user, profile, signOut, hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const nameInitials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || 'UN';
  
  if (!isAuthenticated) {
    return (
      <Button onClick={() => navigate('/auth')} variant="secondary">
        تسجيل الدخول
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatarUrl || ''} />
            <AvatarFallback>{nameInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>حسابي</DropdownMenuLabel>
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
          {profile?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>الملف الشخصي</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>الإعدادات</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => { 
            navigate('/settings'); 
            setTimeout(() => document.querySelector('[data-value="security"]')?.click(), 100);
          }} className="cursor-pointer">
            <Key className="mr-2 h-4 w-4" />
            <span>تغيير كلمة المرور</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        {hasRole(UserRole.ADMIN) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/users')} className="cursor-pointer">
                <UserCog className="mr-2 h-4 w-4" />
                <span>إدارة المستخدمين</span>
              </DropdownMenuItem>
              
              {hasRole(UserRole.ADMIN) && (
                <DropdownMenuItem onClick={() => navigate('/settings?tab=users')} className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>إعدادات النظام</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            signOut();
            navigate('/auth');
          }} 
          className="cursor-pointer text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
