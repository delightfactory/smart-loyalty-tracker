
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import SmartSearch from '@/components/search/SmartSearch';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/components/ui/theme-provider';

interface PageContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  extra?: ReactNode;
  noPadding?: boolean;
}

const PageContainer = ({ 
  children, 
  title, 
  subtitle, 
  className,
  showSearch = false,
  searchPlaceholder = "بحث...",
  extra,
  noPadding = false
}: PageContainerProps) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "container transition-colors duration-300",
      noPadding ? "" : "py-6",
      className
    )}>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 animate-fade-in">
          {showSearch && (
            <SmartSearch placeholder={searchPlaceholder} className="w-[300px]" />
          )}
          {extra}
        </div>
      </div>
      
      <div className={cn(
        "relative rounded-xl overflow-hidden transition-colors duration-300",
        theme === 'dark' ? 'bg-card/50' : 'bg-transparent',
        "animate-fade-in"
      )}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
