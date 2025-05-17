import { Route, Routes as RouterRoutes, Outlet } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import Layout from '@/components/layout/Layout';
import RequireAuth from '@/components/auth/RequireAuth';

const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const Customers = lazy(() => import('@/pages/Customers'));
const CustomerDetails = lazy(() => import('@/pages/CustomerDetails'));
const Invoices = lazy(() => import('@/pages/Invoices'));
const InvoiceDetails = lazy(() => import('@/pages/InvoiceDetails'));
const CreateInvoice = lazy(() => import('@/pages/CreateInvoice'));
const Payments = lazy(() => import('@/pages/Payments'));
const CreatePayment = lazy(() => import('@/pages/CreatePayment'));
const RedemptionsList = lazy(() => import('@/pages/RedemptionsList'));
const CreateRedemption = lazy(() => import('@/pages/CreateRedemption'));
const RedemptionDetails = lazy(() => import('@/pages/RedemptionDetails'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Users = lazy(() => import('@/pages/Users'));
const Roles = lazy(() => import('@/pages/Roles'));
const RoleDetails = lazy(() => import('@/pages/RoleDetails'));
const CustomerFollowup = lazy(() => import('@/pages/CustomerFollowup'));
const EditRedemption = lazy(() => import('@/pages/EditRedemption'));
const ReturnsList = lazy(() => import('@/pages/ReturnsList'));
const CreateReturn = lazy(() => import('@/pages/CreateReturn'));
const ReturnDetails = lazy(() => import('@/pages/ReturnDetails'));
const EditReturn = lazy(() => import('@/pages/EditReturn'));

export function Routes() {
  return (
    <Suspense fallback={<div className="p-4 text-center">جاري التحميل...</div>}>
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
          <Route path="/invoices/new" element={<CreateInvoice />} />
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
          <Route path="/returns" element={<ReturnsList />} />
          <Route path="/returns/create" element={<CreateReturn />} />
          <Route path="/returns/:id" element={<ReturnDetails />} />
          <Route path="/returns/:id/edit" element={<EditReturn />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </Suspense>
  );
}
