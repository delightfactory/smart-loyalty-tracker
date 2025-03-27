import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Search, Barcode, User, ShoppingCart, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { products, customers } from '@/lib/data';
import { Product, Customer, ProductCategory, BusinessType } from '@/lib/types';

interface SmartSearchProps {
  type?: 'product' | 'customer' | 'all';
  onSelectProduct?: (product: Product) => void;
  onSelectCustomer?: (customer: Customer) => void;
  placeholder?: string;
  className?: string;
  initialSearchTerm?: string;
}

const SmartSearch = ({
  type = 'all',
  onSelectProduct,
  onSelectCustomer,
  placeholder = 'بحث...',
  className,
  initialSearchTerm = ''
}: SmartSearchProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(initialSearchTerm);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (barcodeMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [barcodeMode]);
  
  useEffect(() => {
    if (barcodeMode && search && search.length > 3) {
      const product = products.find(p => p.id === search);
      if (product) {
        handleSelectProduct(product);
        return;
      }
      
      const customer = customers.find(c => c.id === search);
      if (customer) {
        handleSelectCustomer(customer);
        return;
      }
      
      toast({
        title: "لم يتم العثور على نتائج",
        description: `لم يتم العثور على نتائج للباركود ${search}`,
        variant: "destructive"
      });
      
      setTimeout(() => {
        setSearch('');
      }, 1000);
    }
  }, [search, barcodeMode]);
  
  const filteredProducts = products.filter(product => 
    (type === 'all' || type === 'product') &&
    (product.id.toLowerCase().includes(search.toLowerCase()) ||
     product.name.toLowerCase().includes(search.toLowerCase()) ||
     product.brand.toLowerCase().includes(search.toLowerCase()) ||
     product.category.includes(search))
  ).slice(0, 8);
  
  const filteredCustomers = customers.filter(customer => 
    (type === 'all' || type === 'customer') &&
    (customer.id.toLowerCase().includes(search.toLowerCase()) ||
     customer.name.toLowerCase().includes(search.toLowerCase()) ||
     customer.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
     customer.phone.includes(search) ||
     customer.businessType.includes(search))
  ).slice(0, 8);
  
  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
    setSearch('');
    setOpen(false);
    setBarcodeMode(false);
  };
  
  const handleSelectCustomer = (customer: Customer) => {
    if (onSelectCustomer) {
      onSelectCustomer(customer);
    } else {
      navigate(`/customer/${customer.id}`);
    }
    setSearch('');
    setOpen(false);
    setBarcodeMode(false);
  };
  
  const toggleBarcodeMode = () => {
    setBarcodeMode(!barcodeMode);
    setSearch('');
    if (!barcodeMode) {
      setOpen(false);
    }
  };
  
  const getCategoryColor = (category: ProductCategory) => {
    switch (category) {
      case ProductCategory.ENGINE_CARE:
        return "bg-blue-100 text-blue-800";
      case ProductCategory.EXTERIOR_CARE:
        return "bg-green-100 text-green-800";
      case ProductCategory.TIRE_CARE:
        return "bg-purple-100 text-purple-800";
      case ProductCategory.DASHBOARD_CARE:
        return "bg-amber-100 text-amber-800";
      case ProductCategory.INTERIOR_CARE:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getBusinessTypeColor = (businessType: BusinessType) => {
    switch (businessType) {
      case BusinessType.SERVICE_CENTER:
        return "bg-blue-100 text-blue-800";
      case BusinessType.CAR_SHOWROOM:
        return "bg-green-100 text-green-800";
      case BusinessType.GAS_STATION:
        return "bg-amber-100 text-amber-800";
      case BusinessType.ACCESSORIES_SHOP:
        return "bg-purple-100 text-purple-800";
      case BusinessType.MAINTENANCE_CENTER:
        return "bg-red-100 text-red-800";
      case BusinessType.MARKET:
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      {barcodeMode ? (
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="مسح الباركود..."
            className="pl-10 pr-10"
            autoFocus
          />
          <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            onClick={toggleBarcodeMode}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value && !open) {
                    setOpen(true);
                  }
                }}
                onFocus={() => {
                  if (search) setOpen(true);
                }}
                onClick={() => {
                  if (search) setOpen(true);
                }}
                placeholder={placeholder}
                className="pl-10 pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={toggleBarcodeMode}
              >
                <Barcode className="h-4 w-4" />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" sideOffset={5} style={{ width: '100%' }}>
            <Command>
              <CommandInput placeholder={placeholder} value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>لم يتم العثور على نتائج</CommandEmpty>
                
                {filteredProducts.length > 0 && (
                  <CommandGroup heading="المنتجات">
                    {filteredProducts.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleSelectProduct(product)}
                        className="cursor-pointer"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">({product.id})</span>
                            <Badge className={cn(
                              "text-xs",
                              getCategoryColor(product.category)
                            )}>
                              {product.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{product.price.toLocaleString('ar-EG')} ج.م</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {filteredCustomers.length > 0 && filteredProducts.length > 0 && (
                  <Separator className="my-1" />
                )}
                
                {filteredCustomers.length > 0 && (
                  <CommandGroup heading="العملاء">
                    {filteredCustomers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        onSelect={() => handleSelectCustomer(customer)}
                        className="cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">({customer.id})</span>
                            <Badge className={cn(
                              "text-xs",
                              getBusinessTypeColor(customer.businessType)
                            )}>
                              {customer.businessType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{customer.phone}</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SmartSearch;
