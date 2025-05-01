
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface ViewToggleProps {
  view: 'table' | 'cards';
  setView: (v: 'table' | 'cards') => void;
  storageKey?: string; // مفتاح لحفظ القيمة في localStorage
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView, storageKey }) => {
  // استرجاع القيمة المخزنة عند التحميل
  useEffect(() => {
    if (storageKey) {
      const savedView = localStorage.getItem(storageKey) as 'table' | 'cards' | null;
      if (savedView && (savedView === 'table' || savedView === 'cards')) {
        setView(savedView);
      }
    }
  }, [storageKey, setView]);

  // حفظ القيمة عند التغيير
  const handleViewChange = (newView: 'table' | 'cards') => {
    setView(newView);
    if (storageKey) {
      localStorage.setItem(storageKey, newView);
    }
  };

  return (
    <ToggleGroup 
      type="single" 
      value={view} 
      onValueChange={val => val && handleViewChange(val as 'table' | 'cards')} 
      className="rounded-xl bg-gradient-to-r from-emerald-50 via-lime-50 to-teal-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-1 shadow-sm border border-lime-100 dark:border-gray-700"
    >
      <ToggleGroupItem 
        value="table" 
        aria-label="عرض جدولي" 
        className={cn("px-3 py-2 rounded-lg transition-all", view === 'table' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 shadow' : 'text-gray-400 dark:text-gray-500 hover:bg-lime-100 dark:hover:bg-gray-700')}
      >
        <Table className="h-5 w-5" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="cards" 
        aria-label="عرض بطاقات" 
        className={cn("px-3 py-2 rounded-lg transition-all", view === 'cards' ? 'bg-teal-200 dark:bg-teal-800 text-teal-900 dark:text-teal-100 shadow' : 'text-gray-400 dark:text-gray-500 hover:bg-lime-100 dark:hover:bg-gray-700')}
      >
        <LayoutGrid className="h-5 w-5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
