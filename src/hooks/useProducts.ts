
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/database';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRealtime } from './use-realtime';

export function useProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up realtime updates for products
  useRealtime('products');
  
  const getAll = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const products = await productsService.getAll();
        console.log('Fetched products:', products);
        return products;
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast({
          title: 'خطأ',
          description: `حدث خطأ أثناء جلب المنتجات: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
    }
  });
  
  const getById = (id: string) => useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      try {
        const product = await productsService.getById(id);
        console.log(`Fetched product ${id}:`, product);
        return product;
      } catch (error: any) {
        console.error(`Error fetching product ${id}:`, error);
        toast({
          title: 'خطأ',
          description: `حدث خطأ أثناء جلب المنتج: ${error.message}`,
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!id
  });
  
  const addProduct = useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      console.log('Adding product (before processing):', product);
      
      // تحويل القيم الرقمية بشكل صريح
      const processedProduct = {
        ...product,
        price: Number(product.price || 0),
        pointsEarned: Number(product.pointsEarned || 0),
        pointsRequired: Number(product.pointsRequired || 0)
      };
      
      console.log('Adding product (after processing):', processedProduct);
      return await productsService.create(processedProduct);
    },
    onSuccess: (data) => {
      console.log('Product added successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم إضافة المنتج بنجاح',
        description: 'تمت إضافة المنتج الجديد بنجاح',
      });
    },
    onError: (error: Error) => {
      console.error('Error adding product:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء إضافة المنتج: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const updateProduct = useMutation({
    mutationFn: async (product: Product) => {
      console.log('Updating product (before processing):', product);
      
      // تحويل القيم الرقمية بشكل صريح
      const processedProduct = {
        ...product,
        price: Number(product.price || 0),
        pointsEarned: Number(product.pointsEarned || 0),
        pointsRequired: Number(product.pointsRequired || 0)
      };
      
      console.log('Updating product (after processing):', processedProduct);
      return await productsService.update(processedProduct);
    },
    onSuccess: (data) => {
      console.log('Product updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
      toast({
        title: 'تم تحديث المنتج بنجاح',
        description: 'تم تحديث معلومات المنتج بنجاح',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating product:', error);
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء تحديث المنتج: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting product:', id);
      return await productsService.delete(id);
    },
    onSuccess: (_, variables) => {
      console.log('Product deleted successfully:', variables);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'تم حذف المنتج بنجاح',
        description: 'تم حذف المنتج بنجاح من النظام',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting product:', error);
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
