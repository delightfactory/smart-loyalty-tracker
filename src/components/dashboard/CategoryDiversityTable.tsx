import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable, { Column } from '@/components/ui/DataTable';
import { Customer, Invoice, Product, ProductCategory, ProductCategoryLabels } from "@/lib/types";
import { formatAmountEn, formatNumberEn } from "@/lib/formatters";

export default function CategoryDiversityTable({
  customers,
  invoices,
  products,
}: {
  customers: Customer[];
  invoices: Invoice[];
  products: Product[];
}) {
  // Create a map of product categories to track their stats
  const categoryStats: Record<string, {
    category: string;
    productCount: number;
    customerCount: number;
    totalRevenue: number;
  }> = {};
  
  // Initialize categories
  Object.values(ProductCategory).forEach(category => {
    categoryStats[category] = {
      category: category as string,
      productCount: 0,
      customerCount: 0,
      totalRevenue: 0
    };
  });
  
  // Count products by category (fix: support string category)
  products.forEach(product => {
    // دعم الفئة كـ string أو enum
    let catKey = product.category;
    // إذا كانت الفئة بالعربية قم بتحويلها إلى الكود المناسب
    const foundEnum = Object.entries(ProductCategoryLabels).find(([_key, label]) => label === product.category);
    if (foundEnum) catKey = foundEnum[0];
    if (catKey && categoryStats[catKey]) {
      categoryStats[catKey].productCount += 1;
    }
  });
  
  // Create a set to track unique customers per category
  const categoryCustomers: Record<string, Set<string>> = {};
  Object.values(ProductCategory).forEach(category => {
    categoryCustomers[category] = new Set();
  });
  
  // Process invoices to get customer diversity and revenue
  invoices.forEach(invoice => {
    if (!invoice.items) return;
    
    const categoriesSeen = new Set<string>();
    
    invoice.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.category) {
        let catKey = product.category;
        const foundEnum = Object.entries(ProductCategoryLabels).find(([_key, label]) => label === product.category);
        if (foundEnum) catKey = foundEnum[0];
        // Track revenue
        if (categoryStats[catKey]) {
          categoryStats[catKey].totalRevenue += item.totalPrice;
          categoriesSeen.add(catKey);
        }
      }
    });
    
    // Add customer to each category they purchased from
    if (invoice.customerId) {
      categoriesSeen.forEach(category => {
        if (categoryCustomers[category]) {
          categoryCustomers[category].add(invoice.customerId);
        }
      });
    }
  });
  
  // Update customer counts
  Object.entries(categoryCustomers).forEach(([category, customerSet]) => {
    if (categoryStats[category]) {
      categoryStats[category].customerCount = customerSet.size;
    }
  });
  
  // Convert to array and sort by revenue
  const categoriesArray = Object.values(categoryStats).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  // تعريف أعمدة الجدول
  type Row = typeof categoriesArray[number];
  const columns: Column<Row>[] = [
    { header: 'الفئة', accessor: 'category', Cell: (v) => ProductCategoryLabels[v as ProductCategory] || v },
    { header: 'عدد المنتجات', accessor: 'productCount', Cell: (v) => formatNumberEn(v) },
    { header: 'عدد العملاء', accessor: 'customerCount', Cell: (v) => formatNumberEn(v) },
    { header: 'إجمالي الإيرادات', accessor: 'totalRevenue', Cell: (v) => formatAmountEn(v) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>تنوع الفئات</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable data={categoriesArray} columns={columns} defaultPageSize={categoriesArray.length} />
      </CardContent>
    </Card>
  );
}
