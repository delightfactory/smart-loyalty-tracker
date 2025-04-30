import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
} from '@/components/ui/table';
import { Customer } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CustomersListProps {
  customers: Customer[];
}

const formatNumberEn = (num: number) => {
  return num.toLocaleString('en-US');
};

const CustomersList = ({ customers }: CustomersListProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>قائمة العملاء</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم العميل</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>نوع النشاط</TableHead>
              <TableHead>المنطقة</TableHead>
              <TableHead>مدة الائتمان (يوم)</TableHead>
              <TableHead>قيمة الائتمان (EGP)</TableHead>
              <TableHead>...</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.businessType}</TableCell>
                <TableCell>{customer.region}</TableCell>
                <TableCell>{formatNumberEn(customer.credit_period ?? 0)}</TableCell>
                <TableCell>{formatNumberEn(customer.credit_limit ?? 0)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-white",
                      index === 0 ? "bg-yellow-500" : 
                      index === 1 ? "bg-gray-400" : 
                      index === 2 ? "bg-amber-700" : "bg-gray-200"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.currentPoints} نقطة</p>
                      <p className="text-sm text-muted-foreground">المستوى {customer.level}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CustomersList;
