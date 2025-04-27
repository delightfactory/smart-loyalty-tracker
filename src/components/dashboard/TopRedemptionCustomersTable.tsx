import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService, redemptionsService } from '@/services/database';
import { useEffect, useState } from 'react';
import { Customer, Redemption } from '@/lib/types';
import { formatNumberEn } from '@/lib/formatters';

interface TopRedemptionCustomersTableProps {
  customers?: Customer[];
  redemptions?: Redemption[];
  loading?: boolean;
  max?: number;
}

function getTopRedemptionCustomers(customers: Customer[], redemptions: Redemption[], max = 10) {
  // حساب إجمالي النقاط المستبدلة لكل عميل
  const customerRedemption: Record<string, { name: string; businessType: string; totalPoints: number }> = {};
  customers.forEach((c) => {
    customerRedemption[c.id] = {
      name: c.name,
      businessType: c.businessType,
      totalPoints: 0,
    };
  });
  redemptions.forEach((r) => {
    if (!customerRedemption[r.customerId]) return;
    // جمع إجمالي النقاط المستبدلة من جميع العناصر في عملية الاستبدال
    customerRedemption[r.customerId].totalPoints += Number(r.totalPointsRedeemed) || 0;
  });
  return Object.entries(customerRedemption)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, max)
    .filter((c) => c.totalPoints > 0);
}

const TopRedemptionCustomersTable = (props: TopRedemptionCustomersTableProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => await customersService.getAll(),
    enabled: isMounted && !props.customers,
  });
  const { data: redemptions = [], isLoading: loadingRedemptions } = useQuery({
    queryKey: ['redemptions'],
    queryFn: async () => await redemptionsService.getAll(),
    enabled: isMounted && !props.redemptions,
  });
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const finalCustomers = props.customers || customers;
  const finalRedemptions = props.redemptions || redemptions;
  const loading = props.loading || loadingCustomers || loadingRedemptions;
  const max = props.max || 10;

  const topRedemptionCustomers = getTopRedemptionCustomers(finalCustomers, finalRedemptions, max);

  return (
    <Card>
      <CardHeader>
        <CardTitle>أفضل العملاء في استبدال النقاط</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">اسم العميل</th>
                <th className="p-2">نوع النشاط</th>
                <th className="p-2">إجمالي النقاط المستبدلة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center">جارٍ التحميل...</td></tr>
              ) : (
                topRedemptionCustomers.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-pink-50/50' : 'bg-white'}>
                    <td className="p-2 font-bold text-pink-700">{formatNumberEn(idx + 1)}</td>
                    <td className="p-2 font-semibold">{c.name}</td>
                    <td className="p-2">{c.businessType}</td>
                    <td className="p-2 text-purple-700 font-bold">{formatNumberEn(c.totalPoints)}</td>
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

export default TopRedemptionCustomersTable;
