import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, CreditCard, RefreshCw, UserPlus } from 'lucide-react';

const actions = [
  {
    label: 'إنشاء فاتورة',
    icon: <FileText className="w-5 h-5" />, 
    onClick: (navigate: any) => navigate('/create-invoice'),
  },
  {
    label: 'إنشاء مدفوع',
    icon: <CreditCard className="w-5 h-5" />, 
    onClick: (navigate: any) => navigate('/create-payment'),
  },
  {
    label: 'إنشاء استبدال',
    icon: <RefreshCw className="w-5 h-5" />, 
    onClick: (navigate: any) => navigate('/create-redemption'),
  },
  {
    label: 'إضافة عميل',
    icon: <UserPlus className="w-5 h-5" />, 
    onClick: (navigate: any) => navigate('/customers', { state: { openAddDialog: true } }),
  },
];

const FloatingQuickActions: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2 pointer-events-none">
      <div className="relative flex flex-row items-end">
        {/* زر + عائم */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="إجراءات سريعة"
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br from-primary to-blue-400 dark:from-primary dark:to-blue-900 text-white hover:scale-105 transition-all border-4 border-white dark:border-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/70 pointer-events-auto"
          style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.13)' }}
        >
          <Plus className="w-8 h-8" />
        </button>
        {/* قائمة الإجراءات */}
        {open && (
          <div className="flex flex-col items-start gap-2 mb-2 ml-4 pointer-events-auto" style={{ position: 'absolute', left: '100%', bottom: 0 }}>
            {actions.map((action, idx) => (
              <button
                key={action.label}
                onClick={() => { setOpen(false); action.onClick(navigate); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-100 hover:bg-primary/90 hover:text-white dark:hover:bg-primary/80 transition-colors border border-gray-200 dark:border-gray-800 backdrop-blur-md focus:outline-none"
                style={{ minWidth: 140 }}
              >
                {action.icon}
                <span className="text-sm font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingQuickActions;
