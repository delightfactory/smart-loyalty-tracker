
import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PageContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearchChange?: (term: string) => void;
}

const PageContainer = ({
  children,
  title,
  subtitle,
  searchPlaceholder,
  onSearchChange
}: PageContainerProps) => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        
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
      </div>
      
      {children}
    </div>
  );
};

export default PageContainer;
