
import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  PieChart, 
  CreditCard,
  Settings,
  Star,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  UserRoundCheck
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/components/ui/theme-provider';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  notificationCount?: number;
}

const NavItem = ({ icon, label, href, badge, notificationCount }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to={href} className="block w-full">
            <Button
              variant="ghost"
              size="default"
              className={cn(
                "w-full justify-start mb-1 transition-all duration-200 relative group overflow-hidden",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"
              )}
            >
              <span className={cn(
                "absolute inset-0 opacity-0 bg-sidebar-primary/10 transition-opacity",
                "group-hover:opacity-100"
              )}></span>
              <span className="flex items-center">
                {icon}
                <span className="mr-3">{label}</span>
              </span>
              
              {badge && (
                <Badge variant="outline" className="mr-auto">
                  {badge}
                </Badge>
              )}
              
              {notificationCount && (
                <Badge variant="default" className="mr-auto h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-normal">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const isMobile = useIsMobile();
  const [hovering, setHovering] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const navItems = [
    { icon: <Home className="ml-2 h-4 w-4" />, label: "الصفحة الرئيسية", href: "/" },
    { icon: <BarChart2 className="ml-2 h-4 w-4" />, label: "لوحة التحكم", href: "/dashboard" },
    { icon: <Package className="ml-2 h-4 w-4" />, label: "المنتجات", href: "/products", badge: "25" },
    { icon: <Users className="ml-2 h-4 w-4" />, label: "العملاء", href: "/customers" },
    { icon: <UserRoundCheck className="ml-2 h-4 w-4" />, label: "متابعة العملاء", href: "/customer-followup", notificationCount: 8 },
    { icon: <FileText className="ml-2 h-4 w-4" />, label: "الفواتير", href: "/invoices" },
    { icon: <CreditCard className="ml-2 h-4 w-4" />, label: "المدفوعات", href: "/create-payment" },
    { icon: <Star className="ml-2 h-4 w-4" />, label: "استبدال النقاط", href: "/create-redemption/C001" },
    { icon: <PieChart className="ml-2 h-4 w-4" />, label: "التحليلات", href: "/analytics" },
    { icon: <Settings className="ml-2 h-4 w-4" />, label: "الإعدادات", href: "/settings" },
  ];

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen, onClose]);

  // Active section based on current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/customers') || path.includes('/customer-followup')) return 'customers';
    if (path.includes('/invoices') || path.includes('/create-invoice')) return 'sales';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "fixed right-0 top-0 z-40 h-screen w-64 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0 md:w-16 md:hover:w-64",
        isMobile ? "shadow-lg border-l" : "border-l",
        theme === 'dark' ? 'bg-sidebar' : 'bg-background'
      )}
      onMouseEnter={() => !isMobile && setHovering(true)}
      onMouseLeave={() => !isMobile && setHovering(false)}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between py-4 px-4">
          <h2 className={cn(
            "text-lg font-semibold transition-opacity duration-200",
            (!isOpen && !hovering && !isMobile) ? "opacity-0" : "opacity-100"
          )}>
            القائمة الرئيسية
          </h2>
          
          {/* Toggle Button for Mobile */}
          {isMobile ? (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className={cn(
                "h-8 w-8 p-0 transition-opacity duration-200",
                (!isOpen && !hovering) ? "opacity-0" : "opacity-100"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Separator className="my-2" />
        
        <ScrollArea className="flex-1 overflow-auto px-3">
          <nav className="flex flex-col space-y-1 py-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                badge={item.badge}
                notificationCount={item.notificationCount}
              />
            ))}
          </nav>
        </ScrollArea>
        
        <div className="mt-auto p-4">
          <Separator className="my-2" />
          <div className={cn(
            "flex items-center justify-between transition-opacity duration-200",
            (!isOpen && !hovering && !isMobile) ? "opacity-0" : "opacity-100"
          )}>
            <div className="text-xs text-muted-foreground">
              الإصدار 1.2.0
            </div>
            <Button variant="outline" size="sm" onClick={() => {}} className="h-8">
              <span className="ml-2">المساعدة</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
