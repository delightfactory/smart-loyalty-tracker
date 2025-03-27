
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import PageContainer from '@/components/layout/PageContainer';
import { Customer, Invoice } from '@/lib/types';
import CustomerBasicInfo from '@/components/customer/CustomerBasicInfo';
import CustomerPointsSummary from '@/components/customer/CustomerPointsSummary';
import CustomerEditDialog from '@/components/customer/CustomerEditDialog';
import CustomerDetailsTabs from '@/components/customer/CustomerDetailsTabs';
import CustomerActionsBar from '@/components/customer/CustomerActionsBar';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Use React Query hooks
  const { getById, updateCustomer, deleteCustomer } = useCustomers();
  const { getByCustomerId } = useInvoices();
  
  const customerQuery = getById(id || '');
  const invoicesQuery = getByCustomerId(id || '');
  
  // Loading state
  const isLoading = customerQuery.isLoading || invoicesQuery.isLoading;
  
  // Error handling
  const hasError = customerQuery.isError || invoicesQuery.isError;
  
  // Customer data
  const customer = customerQuery.data;
  const invoices = invoicesQuery.data || [];

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    updateCustomer.mutate(updatedCustomer, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات العميل بنجاح",
          variant: "default",
        });
      }
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

    deleteCustomer.mutate(id || '', {
      onSuccess: () => {
        toast({
          title: "تم الحذف",
          description: "تم حذف العميل بنجاح",
          variant: "default",
        });
        navigate('/customers');
      }
    });
  };
  
  if (isLoading) {
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
  
  if (hasError || !customer) {
    return (
      <PageContainer title="خطأ" subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">حدث خطأ أثناء تحميل بيانات العميل</p>
            <button 
              className="mt-4 underline text-primary"
              onClick={() => navigate('/customers')}
            >
              العودة لقائمة العملاء
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title={customer.name} subtitle={`بيانات وتحليلات العميل`}>
      <CustomerActionsBar 
        customer={customer} 
        invoices={invoices} 
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={handleCustomerDelete}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CustomerBasicInfo customer={customer} />
        <CustomerPointsSummary customer={customer} />
      </div>
      
      <CustomerDetailsTabs customer={customer} invoices={invoices} />

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
