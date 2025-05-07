import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Phone, Building, CreditCard, Calendar, Hash, DollarSign } from 'lucide-react';
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
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <dt className="text-sm text-muted-foreground">اسم المسؤول</dt>
              <dd className="font-medium text-blue-600">{customer.contactPerson}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <dt className="text-sm text-muted-foreground">رقم الهاتف</dt>
              <dd className="font-medium text-purple-600" dir="ltr">{customer.phone}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <dt className="text-sm text-muted-foreground">نوع النشاط</dt>
              <dd className="font-medium text-green-600">{customer.businessType}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <dt className="text-sm text-muted-foreground">كود العميل</dt>
              <dd className="font-medium text-indigo-600">{customer.id}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <dt className="text-sm text-muted-foreground">الرصيد الحالي</dt>
              <dd className="font-bold text-4xl text-red-600">{formatNumberEn(calculateCurrentBalance())} ج.م</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <dt className="text-sm text-muted-foreground">الرصيد الافتتاحي</dt>
              <dd className="font-medium text-orange-600">{formatNumberEn(customer.openingBalance ?? 0)} ج.م</dd>
            </div>
          </div>
          {customer.credit_period !== undefined && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <dt className="text-sm text-muted-foreground">مدة الائتمان</dt>
                <dd className="font-medium text-yellow-600">{formatNumberEn(customer.credit_period)} يوم</dd>
              </div>
            </div>
          )}
          {customer.credit_limit !== undefined && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <dt className="text-sm text-muted-foreground">قيمة الائتمان</dt>
                <dd className="font-medium text-teal-600">{formatNumberEn(customer.credit_limit)} ج.م</dd>
              </div>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};

export default CustomerBasicInfo;
