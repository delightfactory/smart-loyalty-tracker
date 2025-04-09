import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Rocket, AlertCircle, CheckCircle2, Clock, ShoppingCart, Star, Gift, Receipt } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/PageContainer';
import { RedemptionItem, InvoiceStatus, RedemptionStatus, Customer } from '@/lib/types';
import RedemptionForm from '@/components/redemption/RedemptionForm';
import RedemptionSummary from '@/components/redemption/RedemptionSummary';
import RedemptionDetailsCard from '@/components/redemption/RedemptionDetailsCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { useRedemptions } from '@/hooks/useRedemptions';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const CreateRedemption = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerId || '');
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  const [totalRedemptionPoints, setTotalRedemptionPoints] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newRedemptionId, setNewRedemptionId] = useState<string | null>(null);
  
  const { getById, updateCustomer } = useCustomers();
  const { getByCustomerId } = useInvoices();
  const { addRedemption, getByCustomerId: getCustomerRedemptions, getById: getRedemptionById } = useRedemptions();

  const customerQuery = getById(selectedCustomerId);
  const customer = customerQuery.data;
  
  const invoicesQuery = getByCustomerId(selectedCustomerId);
  const customerInvoices = invoicesQuery.data || [];
  
  const redemptionsQuery = getCustomerRedemptions(selectedCustomerId);
  const customerRedemptions = redemptionsQuery.data || [];
  
  const newRedemptionQuery = getRedemptionById(newRedemptionId || '');
  const newRedemption = newRedemptionQuery.data;
  
  useEffect(() => {
    if (redemptionItems.length > 0) {
      const calculatedTotalPoints = redemptionItems.reduce((sum, item) => {
        const itemPoints = Number(item.totalPointsRequired) || 0;
        return sum + itemPoints;
      }, 0);
      setTotalRedemptionPoints(calculatedTotalPoints);
    } else {
      setTotalRedemptionPoints(0);
    }
  }, [redemptionItems]);
  
  const hasUnpaidInvoices = () => {
    if (!customerInvoices || !customerInvoices.length) return false;
    
    return customerInvoices.some(invoice => 
      invoice.status === InvoiceStatus.UNPAID || 
      invoice.status === InvoiceStatus.PARTIALLY_PAID || 
      invoice.status === InvoiceStatus.OVERDUE
    );
  };
  
  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
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
    
    if (!customer) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على بيانات العميل",
        variant: "destructive"
      });
      return;
    }
    
    const customerCurrentPoints = Number(customer.currentPoints) || 0;
    if (customerCurrentPoints < totalRedemptionPoints) {
      toast({
        title: "خطأ",
        description: "العميل لا يملك نقاط كافية للاستبدال",
        variant: "destructive"
      });
      return;
    }
    
    if (hasUnpaidInvoices()) {
      toast({
        title: "خطأ",
        description: "العميل لديه فواتير غير مدفوعة، يجب تسويتها أولا",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    addRedemption.mutate({
      redemption: {
        customerId: selectedCustomerId,
        date: new Date(),
        totalPointsRedeemed: totalRedemptionPoints,
        status: RedemptionStatus.COMPLETED,
        items: redemptionItems
      },
      items: redemptionItems
    }, {
      onSuccess: (data) => {
        if (customer) {
          const updatedCustomer = { ...customer };
          updatedCustomer.pointsRedeemed = Number(updatedCustomer.pointsRedeemed || 0) + totalRedemptionPoints;
          updatedCustomer.currentPoints = Number(updatedCustomer.pointsEarned || 0) - Number(updatedCustomer.pointsRedeemed || 0);
          
          updateCustomer.mutate(updatedCustomer);
        }
        
        setNewRedemptionId(data.id);
        setSuccess(true);
        
        setTimeout(() => {
          triggerSuccessConfetti();
        }, 500);
        
        toast({
          title: "تم الاستبدال بنجاح",
          description: `تم استبدال ${totalRedemptionPoints} نقطة بنجاح`,
          variant: "default"
        });
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
  
  if (success && newRedemption) {
    return (
      <PageContainer title="تم الاستبدال بنجاح" subtitle="تمت عملية استبدال النقاط بنجاح">
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
                النقاط المتبقية: {customer.currentPoints || 0}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.1, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.7 }}
              >
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold mb-2">تمت عملية الاستبدال بنجاح!</h2>
            <p className="text-muted-foreground mb-2">تم استبدال {totalRedemptionPoints} نقطة من رصيد العميل</p>
            
            <div className="w-full max-w-md mx-auto mt-6">
              <div className="flex justify-between mb-1 text-sm">
                <span>رصيد النقاط قبل الاستبدال</span>
                <span>{customer ? customer.currentPoints + totalRedemptionPoints : 0}</span>
              </div>
              <Progress value={100} className="h-2 mb-4" />
              
              <div className="flex justify-between mb-1 text-sm">
                <span>رصيد النقاط بعد الاستبدال</span>
                <span>{customer?.currentPoints}</span>
              </div>
              <Progress 
                value={customer && (customer.currentPoints / (customer.pointsEarned || 1)) * 100} 
                className="h-2" 
              />
            </div>
          </motion.div>
          
          <RedemptionDetailsCard 
            redemption={newRedemption} 
            onPrint={() => {
              toast({
                title: "طباعة الإيصال",
                description: "جاري طباعة إيصال الاستبدال...",
                variant: "default"
              });
            }} 
          />
          
          <div className="flex justify-center mt-8 gap-4">
            <Button 
              onClick={() => {
                setSuccess(false);
                setSubmitting(false);
                setRedemptionItems([]);
                setTotalRedemptionPoints(0);
              }}
              variant="outline"
            >
              <Gift className="h-4 w-4 mr-2" />
              استبدال جديد
            </Button>
            
            <Button 
              onClick={() => navigate(`/customer/${customer?.id}`)}
              variant="default"
            >
              <Receipt className="h-4 w-4 mr-2" />
              عرض سجل العميل
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }
  
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
              النقاط المتاحة: {customer.currentPoints || 0}
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
      
      {customer && (
        <Card className="mb-6 bg-slate-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">رصيد نقاط العميل</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">النقاط المكتسبة</span>
                  <span className="font-medium">{Number(customer.pointsEarned) || 0}</span>
                </div>
                <Progress value={100} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">النقاط المستبدلة</span>
                  <span className="font-medium">{Number(customer.pointsRedeemed) || 0}</span>
                </div>
                <Progress 
                  value={((Number(customer.pointsRedeemed) || 0) / Math.max(Number(customer.pointsEarned) || 1, 1)) * 100} 
                  className="h-2 bg-green-100" 
                  indicatorClassName="bg-green-500" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">النقاط المطلوبة حالياً</span>
                  <span className="font-medium">{totalRedemptionPoints}</span>
                </div>
                <Progress 
                  value={(totalRedemptionPoints / Math.max(Number(customer.currentPoints) || 1, 1)) * 100} 
                  className="h-2 bg-amber-100" 
                  indicatorClassName="bg-amber-500" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
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
                    <div key={redemption.id} className="border rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/redemption/${redemption.id}`)}
                    >
                      <div>
                        <p className="font-medium">تاريخ: {new Date(redemption.date).toLocaleDateString('ar-EG')}</p>
                        <p>النقاط المستبدلة: {redemption.totalPointsRedeemed}</p>
                      </div>
                      <Badge className={
                        redemption.status === RedemptionStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                        redemption.status === RedemptionStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
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
                  totalRedemptionPoints > (Number(customer?.currentPoints) || 0) ||
                  hasUnpaidInvoices() ||
                  submitting
                }
              />
            </CardContent>
            {redemptionItems.length > 0 && customer && (
              <CardFooter className="flex flex-col items-start">
                <Alert variant={(Number(customer.currentPoints) || 0) >= totalRedemptionPoints ? "default" : "destructive"} className="w-full mt-4">
                  {(Number(customer.currentPoints) || 0) >= totalRedemptionPoints ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>حالة النقاط</AlertTitle>
                  <AlertDescription>
                    {(Number(customer.currentPoints) || 0) >= totalRedemptionPoints 
                      ? `سيتبقى ${(Number(customer.currentPoints) || 0) - totalRedemptionPoints} نقطة بعد الاستبدال`
                      : `العميل يحتاج ${totalRedemptionPoints - (Number(customer.currentPoints) || 0)} نقطة إضافية`
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
