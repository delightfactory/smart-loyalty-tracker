
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

const DashboardCards = () => {
  // البيانات المطلوبة للبطاقات
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll()
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll()
  });
  
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesService.getAll()
  });
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsService.getAll()
  });
  
  const { data: redemptions, isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['redemptions'],
    queryFn: () => redemptionsService.getAll()
  });
  
  // حساب الإحصائيات
  const calculateTotalRevenue = () => {
    if (!payments) return 0;
    return payments
      .filter(payment => payment.type === 'payment')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };
  
  const calculateTotalOutstanding = () => {
    if (!invoices) return 0;
    return invoices
      .filter(invoice => invoice.status !== 'مدفوع')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  };
  
  const cardData = [
    {
      title: 'إجمالي العملاء',
      value: customers?.length || 0,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      loading: isLoadingCustomers,
      trend: '+5.2%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي المنتجات',
      value: products?.length || 0,
      icon: <Package className="h-5 w-5 text-green-600" />,
      loading: isLoadingProducts,
      trend: '+3.1%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي الفواتير',
      value: invoices?.length || 0,
      icon: <FileText className="h-5 w-5 text-amber-600" />,
      loading: isLoadingInvoices,
      trend: '+12.5%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'إجمالي الإيرادات',
      value: new Intl.NumberFormat('ar-EG', { 
        style: 'currency', 
        currency: 'EGP',
        maximumFractionDigits: 0 
      }).format(calculateTotalRevenue()),
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      loading: isLoadingPayments,
      trend: '+18.2%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'المبالغ المستحقة',
      value: new Intl.NumberFormat('ar-EG', { 
        style: 'currency', 
        currency: 'EGP',
        maximumFractionDigits: 0 
      }).format(calculateTotalOutstanding()),
      icon: <CreditCard className="h-5 w-5 text-red-600" />,
      loading: isLoadingInvoices,
      trend: '-2.5%',
      description: 'منذ الشهر الماضي'
    },
    {
      title: 'عمليات استبدال النقاط',
      value: redemptions?.length || 0,
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      loading: isLoadingRedemptions,
      trend: '+7.3%',
      description: 'منذ الشهر الماضي'
    }
  ];

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
                  <span className={card.trend.startsWith('+') ? "text-green-600" : "text-red-600"}>
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
