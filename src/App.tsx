import { useState } from 'react';
import { Routes } from './routes';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import ErrorBoundary from '@/components/ErrorBoundary';
import FloatingQuickActions from '@/components/FloatingQuickActions';
import { useAuthSync } from './hooks/useAuthSync';
import { useRealtime } from '@/hooks/use-realtime';

// مكون للتزامن والتحديث التلقائي
function SyncManager() {
  useAuthSync();
  // تفعيل الاشتراك في التحديثات الفورية لجميع الجداول
  useRealtime('customers');
  useRealtime('invoices');
  useRealtime('payments');
  useRealtime('products');
  useRealtime('redemptions');
  useRealtime('redemption_items');
  useRealtime('points_history');
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <QueryProvider>
            <SyncManager />
            <Routes />
            <Toaster />
            <FloatingQuickActions />
          </QueryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
