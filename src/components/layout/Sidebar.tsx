
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  ChevronLeft,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    label: 'لوحة التحكم',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'المنتجات',
    href: '/products',
    icon: Package,
  },
  {
    label: 'العملاء',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'الفواتير',
    href: '/invoices',
    icon: FileText,
  },
  {
    label: 'التحليلات',
    href: '/analytics',
    icon: BarChart,
  },
  {
    label: 'الإعدادات',
    href: '/settings',
    icon: Settings,
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "h-screen flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              L
            </div>
            <h1 className="text-xl font-bold text-white">نظام الولاء</h1>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)} 
          className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex-grow py-4 overflow-y-auto scrollbar-none">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <Users size={16} className="text-sidebar-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">admin@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
