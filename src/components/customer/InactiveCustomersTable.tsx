
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Phone, Mail, ArrowUpRight, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from './StatusBadge';

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  avatar: string;
  lastPurchase: Date;
  inactiveDays: number;
  loyaltyPoints: number;
}

interface InactiveCustomersTableProps {
  customers: Customer[];
}

const InactiveCustomersTable = ({ customers }: InactiveCustomersTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">الرقم</TableHead>
              <TableHead>اسم العميل</TableHead>
              <TableHead>آخر شراء</TableHead>
              <TableHead>مدة الغياب</TableHead>
              <TableHead>نقاط العميل</TableHead>
              <TableHead>حالة العميل</TableHead>
              <TableHead>اتصال</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  لا يوجد عملاء تطابق معايير البحث
                </TableCell>
              </TableRow>
            ) : (
              customers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar} alt={customer.name} />
                        <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{format(customer.lastPurchase, 'PPP', { locale: ar })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.inactiveDays > 90 ? "destructive" : customer.inactiveDays > 30 ? "outline" : "secondary"}>
                      {customer.inactiveDays} يوم
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.loyaltyPoints} نقطة</TableCell>
                  <TableCell>
                    <StatusBadge days={customer.inactiveDays} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InactiveCustomersTable;
