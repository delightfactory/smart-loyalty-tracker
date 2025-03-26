
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  PieChart, 
  BarChart2, 
  CreditCard,
  Settings,
  Star
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const NavItem = ({ icon, label, href }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <NavLink to={href} className="block w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1",
          isActive && "bg-accent text-accent-foreground"
        )}
      >
        {icon}
        <span className="mr-3">{label}</span>
      </Button>
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const isMobile = useMobile();

  const navItems = [
    { icon: <Home className="ml-2 h-4 w-4" />, label: "الصفحة الرئيسية", href: "/" },
    { icon: <BarChart2 className="ml-2 h-4 w-4" />, label: "لوحة التحكم", href: "/dashboard" },
    { icon: <Package className="ml-2 h-4 w-4" />, label: "المنتجات", href: "/products" },
    { icon: <Users className="ml-2 h-4 w-4" />, label: "العملاء", href: "/customers" },
    { icon: <FileText className="ml-2 h-4 w-4" />, label: "الفواتير", href: "/invoices" },
    { icon: <CreditCard className="ml-2 h-4 w-4" />, label: "المدفوعات", href: "/create-payment" },
    { icon: <Star className="ml-2 h-4 w-4" />, label: "استبدال النقاط", href: "/create-redemption/C001" },
    { icon: <PieChart className="ml-2 h-4 w-4" />, label: "التحليلات", href: "/analytics" },
    { icon: <Settings className="ml-2 h-4 w-4" />, label: "الإعدادات", href: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 z-40 h-screen w-64 border-l bg-background p-4 transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        isMobile ? "shadow-lg" : ""
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between py-2">
          <h2 className="text-lg font-semibold">القائمة الرئيسية</h2>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              &times;
            </Button>
          )}
        </div>
        <Separator className="my-2" />
        <ScrollArea className="flex-1 pt-4">
          <nav className="flex flex-col">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
              />
            ))}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
};

export default Sidebar;
