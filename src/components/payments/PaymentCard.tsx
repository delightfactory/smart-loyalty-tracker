import React from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, CreditCard, User, FileText, Banknote, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface PaymentProps {
  id: string;
  customerId: string;
  amount: number;
  date: string | Date;
  method?: string;
  invoiceId?: string;
  notes?: string;
  type?: string;
}

interface PaymentCardProps {
  payment: PaymentProps;
  customerName: string;
  invoiceNumber: string;
  onEdit: () => void;
  onDelete: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, customerName, invoiceNumber, onEdit, onDelete }) => {
  const formatDate = (date: string | Date) => {
    try {
      return format(new Date(date), 'yyyy-MM-dd');
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };

  const isPayment = !payment.type || payment.type === 'payment';

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      isPayment 
        ? "border-l-4 border-l-green-500 dark:border-l-green-700" 
        : "border-l-4 border-l-red-500 dark:border-l-red-700"
    )}>
      <CardHeader className="p-4 pb-2 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <CreditCard className="h-5 w-5" />
            <span className="font-mono text-sm">{payment.id}</span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={onEdit}>تعديل</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">حذف</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{customerName}</span>
          </div>
          <Badge variant={isPayment ? "default" : "destructive"} className="flex items-center gap-1">
            {isPayment ? (
              <>
                <ArrowDown className="h-3 w-3" />
                <span>دفعة</span>
              </>
            ) : (
              <>
                <ArrowUp className="h-3 w-3" />
                <span>استرجاع</span>
              </>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(payment.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{invoiceNumber !== '-' ? invoiceNumber : 'بدون فاتورة'}</span>
          </div>
        </div>

        {payment.notes && (
          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded-md break-words">
            {payment.notes}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className={isPayment ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
            <span className="font-mono font-bold">{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </span>
        </div>
        <Badge variant="outline" className="font-normal">
          {payment.method || 'غير محدد'}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;
