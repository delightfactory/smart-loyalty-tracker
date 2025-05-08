import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gift, Loader2, GripVertical } from 'lucide-react';
import { useRedemptions } from '@/hooks/useRedemptions';
import { RedemptionStatus } from '@/lib/types';
import RedemptionsFilterBar from './RedemptionsFilterBar';
import TableWrapper from '@/components/ui/TableWrapper';
import { Pagination, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';

interface CustomerRedemptionsTableProps {
  customerId: string;
}

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const CustomerRedemptionsTable = ({ customerId }: CustomerRedemptionsTableProps) => {
  const { getByCustomerId } = useRedemptions();
  const { data: redemptions = [], isLoading } = getByCustomerId(customerId);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{from: string, to: string}>({from: '', to: ''});

  // Filter logic
  const filteredRedemptions = redemptions.filter((r: any) => {
    const matchSearch = search === '' || r.id.includes(search) || (r.notes && r.notes.includes(search));
    const redemptionDate = new Date(r.date);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    const matchDate = (!fromDate || redemptionDate >= fromDate) && (!toDate || redemptionDate <= toDate);
    return matchSearch && matchDate;
  });

  // إضافة pagination
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const totalItems = filteredRedemptions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedRedemptions = filteredRedemptions.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="mr-2 h-5 w-5" />
          سجل الاستبدال
        </CardTitle>
        <CardDescription>جميع عمليات استبدال النقاط للعميل</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-3" />
            <p>جاري تحميل بيانات الاستبدال...</p>
          </div>
        ) : (
          <>
            <RedemptionsFilterBar
              onSearch={setSearch}
              onDateRangeChange={(from, to) => setDateRange({from, to})}
            />
            <div className="mb-2 flex gap-6 text-xs text-muted-foreground">
              <div>عدد العمليات: <span className="font-bold text-primary">{filteredRedemptions.length}</span></div>
              <div>إجمالي النقاط المستبدلة: <span className="font-bold text-primary">{filteredRedemptions.reduce((sum, r) => sum + r.totalPointsRedeemed, 0)}</span></div>
            </div>
            {filteredRedemptions.length > 0 ? (
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {["رقم العملية","التاريخ","النقاط المستبدلة","الحالة","ملاحظات"].map(label => (
                        <TableHead key={label}>
                          <div className="flex items-center gap-1 cursor-move">
                            <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            {label}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRedemptions.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>{formatDate(r.date)}</TableCell>
                        <TableCell>{r.totalPointsRedeemed}</TableCell>
                        <TableCell>
                          <Badge className={
                            r.status === RedemptionStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                            r.status === RedemptionStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {r.status === RedemptionStatus.COMPLETED ? 'مكتمل' :
                             r.status === RedemptionStatus.PENDING ? 'معلق' :
                             'ملغي'}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrapper>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Gift className="h-12 w-12 mb-4 opacity-50" />
                <p>لا توجد عمليات مطابقة للبحث أو التصفية</p>
              </div>
            )}
            {filteredRedemptions.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationPrevious className={pageIndex === 0 ? 'opacity-50 pointer-events-none' : ''} onClick={() => pageIndex > 0 && setPageIndex(p => p - 1)} />
                  {[...Array(totalPages)].map((_, idx) => (
                    <PaginationLink key={idx} isActive={idx === pageIndex} onClick={() => setPageIndex(idx)}>
                      {idx + 1}
                    </PaginationLink>
                  ))}
                  <PaginationNext className={pageIndex === totalPages - 1 ? 'opacity-50 pointer-events-none' : ''} onClick={() => pageIndex < totalPages - 1 && setPageIndex(p => p + 1)} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerRedemptionsTable;
