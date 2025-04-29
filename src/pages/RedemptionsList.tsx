import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/PageContainer';
import { useRedemptions } from '@/hooks/useRedemptions';
import { useCustomers } from '@/hooks/useCustomers';
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

const RedemptionListPage = () => {
  const navigate = useNavigate();
  const { getAll: getAllRedemptions, deleteRedemption } = useRedemptions();
  const { data: redemptions = [], isLoading } = getAllRedemptions;
  const { getAll: getAllCustomers } = useCustomers();
  const { data: customers = [] } = getAllCustomers;
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; customerId: string; status: RedemptionStatus } | null>(null);
  const { toast } = useToast();

  // Helper to get customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer && typeof customer.name === 'string' ? customer.name : customerId;
  };

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
              onClick={() => navigate('/create-redemption')}
            >
              <Plus className="h-5 w-5" />
              إنشاء استبدال جديد
            </button>
          </div>
          <ViewToggle view={view} setView={setView} />
          {view === 'table' ? (
            <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : redemptions.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No redemptions found.</td></tr>
                  ) : (
                    redemptions.map((redemption) => (
                      <tr key={redemption.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        <TableCell>{redemption.id}</TableCell>
                        <TableCell>{redemption.customerId}</TableCell>
                        <TableCell>{getCustomerName(redemption.customerId)}</TableCell>
                        <TableCell>{redemption.date ? new Date(redemption.date).toLocaleDateString('en-GB') : '---'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            redemption.status === RedemptionStatus.COMPLETED ? 'secondary' : 
                            redemption.status === RedemptionStatus.CANCELLED ? 'destructive' : 'outline'
                          }>
                            {redemption.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{redemption.totalPointsRedeemed}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/redemption/${redemption.id}`)}
                              className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                              aria-label="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/edit-redemption/${redemption.id}`)}
                              className="rounded-full p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRedemption(redemption.id, redemption.customerId, redemption.status)}
                              className="rounded-full p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                    onView={() => navigate(`/redemption/${redemption.id}`)}
                    onEdit={() => navigate(`/edit-redemption/${redemption.id}`)}
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
