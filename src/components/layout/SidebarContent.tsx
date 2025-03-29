import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import SidebarLink from './SidebarLink';
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  CreditCard,
  Settings,
  Star,
  BarChart2,
  UserRoundCheck,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarContentProps {
  isSidebarOpen: boolean;
}

const SidebarContent = ({ isSidebarOpen }: SidebarContentProps) => {
  const navItems = [
    { icon: <BarChart2 className="ml-2 h-4 w-4" />, label: "لوحة التحكم", href: "/dashboard" },
    { icon: <Package className="ml-2 h-4 w-4" />, label: "المنتجات", href: "/products", badge: "25" },
    { icon: <Users className="ml-2 h-4 w-4" />, label: "العملاء", href: "/customers" },
    { icon: <UserRoundCheck className="ml-2 h-4 w-4" />, label: "متابعة العملاء", href: "/customer-followup", notificationCount: 8 },
    { icon: <FileText className="ml-2 h-4 w-4" />, label: "الفواتير", href: "/invoices" },
    { icon: <CreditCard className="ml-2 h-4 w-4" />, label: "المدفوعات", href: "/create-payment" },
    { icon: <Star className="ml-2 h-4 w-4" />, label: "استبدال النقاط", href: "/create-redemption/C001" },
    { icon: <UserCog className="ml-2 h-4 w-4" />, label: "إدارة المستخدمين", href: "/users" },
    { icon: <Settings className="ml-2 h-4 w-4" />, label: "الإعدادات", href: "/settings" },
  ];

  return (
    <>
      <div className={cn(
        "flex items-center justify-between py-4 px-4",
        !isSidebarOpen && "opacity-0"
      )}>
        <h2 className="text-lg font-semibold transition-opacity duration-200">
          نظام العناية بالسيارات
        </h2>
      </div>
      
      <Separator className="my-2" />
      
      <ScrollArea className="flex-1 overflow-auto px-3">
        <nav className="flex flex-col space-y-1 py-2">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              badge={item.badge}
              notificationCount={item.notificationCount}
              isSidebarOpen={isSidebarOpen}
            />
          ))}
        </nav>
      </ScrollArea>
      
      <div className="mt-auto p-4">
        <Separator className="my-2" />
        <div className={cn(
          "flex items-center justify-between transition-opacity duration-200",
          !isSidebarOpen && "opacity-0"
        )}>
          <div className="text-xs text-muted-foreground">
            الإصدار 1.2.0
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarContent;
