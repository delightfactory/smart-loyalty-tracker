
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

// مزود استعلام البيانات
export const QueryProvider = ({ children }: QueryProviderProps) => {
  // إنشاء نسخة عميل استعلام جديدة في كل تحميل للمكون لضمان عدم مشاركة الحالة
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // تكوين افتراضي للاستعلامات مع تحسين معدلات التحديث
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 30, // 30 ثانية فقط
        retry: 1,
        retryDelay: 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
