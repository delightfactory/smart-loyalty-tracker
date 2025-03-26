
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Customer } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CustomersListProps {
  customers: Customer[];
}

const CustomersList = ({ customers }: CustomersListProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>أفضل العملاء</CardTitle>
        <CardDescription>بناءً على النقاط المكتسبة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div key={customer.id} className="flex items-center justify-between">
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
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.businessType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{customer.pointsEarned} نقطة</p>
                <p className="text-sm text-muted-foreground">المستوى {customer.level}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersList;
