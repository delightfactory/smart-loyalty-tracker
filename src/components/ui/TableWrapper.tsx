import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

interface TableWrapperProps {
  children: React.ReactNode;
}

const TableWrapper: React.FC<TableWrapperProps> = ({ children }) => {
  const { isMobile, open, openMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;
  return (
    <div className={`relative transition-all duration-150 ease-out ${!isMobile && isOpen ? 'md:mr-[16rem]' : 'md:mr-0'}`}>
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-md border border-gray-200 dark:border-gray-700 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default TableWrapper;
