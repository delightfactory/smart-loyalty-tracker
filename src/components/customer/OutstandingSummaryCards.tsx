
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { CreditCard, Star, FileText, ShoppingBag } from 'lucide-react';
import { formatNumberEn } from '@/lib/utils';
import { Customer, Invoice, InvoiceStatus } from '@/lib/types';
import React from 'react';

interface OutstandingSummaryCardsProps {
  customers: Customer[];
  invoices: Invoice[];
  loading?: boolean;
}

// Helper function to calculate total balance for a customer
const calculateCustomerTotalBalance = (customer: Customer): number => {
  // Always include opening balance
  const openingBalance = customer.openingBalance ?? 0;
  // Include credit balance (which should already account for payments)
  const creditBalance = customer.creditBalance ?? 0;
  
  return openingBalance + creditBalance;
};

export const OutstandingSummaryCards: React.FC<OutstandingSummaryCardsProps> = ({ customers, invoices, loading }) => {
  // Calculate total sales (all invoices)
  const totalSales = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  
  // Calculate total outstanding points
  const totalPoints = customers.reduce((sum, c) => sum + (Number(c.currentPoints) || 0), 0);
  
  // Calculate overdue invoices count and amount
  const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE);
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  
  // Calculate total customer balances (including opening balances)
  const totalCustomerBalance = customers.reduce((sum, c) => sum + calculateCustomerTotalBalance(c), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* إجمالي المبيعات */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <ShoppingBag className="h-8 w-8 text-green-600 mb-2" />
          <CardTitle className="text-base font-medium mb-1">إجمالي المبيعات</CardTitle>
          <span className="text-2xl font-bold text-green-700" dir="ltr">
            {loading ? '...' : formatNumberEn(totalSales) + ' EGP'}
          </span>
        </CardContent>
      </Card>
      
      {/* إجمالي أرصدة العملاء */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
          <CardTitle className="text-base font-medium mb-1">إجمالي أرصدة العملاء</CardTitle>
          <span className="text-2xl font-bold text-blue-700" dir="ltr">
            {loading ? '...' : formatNumberEn(totalCustomerBalance) + ' EGP'}
          </span>
        </CardContent>
      </Card>
      
      {/* إجمالي النقاط المتبقية */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Star className="h-8 w-8 text-yellow-500 mb-2" />
          <CardTitle className="text-base font-medium mb-1">إجمالي النقاط المتبقية</CardTitle>
          <span className="text-2xl font-bold text-yellow-700" dir="ltr">
            {loading ? '...' : formatNumberEn(totalPoints)}
          </span>
        </CardContent>
      </Card>
      
      {/* الفواتير المتأخرة */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <FileText className="h-8 w-8 text-amber-600 mb-2" />
          <CardTitle className="text-base font-medium mb-1">الفواتير المتأخرة</CardTitle>
          <span className="text-2xl font-bold text-amber-700" dir="ltr">
            {loading ? '...' : formatNumberEn(overdueAmount) + ' EGP'}
          </span>
          <span className="text-xs font-medium text-muted-foreground mt-1">
            {loading ? '' : `عدد الفواتير: ${formatNumberEn(overdueInvoices.length)}`}
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutstandingSummaryCards;
