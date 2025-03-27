
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, ShoppingCart, CreditCard, Trash2, AlertTriangle } from 'lucide-react';
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
import CustomerRedemptionButton from './CustomerRedemptionButton';
import { Customer, Invoice } from '@/lib/types';

interface CustomerActionsBarProps {
  customer: Customer;
  invoices: Invoice[];
  onEdit: () => void;
  onDelete: () => void;
}

const CustomerActionsBar = ({ customer, invoices, onEdit, onDelete }: CustomerActionsBarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
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
        
        <Button variant="outline" onClick={onEdit}>
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
                onClick={onDelete}
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
  );
};

export default CustomerActionsBar;
