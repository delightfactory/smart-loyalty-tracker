
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FilePlus, 
  CreditCard,
  Coins,
  Gift,
  ArrowLeft
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Customer, Invoice } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CustomerPointsAdjustmentDialog from './CustomerPointsAdjustmentDialog';

interface CustomerActionsBarProps {
  customer: Customer;
  invoices: Invoice[];
  onEdit: () => void;
  onDelete: () => void;
}

const CustomerActionsBar = ({ customer, invoices, onEdit, onDelete }: CustomerActionsBarProps) => {
  const navigate = useNavigate();
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <Button 
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex items-center"
        >
          <Pencil className="ml-2 h-4 w-4" />
          تعديل
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/create-invoice/${customer.id}`)}
          className="flex items-center"
        >
          <FilePlus className="ml-2 h-4 w-4" />
          فاتورة جديدة
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/payments/new?customerId=${customer.id}`)}
          className="flex items-center"
        >
          <CreditCard className="ml-2 h-4 w-4" />
          دفعة جديدة
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/create-redemption/${customer.id}`)}
          className="flex items-center"
        >
          <Gift className="ml-2 h-4 w-4" />
          استبدال نقاط
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPointsDialogOpen(true)}
          className="flex items-center"
        >
          <Coins className="ml-2 h-4 w-4" />
          تعديل النقاط
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/customers')}
          className="flex items-center"
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة للعملاء
        </Button>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف العميل
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {isPointsDialogOpen && (
        <CustomerPointsAdjustmentDialog
          isOpen={isPointsDialogOpen}
          onClose={() => setIsPointsDialogOpen(false)}
          customer={customer}
        />
      )}
    </div>
  );
};

export default CustomerActionsBar;
