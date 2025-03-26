
import { ReactNode } from 'react';
import Header from './Header';

interface PageContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const PageContainer = ({ children, title, subtitle }: PageContainerProps) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header title={title} subtitle={subtitle} />
      <div className="flex-1 overflow-auto p-6">
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
