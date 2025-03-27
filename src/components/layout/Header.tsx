
import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/components/ui/theme-provider';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  children?: React.ReactNode;
}

const Header = ({ title, subtitle, onMenuClick, children }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b sticky top-0 z-10 transition-colors duration-300",
      theme === 'dark' ? 'bg-background/80' : 'bg-background/60',
      "backdrop-blur-sm"
    )}>
      <div className="flex items-center gap-3 mb-4 md:mb-0 w-full md:w-auto">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="flex md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="بحث..." 
            className="pl-10 bg-background border-input" 
          />
        </div>
        
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
        </Button>
        
        {children}
      </div>
    </div>
  );
};

export default Header;
