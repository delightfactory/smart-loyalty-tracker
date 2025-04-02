
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ClipboardCheck, Printer, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/PageContainer';
import { RedemptionStatus } from '@/lib/types';
import RedemptionDetailsCard from '@/components/redemption/RedemptionDetailsCard';
import { useRedemptions } from '@/hooks/useRedemptions';
import { useCustomers } from '@/hooks/useCustomers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RedemptionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // React Query hooks
  const { getById, updateRedemption, deleteRedemption } = useRedemptions();
  const { getById: getCustomer } = useCustomers();
  
  // Get redemption and customer data
  const redemptionQuery = getById(id || '');
  const redemption = redemptionQuery.data;
  
  const customerQuery = getCustomer(redemption?.customerId || '');
  const customer = customerQuery.data;
  
  // Loading state
  const isLoading = redemptionQuery.isLoading || customerQuery.isLoading;
  
  // Error handling
  const hasError = redemptionQuery.isError || customerQuery.isError;
  
  const handleCancelRedemption = () => {
    if (!redemption) return;
    
    // تحديث حالة الاستبدال إلى "ملغي"
    const updatedRedemption = { 
      ...redemption, 
      status: RedemptionStatus.CANCELLED 
    };
    
    updateRedemption.mutate(updatedRedemption, {
      onSuccess: () => {
        toast({
          title: "تم الإلغاء",
          description: "تم إلغاء عملية الاستبدال بنجاح",
          variant: "default",
        });
        
        // إعادة النقاط للعميل
        if (customer) {
          const updatedCustomer = { ...customer };
          updatedCustomer.pointsRedeemed -= redemption.totalPointsRedeemed;
          updatedCustomer.currentPoints = updatedCustomer.pointsEarned - updatedCustomer.pointsRedeemed;
          
          // TODO: تحديث بيانات العميل
        }
      },
      onError: (error) => {
        toast({
          title: "خطأ",
          description: `حدث خطأ أثناء إلغاء الاستبدال: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleDeleteRedemption = () => {
    if (!redemption) return;
    
    deleteRedemption.mutate(redemption.id, {
      onSuccess: () => {
        toast({
          title: "تم الحذف",
          description: "تم حذف عملية الاستبدال بنجاح",
          variant: "default",
        });
        
        navigate(`/customer/${redemption.customerId}`);
      },
      onError: (error) => {
        toast({
          title: "خطأ",
          description: `حدث خطأ أثناء حذف الاستبدال: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handlePrintReceipt = () => {
    // TODO: إضافة وظيفة الطباعة
    toast({
      title: "جاري الطباعة",
      description: "جاري طباعة إيصال الاستبدال",
      variant: "default",
    });
  };
  
  if (isLoading) {
    return (
      <PageContainer title="تحميل..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">جاري تحميل بيانات الاستبدال...</p>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  if (hasError || !redemption) {
    return (
      <PageContainer title="خطأ" subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">حدث خطأ أثناء تحميل بيانات الاستبدال</p>
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
  
  return (
    <PageContainer 
      title="تفاصيل الاستبدال" 
      subtitle={`عملية استبدال النقاط رقم ${redemption.id}`}
    >
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
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintReceipt}
          >
            <Printer className="h-4 w-4 mr-2" />
            طباعة
          </Button>
          
          {redemption.status === RedemptionStatus.PENDING && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancelRedemption}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              تغيير الحالة
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            حذف
          </Button>
        </div>
        
        <RedemptionDetailsCard 
          redemption={redemption} 
          onCancel={redemption.status === RedemptionStatus.PENDING ? handleCancelRedemption : undefined}
          onPrint={handlePrintReceipt}
        />
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف عملية الاستبدال؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف عملية الاستبدال نهائياً من النظام.
              {redemption.status === RedemptionStatus.COMPLETED && " لن يتم إعادة النقاط للعميل."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRedemption} className="bg-red-600 hover:bg-red-700">
              نعم، قم بالحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default RedemptionDetails;
