
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Invoice } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RecentInvoicesProps {
  invoices: Invoice[];
  customers: any[];
  formatCurrency: (value: number) => string;
}

const RecentInvoices = ({ invoices, customers, formatCurrency }: RecentInvoicesProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>أحدث الفواتير</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const customer = customers.find(c => c.id === invoice.customerId);
            return (
              <div key={invoice.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                  <p className={cn(
                    "text-sm",
                    invoice.status === 'مدفوع' ? "text-green-500" : 
                    invoice.status === 'متأخر' ? "text-red-500" : "text-amber-500"
                  )}>
                    {invoice.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentInvoices;
