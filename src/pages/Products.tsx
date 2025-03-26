
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package, Plus, Search, Filter, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { ProductCategory, Product } from '@/lib/types';
import { products, addProduct } from '@/lib/data';
import { cn } from '@/lib/utils';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    unit: '',
    category: ProductCategory.ENGINE_CARE,
    price: 0,
    pointsEarned: 0,
    pointsRequired: 0,
    brand: ''
  });

  const filteredProducts = products.filter(product => {
    // Apply search filter
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter - Use 'all' instead of empty string
    const matchesCategory = categoryFilter !== 'all' ? product.category === categoryFilter : true;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleAddProduct = () => {
    const productId = `P${(products.length + 1).toString().padStart(3, '0')}`;
    const product: Product = {
      id: productId,
      ...newProduct as Omit<Product, 'id'>
    };
    
    addProduct(product);
    setNewProduct({
      name: '',
      unit: '',
      category: ProductCategory.ENGINE_CARE,
      price: 0,
      pointsEarned: 0,
      pointsRequired: 0,
      brand: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };
  
  const categoryColorMap: Record<ProductCategory, string> = {
    [ProductCategory.ENGINE_CARE]: 'bg-blue-100 text-blue-800',
    [ProductCategory.EXTERIOR_CARE]: 'bg-green-100 text-green-800',
    [ProductCategory.TIRE_CARE]: 'bg-purple-100 text-purple-800',
    [ProductCategory.DASHBOARD_CARE]: 'bg-amber-100 text-amber-800',
    [ProductCategory.INTERIOR_CARE]: 'bg-red-100 text-red-800'
  };

  return (
    <PageContainer title="إدارة المنتجات" subtitle="عرض وإضافة وتعديل المنتجات">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="بحث عن منتج..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="جميع الأقسام" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {Object.values(ProductCategory).map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">اسم المنتج</Label>
                    <Input 
                      id="name" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">وحدة القياس</Label>
                    <Input 
                      id="unit" 
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">البراند</Label>
                    <Input 
                      id="brand" 
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">القسم</Label>
                    <Select 
                      value={newProduct.category} 
                      onValueChange={(value) => setNewProduct({...newProduct, category: value as ProductCategory})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProductCategory).map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">السعر</Label>
                    <Input 
                      id="price"
                      type="number"
                      value={newProduct.price?.toString() || ''}
                      onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointsEarned">النقاط المكتسبة</Label>
                    <Input 
                      id="pointsEarned"
                      type="number"
                      value={newProduct.pointsEarned?.toString() || ''}
                      onChange={(e) => setNewProduct({...newProduct, pointsEarned: Number(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointsRequired">النقاط المطلوبة للاستبدال</Label>
                    <Input 
                      id="pointsRequired"
                      type="number"
                      value={newProduct.pointsRequired?.toString() || ''}
                      onChange={(e) => setNewProduct({...newProduct, pointsRequired: Number(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddProduct}>إضافة المنتج</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>كود المنتج</TableHead>
              <TableHead>اسم المنتج</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>وحدة القياس</TableHead>
              <TableHead>البراند</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>النقاط المكتسبة</TableHead>
              <TableHead>النقاط المطلوبة</TableHead>
              <TableHead className="w-[80px]">تفاصيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      categoryColorMap[product.category]
                    )}>
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.price} ج.م</TableCell>
                  <TableCell>{product.pointsEarned}</TableCell>
                  <TableCell>{product.pointsRequired}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewProduct(product.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">عرض</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-10 w-10 mb-2" />
                    <p>لا توجد منتجات</p>
                    {searchTerm && <p className="text-sm">جرب البحث بمصطلح آخر</p>}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
};

export default Products;
