
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/components/ui/theme-provider';
import SidebarContent from './SidebarContent';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const isMobile = useIsMobile();
  const [hovering, setHovering] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const location = useLocation();

  // إغلاق الشريط الجانبي عند النقر خارجه على الأجهزة المحمولة
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen, onClose]);

  // إغلاق الشريط الجانبي تلقائياً عند تغيير المسار على الشاشات الصغيرة
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location.pathname, isMobile, isOpen, onClose]);

  // التحقق مما إذا كان الشريط الجانبي مفتوحًا بشكل فعال
  const isEffectivelyOpen = isOpen || hovering;

  return (
    <>
      {/* خلفية شفافة للنقر عليها لإغلاق الشريط الجانبي على الأجهزة المحمولة */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed right-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16 hover:w-64",
          isMobile ? (isOpen ? "translate-x-0" : "translate-x-full") : "translate-x-0",
          isMobile ? "shadow-lg border-l" : "border-l",
          theme === 'dark' ? 'bg-sidebar' : 'bg-background'
        )}
        onMouseEnter={() => !isMobile && setHovering(true)}
        onMouseLeave={() => !isMobile && setHovering(false)}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className={cn(
              "text-lg font-semibold transition-opacity duration-200",
              (!isEffectivelyOpen) ? "opacity-0" : "opacity-100"
            )}>
              القائمة الرئيسية
            </h2>
            {/* زر التبديل للأجهزة المحمولة والحواسيب */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 transition-opacity duration-200"
              aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          {/* جعل القائمة الجانبية قابلة للتمرير العمودي دائماً */}
          <div className="flex-1 min-h-0 overflow-y-auto pb-10">
            <SidebarContent isSidebarOpen={isEffectivelyOpen} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
