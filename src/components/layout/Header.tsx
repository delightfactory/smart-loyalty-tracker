import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { useSidebar } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/auth/UserMenu';
import UpdateCustomersButton from './UpdateCustomersButton';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      toggleSidebar();
    }
  };

  return (
    <header className="border-b shadow-sm bg-background/70 backdrop-blur-md fixed top-0 right-0 left-0 z-10">
      <div className="container flex items-center justify-between p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleSidebar}
          className="lg:hidden"
        >
          <MenuIcon />
        </Button>

        <h1 className="text-lg font-semibold lg:block hidden">نظام الولاء</h1>

        <div className="flex items-center gap-2">
          <UpdateCustomersButton />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-full"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
