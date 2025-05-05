
import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './routes';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import ErrorBoundary from '@/components/ErrorBoundary';
import FloatingQuickActions from '@/components/FloatingQuickActions';
import { useAuthSync } from './hooks/useAuthSync';

// مكون للتزامن والتحديث التلقائي
function SyncManager() {
  useAuthSync();
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <QueryProvider>
            <Router>
              <SyncManager />
              <Routes />
              <Toaster />
              <FloatingQuickActions />
            </Router>
          </QueryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
