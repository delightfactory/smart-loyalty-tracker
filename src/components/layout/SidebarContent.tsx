
import { useAuth } from '@/hooks/useAuth';
import SidebarLink from './SidebarLink';
import { UserRole } from '@/lib/auth-types';
import { 
  BarChartBig, 
  ClipboardCheck, 
  Cog, 
  FileSpreadsheet, 
  Home, 
  Package, 
  Receipt, 
  ShoppingCart,
  Users
} from 'lucide-react';

interface SidebarContentProps {
  isSidebarOpen: boolean;
}

const SidebarContent = ({ isSidebarOpen }: SidebarContentProps) => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  
  return (
    <div className="flex flex-col gap-1">
      <SidebarLink href="/dashboard" icon={<Home />} label="لوحة التحكم" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/products" icon={<Package />} label="المنتجات" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/customers" icon={<ShoppingCart />} label="العملاء" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/customer-followup" icon={<ClipboardCheck />} label="متابعة العملاء" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/invoices" icon={<Receipt />} label="الفواتير" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/create-invoice" icon={<FileSpreadsheet />} label="إنشاء فاتورة" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/analytics" icon={<BarChartBig />} label="التحليلات" isSidebarOpen={isSidebarOpen} />
      {isAdmin && <SidebarLink href="/users" icon={<Users />} label="إدارة المستخدمين" isSidebarOpen={isSidebarOpen} />}
      <SidebarLink href="/settings" icon={<Cog />} label="الإعدادات" isSidebarOpen={isSidebarOpen} />
    </div>
  );
};

export default SidebarContent;
