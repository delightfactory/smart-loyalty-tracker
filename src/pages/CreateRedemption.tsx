
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from 'lucide-react';
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
  
  // React Query hooks
  const { getById, updateCustomer } = useCustomers();
  const { getByCustomerId } = useInvoices();
  const { addRedemption } = useRedemptions();

  // Get customer data
  const customerQuery = getById(selectedCustomerId);
  const customer = customerQuery.data;
  
  // Get customer invoices 
  const invoicesQuery = getByCustomerId(selectedCustomerId);
  const customerInvoices = invoicesQuery.data || [];
  
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
    
    // Create redemption using the hook
    const currentDate = new Date();
    
    addRedemption.mutate({
      redemption: {
        customerId: selectedCustomerId,
        date: currentDate,
        totalPointsRedeemed: totalRedemptionPoints,
        status: RedemptionStatus.COMPLETED
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
        
        navigate(customerId ? `/customer/${customerId}` : '/customers');
      }
    });
  };
  
  return (
    <PageContainer title="استبدال النقاط" subtitle="استبدال نقاط الولاء بمنتجات">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        
        <RedemptionSummary 
          customer={customer}
          totalRedemptionPoints={totalRedemptionPoints}
          onConfirm={handleCreateRedemption}
          disableConfirm={
            !customer || 
            redemptionItems.length === 0 || 
            !canRedeemPoints(customer?.id || '', totalRedemptionPoints)
          }
        />
      </div>
    </PageContainer>
  );
};

export default CreateRedemption;
