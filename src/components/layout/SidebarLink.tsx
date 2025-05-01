
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isSidebarOpen: boolean;
}

const SidebarLink = ({ href, icon, label, isSidebarOpen }: SidebarLinkProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          : "hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 transition-colors",
          isActive
            ? "text-primary"
            : "text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-sm transition-opacity duration-200",
          !isSidebarOpen ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}
      >
        {label}
      </span>
      {isActive && (
        <span
          className={cn(
            "absolute inset-y-1 right-0 w-1 bg-primary rounded-l-full transition-opacity duration-200",
            !isSidebarOpen ? "opacity-0" : "opacity-100"
          )}
          aria-hidden="true"
        />
      )}
    </Link>
  );
};

export default SidebarLink;
