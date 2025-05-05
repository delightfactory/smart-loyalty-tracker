import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Rocket, AlertCircle, CheckCircle2, Clock, ShoppingCart, Star, Gift, Receipt } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/PageContainer';
import { RedemptionItem, InvoiceStatus, RedemptionStatus, Customer, Redemption } from '@/lib/types';
import RedemptionForm from '@/components/redemption/RedemptionForm';
import RedemptionSummary from '@/components/redemption/RedemptionSummary';
import RedemptionDetailsCard from '@/components/redemption/RedemptionDetailsCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { useRedemptions } from '@/hooks/useRedemptions';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const EditRedemption = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { getById: getRedemptionById, updateRedemption } = useRedemptions();
  const { getById: getCustomerById } = useCustomers();
  const { getByCustomerId: getCustomerInvoices } = useInvoices();

  // Fetch redemption and customer data
  const redemptionQuery = getRedemptionById(id || '');
  const redemption = redemptionQuery.data as Redemption | undefined;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  const [totalRedemptionPoints, setTotalRedemptionPoints] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch customer and invoices
  const customerQuery = getCustomerById(redemption?.customerId || '');
  const customer = customerQuery.data as Customer | undefined;
  const invoicesQuery = getCustomerInvoices(redemption?.customerId || '');
  const customerInvoices = invoicesQuery.data || [];

  useEffect(() => {
    if (redemption) {
      setSelectedCustomerId(redemption.customerId);
      setRedemptionItems(redemption.items || []);
    }
  }, [redemption]);

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

  const handleUpdateRedemption = () => {
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
    if (!redemption) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على بيانات الاستبدال",
        variant: "destructive"
      });
      return;
    }
    // حساب نقاط التعديل: إضافة النقاط المخصومة قديمًا للتحقق من الرصيد الفعلي
    const currentPoints = Number(customer.currentPoints) || 0;
    const oldTotalPoints = Number(redemption.totalPointsRedeemed) || 0;
    const effectiveCurrentPoints = currentPoints + oldTotalPoints;
    const newTotalPoints = totalRedemptionPoints;
    const diff = newTotalPoints - oldTotalPoints;
    if (diff > effectiveCurrentPoints) {
      toast({
        title: "نقاط غير كافية",
        description: `رصيد العميل ${effectiveCurrentPoints} أقل من الزيادة المطلوبة ${diff}`,
        variant: "destructive"
      });
      return;
    }
    setSubmitting(true);
    const updatedRedemption: Redemption = {
      ...redemption,
      items: redemptionItems,
      totalPointsRedeemed: newTotalPoints,
      status: redemption.status // الحفاظ على الحالة الحالية بعد التعديل
    } as Redemption;
    updateRedemption.mutate(updatedRedemption, {
      onSuccess: () => {
        setSubmitting(false);
        triggerSuccessConfetti();
        toast({
          title: "تم التحديث بنجاح",
          description: `تم تحديث عملية الاستبدال بنجاح.`,
          variant: "default"
        });
        navigate(`/redemptions/${redemption.id}`);
      },
      onError: (error) => {
        setSubmitting(false);
        toast({
          title: "خطأ",
          description: `حدث خطأ أثناء تحديث الاستبدال: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };

  if (redemptionQuery.isLoading || customerQuery.isLoading || invoicesQuery.isLoading) {
    return (
      <PageContainer title="تحميل..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-10 w-10 mb-2 mx-auto animate-spin text-primary" />
            <p className="text-muted-foreground">جاري تحميل بيانات الاستبدال...</p>
          </div>
        </div>
      </PageContainer>
    );
  }
  if (!redemption || !customer) {
    return (
      <PageContainer title="خطأ" subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">حدث خطأ أثناء تحميل بيانات الاستبدال أو العميل</p>
            <button 
              className="mt-4 underline text-primary"
              onClick={() => navigate(-1)}
            >
              العودة للصفحة السابقة
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // إعداد بيانات العميل للملخص مع الرصيد الفعلي عند التعديل
  const oldTotalPoints = Number(redemption.totalPointsRedeemed) || 0;
  const effectiveCurrentPoints = (Number(customer.currentPoints) || 0) + oldTotalPoints;
  const summaryCustomer: Customer = {
    ...customer,
    currentPoints: effectiveCurrentPoints,
    pointsRedeemed: (Number(customer.pointsRedeemed) || 0) - oldTotalPoints,
  } as Customer;
  const diff = totalRedemptionPoints - oldTotalPoints;

  return (
    <PageContainer 
      title="تعديل الاستبدال" 
      subtitle={`تعديل عملية الاستبدال رقم ${redemption.id}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 px-3 py-1">
            العميل: {customer.name}
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 px-3 py-1">
            النقاط المتاحة: {customer.currentPoints}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RedemptionForm
            customer={summaryCustomer}
            selectedCustomerId={selectedCustomerId}
            redemptionItems={redemptionItems}
            setRedemptionItems={setRedemptionItems}
            totalRedemptionPoints={totalRedemptionPoints}
            onCustomerChange={() => {}}
            hasUnpaidInvoices={hasUnpaidInvoices()}
            isCustomerSelected={true}
          />
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
                customer={summaryCustomer}
                totalRedemptionPoints={totalRedemptionPoints}
                onConfirm={handleUpdateRedemption}
                disableConfirm={
                  redemptionItems.length === 0 ||
                  diff > effectiveCurrentPoints ||
                  hasUnpaidInvoices() ||
                  submitting
                }
              />
            </CardContent>
            {redemptionItems.length > 0 && customer && (
              <CardFooter className="flex flex-col items-start">
                <Alert variant={(Number(customer.currentPoints) || 0) >= (totalRedemptionPoints - (Number(redemption.totalPointsRedeemed) || 0)) ? "default" : "destructive"} className="w-full mt-4">
                  {(Number(customer.currentPoints) || 0) >= (totalRedemptionPoints - (Number(redemption.totalPointsRedeemed) || 0)) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>حالة النقاط</AlertTitle>
                  <AlertDescription>
                    {(Number(customer.currentPoints) || 0) >= (totalRedemptionPoints - (Number(redemption.totalPointsRedeemed) || 0))
                      ? `سيتبقى ${(Number(customer.currentPoints) || 0) - (totalRedemptionPoints - (Number(redemption.totalPointsRedeemed) || 0))} نقطة بعد التعديل`
                      : `العميل يحتاج ${(totalRedemptionPoints - (Number(customer.currentPoints) || 0) - (Number(redemption.totalPointsRedeemed) || 0))} نقطة إضافية`
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

export default EditRedemption;
