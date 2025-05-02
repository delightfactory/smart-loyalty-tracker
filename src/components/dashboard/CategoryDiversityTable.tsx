import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    category: ProductCategory;
    productCount: number;
    customerCount: number;
    totalRevenue: number;
  }> = {};
  
  // Initialize categories
  Object.values(ProductCategory).forEach(category => {
    categoryStats[category] = {
      category: category as ProductCategory,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>تنوع الفئات</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الفئة</TableHead>
              <TableHead className="text-right">عدد المنتجات</TableHead>
              <TableHead className="text-right">عدد العملاء</TableHead>
              <TableHead className="text-right">إجمالي الإيرادات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesArray.map((stat, idx) => (
              <TableRow
                key={stat.category}
                className={
                  idx % 2 === 0
                    ? `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`
                    : `bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100`
                }
                style={{
                  borderRight: `6px solid ${
                    stat.category === 'ENGINE_CARE' ? '#2563eb' :
                    stat.category === 'EXTERIOR_CARE' ? '#059669' :
                    stat.category === 'TIRE_CARE' ? '#f59e42' :
                    stat.category === 'DASHBOARD_CARE' ? '#d97706' :
                    stat.category === 'INTERIOR_CARE' ? '#a21caf' :
                    stat.category === 'SUPPLIES' ? '#0ea5e9' :
                    '#64748b'
                  }`
                }}
              >
                <TableCell className="font-medium dark:text-gray-100">
                  {ProductCategoryLabels[stat.category as ProductCategory] || stat.category}
                </TableCell>
                <TableCell className="text-right font-bold text-blue-700 dark:text-blue-300">
                  {formatNumberEn(stat.productCount)}
                </TableCell>
                <TableCell className="text-right font-bold text-green-700 dark:text-green-300">
                  {formatNumberEn(stat.customerCount)}
                </TableCell>
                <TableCell className="text-right font-bold text-purple-700 dark:text-purple-300">
                  {formatAmountEn(stat.totalRevenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
