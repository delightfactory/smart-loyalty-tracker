
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ShoppingCart, 
  Calendar 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { InvoiceStatus, PaymentMethod } from '@/lib/types';
import { invoices, customers } from '@/lib/data';
import { cn } from '@/lib/utils';

const Invoices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const filteredInvoices = invoices.filter(invoice => {
    // Apply search filter
    const customer = customers.find(c => c.id === invoice.customerId);
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    // Apply status filter
    const matchesStatus = statusFilter ? invoice.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG');
  };
  
  const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.UNPAID:
        return "bg-amber-100 text-amber-800";
      case InvoiceStatus.PARTIALLY_PAID:
        return "bg-blue-100 text-blue-800";
      case InvoiceStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <PageContainer title="إدارة الفواتير" subtitle="عرض وإنشاء وإدارة الفواتير">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="بحث عن فاتورة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="جميع الحالات" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الحالات</SelectItem>
              {Object.values(InvoiceStatus).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => navigate('/create-invoice')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            فاتورة جديدة
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>النقاط المكتسبة</TableHead>
              <TableHead>النقاط المستبدلة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => {
                const customer = customers.find(c => c.id === invoice.customerId);
                return (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{customer?.name || 'غير معروف'}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusClass(invoice.status)
                      )}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>{invoice.pointsEarned}</TableCell>
                    <TableCell>{invoice.pointsRedeemed}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-2" />
                    <p>لا توجد فواتير</p>
                    {searchTerm && <p className="text-sm">جرب البحث بمصطلح آخر</p>}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
};

export default Invoices;
