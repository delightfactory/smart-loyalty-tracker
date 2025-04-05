
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RedemptionItem, Product } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface RedemptionItemsListProps {
  redemptionItems: RedemptionItem[];
  onRemoveItem: (index: number) => void;
  products: Product[];
}

const RedemptionItemsList = ({ 
  redemptionItems, 
  onRemoveItem,
  products 
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
            <TableHead className="text-center">الكمية</TableHead>
            <TableHead className="text-center">النقاط المطلوبة للوحدة</TableHead>
            <TableHead className="text-center">إجمالي النقاط</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptionItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{getProductName(item.productId)}</TableCell>
              <TableCell className="text-center">{Number(item.quantity)}</TableCell>
              <TableCell className="text-center">{Number(item.pointsRequired)}</TableCell>
              <TableCell className="text-center font-medium">{Number(item.totalPointsRequired)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-50">
            <TableCell colSpan={3} className="text-left font-bold">
              إجمالي النقاط المطلوبة
            </TableCell>
            <TableCell className="text-center font-bold text-amber-600">
              {totalPoints}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default RedemptionItemsList;
