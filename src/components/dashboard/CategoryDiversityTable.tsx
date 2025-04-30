
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Customer, Invoice, Product, ProductCategory } from "@/lib/types";
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
  
  // Count products by category
  products.forEach(product => {
    if (product.category && categoryStats[product.category]) {
      categoryStats[product.category].productCount += 1;
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
        // Track revenue
        if (categoryStats[product.category]) {
          categoryStats[product.category].totalRevenue += item.totalPrice;
          categoriesSeen.add(product.category);
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
              <TableHead className="text-right">الإيرادات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesArray.map((stat) => (
              <TableRow key={stat.category}>
                <TableCell className="font-medium">{stat.category}</TableCell>
                <TableCell className="text-right">{formatNumberEn(stat.productCount)}</TableCell>
                <TableCell className="text-right">{formatNumberEn(stat.customerCount)}</TableCell>
                <TableCell className="text-right">{formatAmountEn(stat.totalRevenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
