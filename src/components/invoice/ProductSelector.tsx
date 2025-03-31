
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import SmartSearch from '@/components/search/SmartSearch';
import { Product } from '@/lib/types';
import { useProducts } from '@/hooks/useProducts';
import { useEffect, useState } from 'react';

interface ProductSelectorProps {
  productId: string;
  quantity: number;
  onProductChange: (productId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddItem: () => void;
}

const ProductSelector = ({ 
  productId, 
  quantity, 
  onProductChange, 
  onQuantityChange, 
  onAddItem 
}: ProductSelectorProps) => {
  const { getAll } = useProducts();
  const { data: products = [], isLoading } = getAll;
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    if (products && products.length > 0) {
      setAvailableProducts(products);
    }
  }, [products]);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  const handleSelectProduct = (product: Product) => {
    onProductChange(product.id);
  };
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-4">إضافة منتج</h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5">
          <Label htmlFor="product">المنتج</Label>
          <Select
            value={productId}
            onValueChange={onProductChange}
            disabled={isLoading || availableProducts.length === 0}
          >
            <SelectTrigger id="product">
              <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر منتج"} />
            </SelectTrigger>
            <SelectContent>
              {availableProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({formatCurrency(product.price)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-3">
          <Label htmlFor="productSearch">بحث عن منتج</Label>
          <SmartSearch 
            type="product"
            placeholder="بحث سريع..."
            onSelectProduct={handleSelectProduct}
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="quantity">الكمية</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
          />
        </div>
        
        <div className="md:col-span-2 flex items-end">
          <Button 
            onClick={onAddItem} 
            className="w-full"
            disabled={!productId || quantity <= 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
