import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService } from '@/services/database';
import { useEffect, useState } from 'react';
import { Customer } from '@/lib/types';
import { formatNumberEn } from '@/lib/formatters';

interface BusinessTypeDistributionProps {
  customers?: Customer[];
  loading?: boolean;
}

function getBusinessTypeDistribution(customers: Customer[]) {
  const distribution: Record<string, number> = {};
  customers.forEach((c) => {
    if (!c.businessType) return;
    distribution[c.businessType] = (distribution[c.businessType] || 0) + 1;
  });
  return Object.entries(distribution).map(([type, count]) => ({ type, count }));
}

const BusinessTypeDistribution = (props: BusinessTypeDistributionProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => await customersService.getAll(),
    enabled: isMounted && !props.customers,
  });
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const finalCustomers = props.customers || customers;
  const loading = props.loading || loadingCustomers;
  const distribution = getBusinessTypeDistribution(finalCustomers);

  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع العملاء حسب نوع النشاط</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">نوع النشاط</th>
                <th className="p-2">عدد العملاء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} className="text-center">جارٍ التحميل...</td></tr>
              ) : (
                distribution.map((item, idx) => (
                  <tr key={item.type} className={idx % 2 === 0 ? 'bg-teal-50/50' : 'bg-white'}>
                    <td className="p-2 font-bold text-teal-700">{item.type}</td>
                    <td className="p-2 text-blue-700 font-bold">{formatNumberEn(item.count)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessTypeDistribution;
