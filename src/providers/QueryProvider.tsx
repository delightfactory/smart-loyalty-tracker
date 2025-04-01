
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

// إنشاء نسخة عميل استعلام جديدة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // تكوين افتراضي للاستعلامات
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 دقائق
      retry: 1
    },
  },
});

// مزود استعلام البيانات
export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
