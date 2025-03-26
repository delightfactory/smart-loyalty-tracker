
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { FileText, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { getProductById } from '@/lib/data';

interface CustomerPurchasesTableProps {
  invoices: Invoice[];
  customerId: string;
}

const CustomerPurchasesTable = ({ invoices, customerId }: CustomerPurchasesTableProps) => {
  const navigate = useNavigate();
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG');
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>سجل المشتريات</CardTitle>
          <CardDescription>جميع فواتير الشراء</CardDescription>
        </div>
        <Button onClick={() => navigate(`/create-invoice/${customerId}`)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          فاتورة جديدة
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>القيمة</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>النقاط المكتسبة</TableHead>
                <TableHead>المنتجات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow 
                  key={invoice.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/invoice/${invoice.id}`)}
                >
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{formatDate(invoice.date)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      invoice.status === InvoiceStatus.PAID ? "bg-green-100 text-green-800" :
                      invoice.status === InvoiceStatus.OVERDUE ? "bg-red-100 text-red-800" :
                      invoice.status === InvoiceStatus.PARTIALLY_PAID ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800"
                    )}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>{invoice.pointsEarned}</TableCell>
                  <TableCell>{invoice.items.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p>لا توجد فواتير لهذا العميل</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate(`/create-invoice/${customerId}`)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              إنشاء فاتورة جديدة
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerPurchasesTable;
