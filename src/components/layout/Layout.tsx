
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="relative flex flex-1 flex-col overflow-auto">
        <Header 
          title="نظام إدارة العملاء والمخزون" 
          subtitle="إدارة منتجات وعملاء وفواتير منشأتك بكفاءة"
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
