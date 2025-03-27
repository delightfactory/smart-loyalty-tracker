
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
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
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customer/:id" element={<CustomerDetails />} />
            <Route path="/customer-followup" element={<CustomerFollowup />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoice/:id" element={<InvoiceDetails />} />
            <Route path="/create-invoice" element={<CreateInvoice />} />
            <Route path="/create-invoice/:customerId" element={<CreateInvoice />} />
            <Route path="/create-redemption/:customerId" element={<CreateRedemption />} />
            <Route path="/create-payment" element={<CreatePayment />} />
            <Route path="/create-payment/:customerId" element={<CreatePayment />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
