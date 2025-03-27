
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Header from './Header';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="relative flex flex-1 flex-col overflow-auto">
        <Header 
          title="نظام إدارة العملاء والمخزون" 
          subtitle="إدارة منتجات وعملاء وفواتير منشأتك بكفاءة"
          onMenuClick={toggleSidebar}
        >
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </Header>
        <main className="flex-1 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
