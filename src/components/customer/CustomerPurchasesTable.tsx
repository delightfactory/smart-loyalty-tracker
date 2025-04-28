import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
import PurchasesFilterBar from './PurchasesFilterBar';

interface CustomerPurchasesTableProps {
  invoices: Invoice[];
  customerId: string;
}

const CustomerPurchasesTable = ({ invoices, customerId }: CustomerPurchasesTableProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({from: '', to: ''});

  // Format currency and date in ENGLISH
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'EGP' });
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Filter logic
  const filteredInvoices = invoices.filter((invoice) => {
    const matchSearch = search === '' || invoice.id.includes(search) || invoice.items.some(item => item.productId.includes(search));
    const invoiceDate = new Date(invoice.date);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    const matchDate = (!fromDate || invoiceDate >= fromDate) && (!toDate || invoiceDate <= toDate);
    return matchSearch && matchDate;
  });

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
        {/* Filters and summary */}
        <PurchasesFilterBar
          onSearch={setSearch}
          onDateRangeChange={(from, to) => setDateRange({from, to})}
        />
        <div className="mb-2 flex gap-6 text-xs text-muted-foreground">
          <div>عدد الفواتير: <span className="font-bold text-primary">{filteredInvoices.length}</span></div>
          <div>إجمالي المشتريات: <span className="font-bold text-primary">{filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span></div>
        </div>
        {filteredInvoices.length > 0 ? (
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
              {filteredInvoices.map((invoice) => (
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
            <p>لا توجد فواتير مطابقة للبحث أو التصفية</p>
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
