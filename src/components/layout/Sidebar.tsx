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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        className={cn(
          // Scrollable, sticky, and visually enhanced sidebar
          "fixed right-0 z-40 transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "w-64" : "w-16 hover:w-64",
          // في الديسكتوب يبدأ أسفل الهيدر، في الموبايل يغطي الشاشة بالكامل
          "top-0 h-screen md:top-[64px] md:h-[calc(100vh-64px)]",
          isMobile ? "shadow-lg border-l" : "border-l",
          // Enhanced contrast for light/dark
          theme === 'dark'
            ? 'bg-gray-900 text-white border-gray-800' // darker bg, clear border
            : 'bg-white text-gray-900 border-gray-200',
          // Custom scrollbar always
          'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent'
        )}
        style={{
          overscrollBehavior: 'contain',
        }}
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
              className="h-8 w-8 p-0 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          {/* Scrollable content with improved contrast and sticky footer if needed */}
          <div className="flex-1 min-h-0 overflow-y-auto pb-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent bg-inherit">
            <SidebarContent isSidebarOpen={isEffectivelyOpen} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
