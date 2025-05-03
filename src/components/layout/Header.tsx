
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import UpdateCustomersButton from './UpdateCustomersButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { useEffect, useState } from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  
  // استخدام localStorage لحفظ وضع السمة
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // استرجاع السمة من localStorage عند تحميل المكون
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };
  
  // تخزين السمة في localStorage عند تغييرها
  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="border-b shadow-sm bg-background/70 backdrop-blur-md fixed top-0 right-0 left-0 z-10">
      <div className="container flex items-center justify-between p-2 md:p-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSidebar}
            className="mr-2"
            aria-label="تبديل القائمة الجانبية"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>

          <h1 className="text-base md:text-lg font-semibold hidden sm:block">نظام الولاء</h1>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <UpdateCustomersButton />
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeChange}
              className="rounded-full"
              aria-label={theme === 'dark' ? "تفعيل الوضع المضيء" : "تفعيل الوضع الداكن"}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
