import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService, invoicesService, productsService } from '@/services/database';
import { ProductCategory, Customer, Invoice, Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { formatNumberEn } from '@/lib/formatters';

interface CategoryDiversityTableProps {
  customers?: Customer[];
  invoices?: Invoice[];
  products?: Product[];
  loading?: boolean;
}

function getCustomerCategoryCounts(customers: Customer[], invoices: Invoice[], products: Product[]) {
  // Map productId to category
  const productCategoryMap: Record<string, ProductCategory> = {};
  products.forEach((p) => {
    productCategoryMap[p.id] = p.category;
  });
  return customers.map((customer) => {
    const customerInvoices = invoices.filter((inv) => inv.customerId === customer.id);
    const categories = new Set<ProductCategory>();
    customerInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const cat = productCategoryMap[item.productId];
        if (cat) categories.add(cat);
      });
    });
    return {
      id: customer.id,
      name: customer.name,
      businessType: customer.businessType,
      categoryCount: categories.size,
      categories: Array.from(categories)
    };
  });
}

const CategoryDiversityTable = (props: CategoryDiversityTableProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => await customersService.getAll(),
    enabled: isMounted && !props.customers,
  });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => await invoicesService.getAll(),
    enabled: isMounted && !props.invoices,
  });
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => await productsService.getAll(),
    enabled: isMounted && !props.products,
  });
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const finalCustomers = props.customers || customers;
  const finalInvoices = props.invoices || invoices;
  const finalProducts = props.products || products;
  const loading = props.loading || loadingCustomers || loadingInvoices || loadingProducts;

  const customerCategoryCounts = getCustomerCategoryCounts(finalCustomers, finalInvoices, finalProducts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>تنوع مشتريات العملاء حسب الفئات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">اسم العميل</th>
                <th className="p-2">نوع النشاط</th>
                <th className="p-2">عدد الفئات</th>
                <th className="p-2">الفئات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center">جارٍ التحميل...</td></tr>
              ) : (
                customerCategoryCounts.map((c, idx) => (
                  <tr key={c.id} className={idx % 2 === 0 ? 'bg-green-50/50' : 'bg-white'}>
                    <td className="p-2 font-bold text-green-700">{formatNumberEn(idx + 1)}</td>
                    <td className="p-2 font-semibold">{c.name}</td>
                    <td className="p-2">{c.businessType}</td>
                    <td className="p-2 text-blue-700 font-bold">{formatNumberEn(c.categoryCount)}</td>
                    <td className="p-2">{c.categories.map((cat) => <span key={cat} className="inline-block bg-blue-100 rounded px-2 mx-1 text-xs text-blue-800 font-semibold">{cat}</span>)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryDiversityTable;
