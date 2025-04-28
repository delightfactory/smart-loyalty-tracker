import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/hooks/useAuth';
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
import UsersPage from '@/pages/Users';
import RequireAuth from '@/components/auth/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="car-care-theme">
        <QueryProvider>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              <Route element={
                <RequireAuth>
                  <Layout>
                    <Outlet />
                  </Layout>
                </RequireAuth>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerDetails />} />
                <Route path="/customer-followup" element={<CustomerFollowup />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/:id" element={<InvoiceDetails />} />
                <Route path="/create-invoice/:customerId" element={<CreateInvoice />} />
                <Route path="/create-invoice" element={<CreateInvoice />} />
                <Route path="/create-redemption/:customerId" element={<CreateRedemption />} />
                <Route path="/create-payment" element={<CreatePayment />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
