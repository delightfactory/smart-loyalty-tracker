
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import SmartSearch from '@/components/search/SmartSearch';

interface PageContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  extra?: ReactNode;
}

const PageContainer = ({ 
  children, 
  title, 
  subtitle, 
  className,
  showSearch = false,
  searchPlaceholder = "بحث...",
  extra 
}: PageContainerProps) => {
  return (
    <div className={cn("container py-6", className)}>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          {showSearch && (
            <SmartSearch placeholder={searchPlaceholder} className="w-[300px]" />
          )}
          {extra}
        </div>
      </div>
      {children}
    </div>
  );
};

export default PageContainer;
