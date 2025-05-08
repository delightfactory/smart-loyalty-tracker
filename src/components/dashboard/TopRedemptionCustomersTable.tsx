import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService, redemptionsService } from '@/services/database';
import { useEffect, useState } from 'react';
import { Customer, Redemption } from '@/lib/types';
import { formatNumberEn } from '@/lib/formatters';
import DataTable, { Column } from '@/components/ui/DataTable';

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

  // تعريف أعمدة الجدول
  type Row = typeof topRedemptionCustomers[number];
  const columns: Column<Row>[] = [
    { header: '#', accessor: 'id', Cell: (_v, _r, i) => formatNumberEn(i + 1) },
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'نوع النشاط', accessor: 'businessType' },
    { header: 'إجمالي النقاط المستبدلة', accessor: 'totalPoints', Cell: (v) => formatNumberEn(v) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>أفضل العملاء في استبدال النقاط</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center">جارٍ التحميل...</div>
        ) : (
          <DataTable data={topRedemptionCustomers} columns={columns} defaultPageSize={max} />
        )}
      </CardContent>
    </Card>
  );
};

export default TopRedemptionCustomersTable;
