
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Phone, Building, CreditCard } from 'lucide-react';
import { Customer } from '@/lib/types';

interface CustomerBasicInfoProps {
  customer: Customer;
}

const CustomerBasicInfo = ({ customer }: CustomerBasicInfoProps) => {
  const formatNumberEn = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate the complete current balance
  const calculateCurrentBalance = () => {
    // Opening balance is always included as is
    const openingBalance = customer.openingBalance ?? 0;
    // Credit balance from invoices minus payments
    const creditBalance = customer.creditBalance ?? 0;
    
    return openingBalance + creditBalance;
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle>معلومات العميل</CardTitle>
        <CardDescription>البيانات الأساسية</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">اسم المسؤول</p>
                <p className="font-medium">{customer.contactPerson}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium" dir="ltr">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">نوع النشاط</p>
                <p className="font-medium">{customer.businessType}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">كود العميل</p>
                <p className="font-medium">{customer.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">رصيد العميل</p>
                <p className="font-medium">{formatNumberEn(calculateCurrentBalance())} ج.م</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">الرصيد الافتتاحي</p>
                <p className="font-medium">{formatNumberEn(customer.openingBalance ?? 0)} ج.م</p>
              </div>
            </div>
            {customer.credit_period !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-medium">مدة الائتمان:</span>
                <span>{formatNumberEn(customer.credit_period)} يوم</span>
              </div>
            )}
            {customer.credit_limit !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-medium">قيمة الائتمان:</span>
                <span>{formatNumberEn(customer.credit_limit)} EGP</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerBasicInfo;
