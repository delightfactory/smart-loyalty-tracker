import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, useSidebar, Sidebar } from '@/components/ui/sidebar';
import SidebarContent from './SidebarContent';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // يجب أن يكون useSidebar داخل SidebarProvider فقط
  return (
    <SidebarProvider>
      <LayoutWithSidebar children={children} />
    </SidebarProvider>
  );
};

// فصل المنطق الداخلي في مكون فرعي ليتم استدعاء useSidebar بعد التأكد من وجود SidebarProvider
const LayoutWithSidebar = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const { open, openMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  return (
    <>
      <SidebarWithContext />
      <div
        className={`relative flex flex-1 flex-col overflow-hidden transition-all duration-150 ease-out ${!isMobile && isSidebarOpen ? 'md:mr-[16rem]' : 'md:mr-0'}`}
      >
        <HeaderWithContext />
        <main className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 pt-16 md:pt-20">
          <div className={`${isSidebarOpen && !isMobile ? 'ml-0 mr-auto' : 'mx-auto'} w-full max-w-[1600px]`}>
            {children}
          </div>
        </main>
      </div>
    </>
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
      collapsible={isMobile ? "offcanvas" : "icon"}
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
