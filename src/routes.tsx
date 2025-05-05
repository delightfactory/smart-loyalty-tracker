import { Route, Routes as RouterRoutes, Outlet } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import ProductDetails from '@/pages/ProductDetails';
import Customers from '@/pages/Customers';
import CustomerDetails from '@/pages/CustomerDetails';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import CreateInvoice from '@/pages/CreateInvoice';
import Payments from '@/pages/Payments';
import CreatePayment from '@/pages/CreatePayment';
import RedemptionsList from '@/pages/RedemptionsList';
import CreateRedemption from '@/pages/CreateRedemption';
import RedemptionDetails from '@/pages/RedemptionDetails';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';
import RequireAuth from '@/components/auth/RequireAuth';
import Users from '@/pages/Users';
import Roles from '@/pages/Roles';
import RoleDetails from '@/pages/RoleDetails';
import CustomerFollowup from '@/pages/CustomerFollowup';
import EditRedemption from '@/pages/EditRedemption';

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes */}
      <Route element={
        <RequireAuth>
          <Layout>
            <Outlet />
          </Layout>
        </RequireAuth>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/customer-followup" element={<CustomerFollowup />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<InvoiceDetails />} />
        <Route path="/create-invoice" element={<CreateInvoice />} />
        <Route path="/create-invoice/:customerId" element={<CreateInvoice />} />
        <Route path="/create-invoice/:customerId/edit/:edit" element={<CreateInvoice />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/create-payment" element={<CreatePayment />} />
        <Route path="/create-payment/:customerId" element={<CreatePayment />} />
        <Route path="/redemptions" element={<RedemptionsList />} />
        <Route path="/redemptions/create" element={<CreateRedemption />} />
        <Route path="/redemptions/create/:customerId" element={<CreateRedemption />} />
        <Route path="/redemptions/:id" element={<RedemptionDetails />} />
        <Route path="/redemptions/:id/edit" element={<EditRedemption />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/users" element={<Users />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/roles/:id" element={<RoleDetails />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
}
