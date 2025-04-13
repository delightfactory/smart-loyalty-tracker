
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

const SidebarContent = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  
  return (
    <div className="flex flex-col gap-1">
      <SidebarLink to="/dashboard" icon={<Home />}>لوحة التحكم</SidebarLink>
      <SidebarLink to="/products" icon={<Package />}>المنتجات</SidebarLink>
      <SidebarLink to="/customers" icon={<ShoppingCart />}>العملاء</SidebarLink>
      <SidebarLink to="/customer-followup" icon={<ClipboardCheck />}>متابعة العملاء</SidebarLink>
      <SidebarLink to="/invoices" icon={<Receipt />}>الفواتير</SidebarLink>
      <SidebarLink to="/create-invoice" icon={<FileSpreadsheet />}>إنشاء فاتورة</SidebarLink>
      <SidebarLink to="/analytics" icon={<BarChartBig />}>التحليلات</SidebarLink>
      {isAdmin && <SidebarLink to="/users" icon={<Users />}>إدارة المستخدمين</SidebarLink>}
      <SidebarLink to="/settings" icon={<Cog />}>الإعدادات</SidebarLink>
    </div>
  );
};

export default SidebarContent;
