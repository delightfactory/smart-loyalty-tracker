
import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PageContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearchChange?: (term: string) => void;
  extra?: ReactNode; // إضافة خاصية لمحتوى إضافي
}

const PageContainer = ({
  children,
  title,
  subtitle,
  searchPlaceholder,
  onSearchChange,
  extra
}: PageContainerProps) => {
  return (
    <div className="container mx-auto p-2 sm:p-3 md:p-4 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm md:text-base mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          {searchPlaceholder && onSearchChange && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10"
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          
          {extra && (
            <div className="flex items-center">
              {extra}
            </div>
          )}
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default PageContainer;
