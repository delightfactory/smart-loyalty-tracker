
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Invoices from "./pages/Invoices";
import InvoiceDetails from "./pages/InvoiceDetails";
import CreateInvoice from "./pages/CreateInvoice";
import CreatePayment from "./pages/CreatePayment";
import CreateRedemption from "./pages/CreateRedemption";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex h-screen w-full overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customer/:id" element={<CustomerDetails />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoice/:id" element={<InvoiceDetails />} />
              <Route path="/create-invoice" element={<CreateInvoice />} />
              <Route path="/create-invoice/:customerId" element={<CreateInvoice />} />
              <Route path="/create-payment" element={<CreatePayment />} />
              <Route path="/create-payment/:customerId" element={<CreatePayment />} />
              <Route path="/create-redemption" element={<CreateRedemption />} />
              <Route path="/create-redemption/:customerId" element={<CreateRedemption />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
