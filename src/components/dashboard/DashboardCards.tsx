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
import { formatNumberEn } from '@/lib/utils';
import { useCustomers } from '@/hooks/useCustomers';
import { useContext } from 'react';
import { DashboardTimeFilterContext } from '@/pages/Dashboard';

interface CardData extends Omit<DashboardCardProps, 'value'> {
  value: number | string;
}

const DashboardCards = ({ summary, view, formatCurrency }: DashboardSummaryProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  const { customers, isLoading: isLoadingCustomers } = useCustomers();
  
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        return await productsService.getAll();
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    enabled: isMounted && !summary,
    staleTime: 60000,
    retry: 2
  });
  
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        return await invoicesService.getAll();
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    },
    enabled: isMounted && !summary,
    staleTime: 60000,
    retry: 2
  });
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      try {
        return await paymentsService.getAll();
      } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
      }
    },
    enabled: isMounted && !summary,
    staleTime: 60000,
    retry: 2
  });
  
  const { data: redemptions, isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['redemptions'],
    queryFn: async () => {
      try {
        return await redemptionsService.getAll();
      } catch (error) {
        console.error('Error fetching redemptions:', error);
        return [];
      }
    },
    enabled: isMounted && !summary,
    staleTime: 60000,
    retry: 2
  });
  
  const { filteredPayments, filteredCustomers, filteredInvoices, filteredRedemptions } = useContext(DashboardTimeFilterContext);

  // حساب الإيرادات المالية بشكل مطابق لصفحة المدفوعات بدون الاعتماد على summary
  const calculateTotalRevenue = () => {
    if (!filteredPayments) return 0;
    return filteredPayments
      .filter(payment => payment.type === 'payment')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
  };
  
  const calculateTotalOutstanding = () => {
    if (!filteredCustomers) return 0;
    return filteredCustomers.reduce((sum, customer) => sum + (Number(customer.creditBalance) || 0), 0);
  };
  
  const cardDataDefault: CardData[] = [
    {
      title: 'إجمالي العملاء',
      value: formatNumberEn(filteredCustomers?.length || 0),
      icon: <Users className="h-5 w-5 text-blue-600" />,
      loading: !summary && isLoadingCustomers,
      trend: '+5.2%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي المنتجات',
      value: formatNumberEn(products?.length || 0),
      icon: <Package className="h-5 w-5 text-green-600" />,
      loading: !summary && isLoadingProducts,
      trend: '+3.1%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي الفواتير',
      value: formatNumberEn(filteredInvoices?.length || 0),
      icon: <FileText className="h-5 w-5 text-amber-600" />,
      loading: !summary && isLoadingInvoices,
      trend: '+12.5%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي الإيرادات المالية',
      value: formatNumberEn(calculateTotalRevenue()) + ' EGP',
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      loading: !summary && isLoadingPayments,
      trend: '+18.2%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'المبالغ المستحقة',
      value: formatNumberEn(calculateTotalOutstanding()) + ' EGP',
      icon: <CreditCard className="h-5 w-5 text-red-600" />, 
      loading: !summary && isLoadingCustomers,
      trend: '-2.5%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'عمليات استبدال النقاط',
      value: formatNumberEn(filteredRedemptions?.length || 0),
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

  // حدود ملونة لكل بطاقة لدعم الوضع النهاري والليلي
  const borderColors = [
    'border-blue-200 dark:border-blue-700',
    'border-green-200 dark:border-green-700',
    'border-amber-200 dark:border-amber-700',
    'border-purple-200 dark:border-purple-700',
    'border-red-200 dark:border-red-700',
    'border-yellow-200 dark:border-yellow-700',
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cardData.map((card, index) => (
        <Card key={index} className={`transition-all hover:shadow-md border-2 ${borderColors[index]}`}>
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
