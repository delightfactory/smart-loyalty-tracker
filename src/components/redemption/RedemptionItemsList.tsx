import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RedemptionItem, Product } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RedemptionItemsListProps {
  redemptionItems: RedemptionItem[];
  onRemoveItem: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  products: Product[];
  numberFormat?: string;
}

const RedemptionItemsList = ({ 
  redemptionItems, 
  onRemoveItem,
  onQuantityChange,
  products,
  numberFormat = 'en-US'
}: RedemptionItemsListProps) => {
  // Calculate total points required
  const totalPoints = redemptionItems.reduce((sum, item) => {
    const itemPoints = Number(item.totalPointsRequired) || 0;
    return sum + itemPoints;
  }, 0);

  // Helper function to get product name
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'منتج غير معروف';
  };

  if (redemptionItems.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        لم تتم إضافة منتجات للاستبدال بعد
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200">المنتج</TableHead>
            <TableHead className="text-center bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200">الكمية</TableHead>
            <TableHead className="text-center bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200">النقاط المطلوبة للوحدة</TableHead>
            <TableHead className="text-center bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200">إجمالي النقاط</TableHead>
            <TableHead className="w-[80px] bg-slate-100 dark:bg-slate-800"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptionItems.map((item, index) => (
            <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{getProductName(item.productId)}</TableCell>
              <TableCell className="text-center">
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => onQuantityChange(index, Number(e.target.value))}
                  className="w-16 text-center"
                />
              </TableCell>
              <TableCell className="text-center text-amber-700 dark:text-amber-300">{Number(item.pointsRequired).toLocaleString(numberFormat)}</TableCell>
              <TableCell className="text-center font-medium text-green-800 dark:text-green-300">{Number(item.totalPointsRequired).toLocaleString(numberFormat)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-50 dark:bg-slate-800">
            <TableCell colSpan={3} className="text-left font-bold text-gray-900 dark:text-gray-100">
              إجمالي النقاط المطلوبة
            </TableCell>
            <TableCell className="text-center font-bold text-amber-600 dark:text-amber-300">
              {totalPoints.toLocaleString(numberFormat)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default RedemptionItemsList;
