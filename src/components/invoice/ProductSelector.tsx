import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

const ProductSelector = ({ productId, quantity, onProductChange, onQuantityChange, onAddItem }: ProductSelectorProps) => {
  const { getAll } = useProducts();
  const { data: products = [], isLoading } = getAll;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // منطق البحث كما في صفحة المنتجات
  const suggestions = searchTerm
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-4">إضافة منتج</h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5">
          <Label htmlFor="product">المنتج</Label>
          <div className="relative">
            <Input
              id="product-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
                onProductChange('');
              }}
              placeholder="بحث بالاسم، الكود أو العلامة التجارية..."
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {isLoading && <Skeleton className="h-10 w-full mt-1" />}
            {!isLoading && showDropdown && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map(prod => (
                  <div
                    key={prod.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => {
                      onProductChange(prod.id);
                      setSearchTerm(prod.name);
                      setShowDropdown(false);
                    }}
                  >
                    {prod.name} ({prod.id})
                  </div>
                ))}
              </div>
            )}
          </div>
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
