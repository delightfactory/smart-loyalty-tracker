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
          variant="default"
          size="sm"
          onClick={onEdit}
          className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
        >
          <Pencil className="ml-2 h-4 w-4" />
          تعديل
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate(`/create-invoice/${customer.id}`)}
          className="flex items-center bg-green-500 text-white hover:bg-green-600"
        >
          <FilePlus className="ml-2 h-4 w-4" />
          فاتورة جديدة
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate(`/create-payment/${customer.id}`)}
          className="flex items-center bg-purple-500 text-white hover:bg-purple-600"
        >
          <CreditCard className="ml-2 h-4 w-4" />
          دفعة جديدة
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate(`/redemptions/create/${customer.id}`)}
          className="flex items-center bg-pink-500 text-white hover:bg-pink-600"
        >
          <Gift className="ml-2 h-4 w-4" />
          استبدال نقاط
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsPointsDialogOpen(true)}
          className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600"
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
