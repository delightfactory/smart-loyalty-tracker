
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

interface SidebarLinkProps {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: string;
  notificationCount?: number;
  isSidebarOpen: boolean;
}

const SidebarLink = ({ 
  icon, 
  label, 
  href, 
  badge, 
  notificationCount,
  isSidebarOpen
}: SidebarLinkProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink to={href} className="block w-full">
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="default"
                className={cn(
                  "w-full justify-start mb-1 transition-all duration-200 relative group overflow-hidden",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                <span className={cn(
                  "absolute inset-0 opacity-0 bg-sidebar-primary/10 transition-opacity",
                  "group-hover:opacity-100"
                )}></span>
                <span className="flex items-center">
                  {icon}
                  <span className={cn(
                    "mr-3 transition-opacity",
                    !isSidebarOpen && "opacity-0"
                  )}>{label}</span>
                </span>
                
                {badge && isSidebarOpen && (
                  <Badge variant="outline" className="mr-auto">
                    {badge}
                  </Badge>
                )}
                
                {notificationCount && isSidebarOpen && (
                  <Badge variant="default" className="mr-auto h-6 w-6 rounded-full p-0 flex items-center justify-center">
                    {notificationCount}
                  </Badge>
                )}
                
                {notificationCount && !isSidebarOpen && (
                  <Badge variant="default" className="absolute top-0 left-0 -mt-1 -ml-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            )}
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-normal">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SidebarLink;
