
import { Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RedemptionItem, Product } from '@/lib/types';

interface RedemptionItemsListProps {
  redemptionItems: RedemptionItem[];
  onRemoveItem: (index: number) => void;
  products: Product[];
}

const RedemptionItemsList = ({ redemptionItems, onRemoveItem, products }: RedemptionItemsListProps) => {
  // Helper function to get product by ID
  const getProductById = (id: string) => products.find(p => p.id === id);

  if (redemptionItems.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground animate-fade-in">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>لم يتم إضافة منتجات للاستبدال بعد</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
            <TableHead>النقاط المطلوبة</TableHead>
            <TableHead>الكمية</TableHead>
            <TableHead>إجمالي النقاط</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {redemptionItems.map((item, index) => {
            const product = getProductById(item.productId);
            return (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell>{product?.name || 'غير معروف'}</TableCell>
                <TableCell>{item.pointsRequired}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.totalPointsRequired}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(index)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RedemptionItemsList;
