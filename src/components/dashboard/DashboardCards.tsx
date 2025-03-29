import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Package, 
  Star, 
  FileText,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService, customersService, invoicesService, paymentsService, redemptionsService } from '@/services/database';
import { DashboardCardProps, DashboardSummaryProps } from './DashboardCardProps';
import { useEffect, useState } from 'react';

interface CardData extends Omit<DashboardCardProps, 'value'> {
  value: number | string;
}

const DashboardCards = ({ summary, view, formatCurrency }: DashboardSummaryProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll(),
    enabled: isMounted,
    staleTime: 60000,
    retry: 2
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll(),
    enabled: isMounted,
    staleTime: 60000,
    retry: 2
  });
  
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesService.getAll(),
    enabled: isMounted,
    staleTime: 60000,
    retry: 2
  });
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.getAll(),
    enabled: isMounted,
    staleTime: 60000,
    retry: 2
  });
  
  const { data: redemptions, isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['redemptions'],
    queryFn: () => redemptionsService.getAll(),
    enabled: isMounted,
    staleTime: 60000,
    retry: 2
  });
  
  const isError = false;
  
  const calculateTotalRevenue = () => {
    if (summary) return summary.totalRevenue;
    
    if (!payments) return 0;
    return payments
      .filter(payment => payment.type === 'payment')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };
  
  const calculateTotalOutstanding = () => {
    if (summary) return summary.totalOverdue || 0;
    
    if (!invoices) return 0;
    return invoices
      .filter(invoice => invoice.status !== 'مدفوع')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  };
  
  const cardDataDefault: CardData[] = [
    {
      title: 'إجمالي العملاء',
      value: summary ? summary.totalCustomers : customers?.length || 0,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      loading: !summary && isLoadingCustomers,
      trend: '+5.2%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي المنتجات',
      value: summary ? summary.totalProducts : products?.length || 0,
      icon: <Package className="h-5 w-5 text-green-600" />,
      loading: !summary && isLoadingProducts,
      trend: '+3.1%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي الفواتير',
      value: summary ? summary.totalInvoices : invoices?.length || 0,
      icon: <FileText className="h-5 w-5 text-amber-600" />,
      loading: !summary && isLoadingInvoices,
      trend: '+12.5%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي الإيرادات',
      value: formatCurrency 
        ? formatCurrency(calculateTotalRevenue())
        : new Intl.NumberFormat('ar-EG', { 
            style: 'currency', 
            currency: 'EGP',
            maximumFractionDigits: 0 
          }).format(calculateTotalRevenue()),
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      loading: !summary && isLoadingPayments,
      trend: '+18.2%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'المبالغ المستحقة',
      value: formatCurrency 
        ? formatCurrency(calculateTotalOutstanding())
        : new Intl.NumberFormat('ar-EG', { 
            style: 'currency', 
            currency: 'EGP',
            maximumFractionDigits: 0 
          }).format(calculateTotalOutstanding()),
      icon: <CreditCard className="h-5 w-5 text-red-600" />,
      loading: !summary && isLoadingInvoices,
      trend: '-2.5%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'عمليات استبدال النقاط',
      value: summary ? summary.totalPointsRedeemed : redemptions?.length || 0,
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      loading: !summary && isLoadingRedemptions,
      trend: '+7.3%',
      description: 'منذ الشهر الماضي'
    }
  ];

  const salesCards = [
    cardDataDefault[2],
    cardDataDefault[3],
    cardDataDefault[4]
  ];

  const cardData = view === 'sales' ? salesCards : cardDataDefault;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cardData.map((card, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className="bg-primary/10 p-2 rounded-full">
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            {card.loading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={card.trend?.startsWith('+') ? "text-green-600" : "text-red-600"}>
                    {card.trend}
                  </span>
                  {' '}{card.description}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCards;
