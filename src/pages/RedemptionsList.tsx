import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/PageContainer';
import { useRedemptions } from '@/hooks/useRedemptions';
import { RedemptionStatus } from '@/lib/types';
import RedemptionCard from '@/components/redemption/RedemptionCard';
import ViewToggle from '@/components/redemption/ViewToggle';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import DataTable, { Column } from '@/components/ui/DataTable';
import { customersService } from '@/services/database';
import { formatNumberEn } from '@/lib/utils';

const RedemptionListPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { getPaginated, deleteRedemption } = useRedemptions();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<keyof any | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);
  // خريطة أسماء الحقول بين الواجهة وقاعدة البيانات
  const sortMap: Record<string, string> = {
    id: 'id',
    customerId: 'customer_id',
    date: 'date',
    status: 'status',
    totalPointsRedeemed: 'total_points_redeemed'
  };
  const paginatedQuery = getPaginated({
    pageIndex,
    pageSize,
    sortBy: sortBy ? (sortMap[String(sortBy)] || 'date') : undefined,
    sortDir
  });
  const redemptions = paginatedQuery.data?.items ?? [];
  const totalItems = paginatedQuery.data?.total ?? 0;
  const isLoading = paginatedQuery.isLoading;
  const [view, setView] = useState<'table' | 'cards'>(isMobile ? 'cards' : 'table');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; customerId: string; status: RedemptionStatus } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isMobile) setView('cards');
  }, [isMobile]);

  // أسماء العملاء للصفحة الحالية فقط
  const pageCustomerIds = useMemo(() => Array.from(new Set(redemptions.map(r => r.customerId))), [redemptions]);
  const { data: customerNamesMap = {} } = useQuery({
    queryKey: ['customerNames', pageCustomerIds],
    queryFn: () => customersService.getNamesByIds(pageCustomerIds),
    enabled: pageCustomerIds.length > 0
  });
  const getCustomerName = (customerId: string) => customerNamesMap[customerId] || customerId;

  // ملاحظة: لا يمكن جلب بيانات العميل مباشرة هنا بسبب قواعد React hooks
  // إذا أردت اسم العميل، يجب جلب بيانات العملاء مسبقاً أو تعديل backend

  const handleDeleteRedemption = (id: string, customerId: string, status?: RedemptionStatus) => {
    setPendingDelete({ id, customerId, status: status ?? RedemptionStatus.COMPLETED });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRedemption = () => {
    if (pendingDelete) {
      deleteRedemption.mutate(pendingDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPendingDelete(null);
          toast({
            title: 'تم حذف الاستبدال بنجاح',
            description: 'تم حذف عملية الاستبدال وتحديث نقاط العميل.',
            variant: 'default',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'خطأ في الحذف',
            description: error?.message || 'حدث خطأ أثناء حذف عملية الاستبدال.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <PageContainer title="Redemptions List">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">قائمة الاستبدالات</h1>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => navigate('/redemptions/create')}
            >
              <Plus className="h-5 w-5" />
              إنشاء استبدال جديد
            </button>
          </div>
          <ViewToggle view={view} setView={setView} />
          {view === 'table' ? (
            <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
              <DataTable
                data={redemptions}
                loading={isLoading}
                pageIndex={pageIndex}
                onPageChange={setPageIndex}
                totalItems={totalItems}
                defaultPageSize={pageSize}
                sortBy={sortBy as any}
                sortDir={sortDir}
                onSortChange={(accessor, direction) => { setSortBy(accessor); setSortDir(direction); setPageIndex(0); }}
                columns={[
                  { header: 'ID', accessor: 'id' } as Column<any>,
                  { header: 'Customer', accessor: 'customerId', Cell: (_v, row) => row.customerId } as Column<any>,
                  { header: 'Customer Name', accessor: 'customerId', Cell: (_v, row) => getCustomerName(row.customerId) } as Column<any>,
                  { header: 'Date', accessor: 'date', Cell: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '---' } as Column<any>,
                  { header: 'Status', accessor: 'status', Cell: (v) => (
                    <Badge variant={v === RedemptionStatus.COMPLETED ? 'secondary' : v === RedemptionStatus.CANCELLED ? 'destructive' : 'outline'}>
                      {v}
                    </Badge>
                  ) } as Column<any>,
                  { header: 'Points', accessor: 'totalPointsRedeemed', Cell: (v) => formatNumberEn(v) } as Column<any>,
                  { header: '', accessor: 'id', Cell: (_v, row) => (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/redemptions/${row.id}`)}
                        className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/redemptions/${row.id}/edit`)}
                        className="rounded-full p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRedemption(row.id, row.customerId, row.status)}
                        className="rounded-full p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) } as Column<any>,
                ]}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full text-center py-8 text-gray-400">Loading...</div>
              ) : redemptions.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-400">No redemptions found.</div>
              ) : (
                redemptions.map((redemption) => (
                  <RedemptionCard
                    key={redemption.id}
                    redemption={redemption}
                    customerName={getCustomerName(redemption.customerId)}
                    onView={() => navigate(`/redemptions/${redemption.id}`)}
                    onEdit={() => navigate(`/redemptions/${redemption.id}/edit`)}
                    onDelete={() => handleDeleteRedemption(redemption.id, redemption.customerId, redemption.status)}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف عملية الاستبدال</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذه العملية؟ سيتم استرجاع النقاط للعميل مباشرة بعد الحذف ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRedemption}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteRedemption.isPending}
            >
              {deleteRedemption.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'تأكيد الحذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default RedemptionListPage;
