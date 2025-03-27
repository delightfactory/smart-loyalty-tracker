
import { ReactNode } from 'react';

// Props for DashboardCards component
export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  loading?: boolean;
  trend?: string;
  description?: string;
}

// Props for RecentInvoices component
export interface RecentInvoicesProps {
  invoices: any[];
  customers: any[];
  formatCurrency: (value: number) => string;
}

// Props for InvoiceStatusChart component
export interface InvoiceStatusChartProps {
  data?: {
    name: string;
    value: number;
    color?: string;
  }[];
}

// Props for RevenueChart component
export interface RevenueChartProps {
  data: {
    name: string;
    revenue: number;
    invoiceCount?: number;
  }[];
  formatCurrency: (value: number) => string;
  type?: string;
  title?: string;
  description?: string;
}

// Props for PointsRedemptionChart component
export interface PointsRedemptionChartProps {
  data?: {
    name: string;
    value: number;
    color?: string;
  }[];
}

// Props for CustomersList component
export interface CustomersListProps {
  customers?: any[];
  loading?: boolean;
}

// Props for DashboardCards component
export interface DashboardSummaryProps {
  summary: {
    totalProducts: number;
    totalCustomers: number;
    totalInvoices: number;
    totalRevenue: number;
    totalPaid?: number;
    totalOverdue?: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
  };
  view?: string;
  formatCurrency?: (value: number) => string;
}
