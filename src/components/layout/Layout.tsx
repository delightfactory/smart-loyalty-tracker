import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, useSidebar, Sidebar } from '@/components/ui/sidebar';
import SidebarContent from './SidebarContent';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <SidebarWithContext />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <HeaderWithContext />
        <main className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 pt-16 md:pt-20">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const SidebarWithContext = () => {
  const { state, open, openMobile, isMobile } = useSidebar();
  // تحديد حالة الفتح الفعلي للسايدبار
  const isSidebarOpen = isMobile ? openMobile : open;
  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="offcanvas"
      // استخدم Sheet تلقائياً في وضع الهاتف
      // open و onOpenChange يديرها السياق
    >
      <SidebarContent isSidebarOpen={isSidebarOpen} />
    </Sidebar>
  );
};

const HeaderWithContext = () => {
  const { toggleSidebar } = useSidebar();
  return <Header onToggleSidebar={toggleSidebar} />;
};

export default Layout;
