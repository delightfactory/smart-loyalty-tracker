
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import Layout from '@/components/layout/Layout';
import Index from '@/pages/Index';
import Products from '@/pages/Products';
import ProductDetails from '@/pages/ProductDetails';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import CustomerFollowup from '@/pages/CustomerFollowup';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import CreateInvoice from '@/pages/CreateInvoice';
import CreateRedemption from '@/pages/CreateRedemption';
import CreatePayment from '@/pages/CreatePayment';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Users from '@/pages/Users';
import RequireAuth from '@/components/auth/RequireAuth';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                } />
                <Route path="/products" element={
                  <RequireAuth>
                    <Products />
                  </RequireAuth>
                } />
                <Route path="/product/:id" element={
                  <RequireAuth>
                    <ProductDetails />
                  </RequireAuth>
                } />
                <Route path="/customers" element={
                  <RequireAuth>
                    <Customers />
                  </RequireAuth>
                } />
                <Route path="/customer/:id" element={
                  <RequireAuth>
                    <CustomerDetails />
                  </RequireAuth>
                } />
                <Route path="/customer-followup" element={
                  <RequireAuth>
                    <CustomerFollowup />
                  </RequireAuth>
                } />
                <Route path="/invoices" element={
                  <RequireAuth>
                    <Invoices />
                  </RequireAuth>
                } />
                <Route path="/invoice/:id" element={
                  <RequireAuth>
                    <InvoiceDetails />
                  </RequireAuth>
                } />
                <Route path="/create-invoice" element={
                  <RequireAuth>
                    <CreateInvoice />
                  </RequireAuth>
                } />
                <Route path="/create-invoice/:customerId" element={
                  <RequireAuth>
                    <CreateInvoice />
                  </RequireAuth>
                } />
                <Route path="/create-redemption/:customerId" element={
                  <RequireAuth>
                    <CreateRedemption />
                  </RequireAuth>
                } />
                <Route path="/create-payment" element={
                  <RequireAuth>
                    <CreatePayment />
                  </RequireAuth>
                } />
                <Route path="/create-payment/:customerId" element={
                  <RequireAuth>
                    <CreatePayment />
                  </RequireAuth>
                } />
                <Route path="/analytics" element={
                  <RequireAuth>
                    <Analytics />
                  </RequireAuth>
                } />
                <Route path="/users" element={
                  <RequireAuth>
                    <Users />
                  </RequireAuth>
                } />
                <Route path="/profile" element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                } />
                <Route path="/settings" element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                } />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Layout>
            <Toaster />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
