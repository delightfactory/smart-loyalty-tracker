
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // استخدام localStorage لحفظ حالة الشريط الجانبي
  const getSavedSidebarState = (): boolean => {
    const saved = localStorage.getItem('sidebarState');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // القيمة الافتراضية تعتمد على حجم الشاشة
    return window.innerWidth >= 768;
  };

  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // قراءة الحالة من localStorage عند تهيئة المكون
    // نستخدم وظيفة للتأكد من أنها تعمل فقط عند تحميل المكون (client-side)
    if (typeof window !== 'undefined') {
      return getSavedSidebarState();
    }
    return !isMobile;
  });
  
  // تحديث حالة الشريط الجانبي عند تغيير حجم الشاشة
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      // إغلاق الشريط الجانبي تلقائياً على الشاشات الصغيرة
      setSidebarOpen(false);
    } else if (!isMobile && typeof window !== 'undefined' && localStorage.getItem('sidebarState') === null) {
      // إذا كان الجهاز ليس محمولاً وليست هناك تفضيلات مخزنة، فتح الشريط الجانبي
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // حفظ حالة الشريط الجانبي في localStorage
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <SidebarProvider>
      <div className="flex h-screen max-h-screen overflow-hidden bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Header onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 pt-16 md:pt-20">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
