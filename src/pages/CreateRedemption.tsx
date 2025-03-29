
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Rocket, AlertCircle, CheckCircle2, Clock, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/PageContainer';
import { RedemptionItem, InvoiceStatus, RedemptionStatus } from '@/lib/types';
import { canRedeemPoints } from '@/lib/calculations';
import RedemptionForm from '@/components/redemption/RedemptionForm';
import RedemptionSummary from '@/components/redemption/RedemptionSummary';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { useRedemptions } from '@/hooks/useRedemptions';

const CreateRedemption = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerId || '');
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  const [totalRedemptionPoints, setTotalRedemptionPoints] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  
  // React Query hooks
  const { getById, updateCustomer } = useCustomers();
  const { getByCustomerId } = useInvoices();
  const { addRedemption, getByCustomerId: getCustomerRedemptions } = useRedemptions();

  // Get customer data
  const customerQuery = getById(selectedCustomerId);
  const customer = customerQuery.data;
  
  // Get customer invoices 
  const invoicesQuery = getByCustomerId(selectedCustomerId);
  const customerInvoices = invoicesQuery.data || [];
  
  // Get customer redemption history
  const redemptionsQuery = getCustomerRedemptions(selectedCustomerId);
  const customerRedemptions = redemptionsQuery.data || [];
  
  useEffect(() => {
    if (redemptionItems.length > 0) {
      const calculatedTotalPoints = redemptionItems.reduce((sum, item) => sum + (item.totalPointsRequired || 0), 0);
      setTotalRedemptionPoints(calculatedTotalPoints);
    } else {
      setTotalRedemptionPoints(0);
    }
  }, [redemptionItems]);
  
  // Check if customer has unpaid invoices
  const hasUnpaidInvoices = () => {
    if (!customerInvoices.length) return false;
    
    return customerInvoices.some(invoice => 
      invoice.status === InvoiceStatus.UNPAID || 
      invoice.status === InvoiceStatus.PARTIALLY_PAID || 
      invoice.status === InvoiceStatus.OVERDUE
    );
  };
  
  const handleCreateRedemption = () => {
    if (!selectedCustomerId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار عميل",
        variant: "destructive"
      });
      return;
    }
    
    if (redemptionItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة منتج واحد على الأقل",
        variant: "destructive"
      });
      return;
    }
    
    if (customer && !canRedeemPoints(customer.id, totalRedemptionPoints)) {
      toast({
        title: "خطأ",
        description: "العميل لا يملك نقاط كافية أو لديه فواتير غير مدفوعة",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    // Create redemption using the hook
    const currentDate = new Date();
    
    addRedemption.mutate({
      redemption: {
        customerId: selectedCustomerId,
        date: currentDate,
        totalPointsRedeemed: totalRedemptionPoints,
        status: RedemptionStatus.COMPLETED,
        items: redemptionItems // Adding the items property to fix the type error
      },
      items: redemptionItems
    }, {
      onSuccess: () => {
        // Update the customer's points if needed
        if (customer) {
          const updatedCustomer = { ...customer };
          updatedCustomer.pointsRedeemed += totalRedemptionPoints;
          updatedCustomer.currentPoints = updatedCustomer.pointsEarned - updatedCustomer.pointsRedeemed;
          
          updateCustomer.mutate(updatedCustomer);
        }
        
        toast({
          title: "تم الاستبدال بنجاح",
          description: `تم استبدال ${totalRedemptionPoints} نقطة بنجاح`,
          variant: "default"
        });
        
        navigate(customerId ? `/customer/${customerId}` : '/customers');
      },
      onError: (error) => {
        setSubmitting(false);
        toast({
          title: "خطأ",
          description: `حدث خطأ أثناء عملية الاستبدال: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };
  
  return (
    <PageContainer title="استبدال النقاط" subtitle="استبدال نقاط الولاء بمنتجات">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        
        {customer && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 px-3 py-1">
              العميل: {customer.name}
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800 px-3 py-1">
              النقاط المتاحة: {customer.currentPoints}
            </Badge>
          </div>
        )}
      </div>
      
      {hasUnpaidInvoices() && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>تنبيه هام</AlertTitle>
          <AlertDescription>
            لدى العميل فواتير غير مدفوعة. يجب تسوية الفواتير المستحقة قبل استبدال النقاط.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                إضافة منتجات للاستبدال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RedemptionForm 
                customer={customer}
                selectedCustomerId={selectedCustomerId}
                redemptionItems={redemptionItems}
                setRedemptionItems={setRedemptionItems}
                totalRedemptionPoints={totalRedemptionPoints}
                onCustomerChange={setSelectedCustomerId}
                hasUnpaidInvoices={hasUnpaidInvoices()}
                isCustomerSelected={!!selectedCustomerId}
              />
            </CardContent>
          </Card>
          
          {customerRedemptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  سجل استبدال النقاط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerRedemptions.slice(0, 3).map((redemption) => (
                    <div key={redemption.id} className="border rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">تاريخ: {new Date(redemption.date).toLocaleDateString('ar-EG')}</p>
                        <p>النقاط المستبدلة: {redemption.totalPointsRedeemed}</p>
                      </div>
                      <Badge className={redemption.status === RedemptionStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {redemption.status === RedemptionStatus.COMPLETED ? 'مكتمل' : 
                         redemption.status === RedemptionStatus.PENDING ? 'قيد الانتظار' : 'ملغي'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              {customerRedemptions.length > 3 && (
                <CardFooter>
                  <Button variant="link" onClick={() => customer && navigate(`/customer/${customer.id}`)}>
                    عرض كل عمليات الاستبدال
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                ملخص عملية الاستبدال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RedemptionSummary 
                customer={customer}
                totalRedemptionPoints={totalRedemptionPoints}
                onConfirm={handleCreateRedemption}
                disableConfirm={
                  !customer || 
                  redemptionItems.length === 0 || 
                  !canRedeemPoints(customer?.id || '', totalRedemptionPoints) ||
                  submitting
                }
              />
            </CardContent>
            {redemptionItems.length > 0 && customer && (
              <CardFooter className="flex flex-col items-start">
                <Alert variant={customer.currentPoints >= totalRedemptionPoints ? "default" : "destructive"} className="w-full mt-4">
                  {customer.currentPoints >= totalRedemptionPoints ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>حالة النقاط</AlertTitle>
                  <AlertDescription>
                    {customer.currentPoints >= totalRedemptionPoints 
                      ? `سيتبقى ${customer.currentPoints - totalRedemptionPoints} نقطة بعد الاستبدال`
                      : `العميل يحتاج ${totalRedemptionPoints - customer.currentPoints} نقطة إضافية`
                    }
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default CreateRedemption;
