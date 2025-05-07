import SidebarLink from './SidebarLink';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/auth-types';
import { 
  Home,
  Box,
  Users,
  ListChecks,
  FileText,
  PlusSquare,
  BarChart,
  CreditCard,
  Gift,
  UserPlus,
  ShieldCheck,
  Settings
} from 'lucide-react';

interface SidebarContentProps {
  isSidebarOpen: boolean;
}

const SidebarContent = ({ isSidebarOpen }: SidebarContentProps) => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  
  return (
    <div className="flex flex-col gap-1">
      <SidebarLink href="/dashboard" icon={<Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />} label="لوحة التحكم" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/products" icon={<Box className="w-6 h-6 text-green-600 dark:text-green-400" />} label="المنتجات" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/customers" icon={<Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />} label="العملاء" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/customer-followup" icon={<ListChecks className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />} label="متابعة العملاء" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/invoices" icon={<FileText className="w-6 h-6 text-red-600 dark:text-red-400" />} label="الفواتير" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/create-invoice" icon={<PlusSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />} label="إنشاء فاتورة" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/analytics" icon={<BarChart className="w-6 h-6 text-pink-600 dark:text-pink-400" />} label="التحليلات" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/payments" icon={<CreditCard className="w-6 h-6 text-teal-600 dark:text-teal-400" />} label="المدفوعات" isSidebarOpen={isSidebarOpen} />
      <SidebarLink href="/redemptions" icon={<Gift className="w-6 h-6 text-orange-600 dark:text-orange-400" />} label="الاستبدالات" isSidebarOpen={isSidebarOpen} />
      {isAdmin && <SidebarLink href="/users" icon={<UserPlus className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />} label="إدارة المستخدمين" isSidebarOpen={isSidebarOpen} />}
      {isAdmin && <SidebarLink href="/roles" icon={<ShieldCheck className="w-6 h-6 text-lime-600 dark:text-lime-400" />} label="الأدوار" isSidebarOpen={isSidebarOpen} />}
      <SidebarLink href="/settings" icon={<Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />} label="الإعدادات" isSidebarOpen={isSidebarOpen} />
    </div>
  );
};

export default SidebarContent;
