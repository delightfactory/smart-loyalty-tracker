
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  Edit, 
  ShoppingCart, 
  Star, 
  CreditCard, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import PageContainer from '@/components/layout/PageContainer';
import { Customer, Invoice } from '@/lib/types';
import { getCustomerById, getInvoicesByCustomerId, updateCustomer, customers } from '@/lib/data';
import CustomerBasicInfo from '@/components/customer/CustomerBasicInfo';
import CustomerPointsSummary from '@/components/customer/CustomerPointsSummary';
import CustomerPurchasesTable from '@/components/customer/CustomerPurchasesTable';
import CustomerAnalytics from '@/components/customer/CustomerAnalytics';
import CustomerRedemptionButton from '@/components/customer/CustomerRedemptionButton';
import CustomerEditDialog from '@/components/customer/CustomerEditDialog';
import CustomerPaymentHistory from '@/components/customer/CustomerPaymentHistory';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundCustomer = getCustomerById(id);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        
        // Get customer invoices
        const customerInvoices = getInvoicesByCustomerId(id);
        setInvoices(customerInvoices);
      }
    }
  }, [id]);

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    updateCustomer(updatedCustomer);
    setCustomer(updatedCustomer);
    setIsEditDialogOpen(false);
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات العميل بنجاح",
      variant: "default",
    });
  };

  const handleCustomerDelete = () => {
    // Check if customer has any invoices
    if (invoices.length > 0) {
      toast({
        title: "لا يمكن الحذف",
        description: "لا يمكن حذف عميل له فواتير مسجلة",
        variant: "destructive",
      });
      return;
    }

    // Find and remove customer from the array
    const customerIndex = customers.findIndex(c => c.id === id);
    if (customerIndex !== -1) {
      customers.splice(customerIndex, 1);
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح",
        variant: "default",
      });
      
      navigate('/customers');
    }
  };
  
  if (!customer) {
    return (
      <PageContainer title="تحميل..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">جاري تحميل بيانات العميل...</p>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title={customer.name} subtitle={`بيانات وتحليلات العميل`}>
      <div className="mb-6 flex justify-between">
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          العودة للعملاء
        </Button>
        
        <div className="flex gap-2">
          <CustomerRedemptionButton customer={customer} />
          
          <Button variant="outline" onClick={() => navigate(`/create-payment/${customer.id}`)}>
            <CreditCard className="h-4 w-4 ml-2" />
            تسجيل دفعة
          </Button>
          
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 ml-2" />
            تعديل البيانات
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 ml-2" />
                حذف العميل
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف العميل؟</AlertDialogTitle>
                <AlertDialogDescription>
                  هذا الإجراء لا يمكن التراجع عنه. سيؤدي إلى حذف العميل وجميع بياناته من النظام.
                  {invoices.length > 0 && (
                    <div className="mt-4 flex items-center p-3 bg-amber-50 text-amber-800 rounded-md">
                      <AlertTriangle className="h-5 w-5 ml-2 flex-shrink-0" />
                      <span>لا يمكن حذف عميل له فواتير مسجلة ({invoices.length} فاتورة)</span>
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCustomerDelete}
                  disabled={invoices.length > 0}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  تأكيد الحذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={() => navigate(`/create-invoice/${customer.id}`)}>
            <ShoppingCart className="h-4 w-4 ml-2" />
            فاتورة جديدة
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CustomerBasicInfo customer={customer} />
        <CustomerPointsSummary customer={customer} />
      </div>
      
      <Tabs defaultValue="purchases" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="analysis">التحليلات</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases">
          <CustomerPurchasesTable invoices={invoices} customerId={customer.id} />
        </TabsContent>
        
        <TabsContent value="payments">
          <CustomerPaymentHistory customerId={customer.id} />
        </TabsContent>
        
        <TabsContent value="analysis">
          <CustomerAnalytics customerId={customer.id} />
        </TabsContent>

        <TabsContent value="recommendations">
          <CustomerRecommendations customer={customer} invoices={invoices} />
        </TabsContent>
      </Tabs>

      {isEditDialogOpen && (
        <CustomerEditDialog 
          customer={customer} 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleCustomerUpdate}
        />
      )}
    </PageContainer>
  );
};

export default CustomerDetails;
