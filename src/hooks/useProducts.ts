
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/database';
import { Product } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useRealtime } from './use-realtime';

export function useProducts() {
  const queryClient = useQueryClient();
  
  // Set up realtime updates for products
  useRealtime('products');
  
  const getAll = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll()
  });
  
  const getById = (id: string) => useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id
  });
  
  const addProduct = useMutation({
    mutationFn: (product: Omit<Product, 'id'>) => productsService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم إضافة المنتج بنجاح',
        description: 'تمت إضافة المنتج الجديد بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء إضافة المنتج: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updateProduct = useMutation({
    mutationFn: (product: Product) => productsService.update(product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
      toast({
        title: 'تم تحديث المنتج بنجاح',
        description: 'تم تحديث معلومات المنتج بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث المنتج: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteProduct = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم حذف المنتج بنجاح',
        description: 'تم حذف المنتج بنجاح من النظام',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف المنتج: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    getAll,
    getById,
    addProduct,
    updateProduct,
    deleteProduct
  };
}
