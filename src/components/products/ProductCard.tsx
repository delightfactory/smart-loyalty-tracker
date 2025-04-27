import React from "react";
import { Product } from "@/lib/types";
import { Button } from "../ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { formatNumberEn } from "@/lib/formatters";

interface ProductCardProps {
  product: Product;
  onView: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onEdit, onDelete }) => {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg p-4 flex flex-col gap-4 w-full">
      {/* رأس البطاقة: اسم المنتج والقسم */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <span className="inline-block px-3 py-1 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200 font-bold text-base shadow-sm max-w-[60%] truncate">
          {product.name}
        </span>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gradient-to-l from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 shadow-sm">
          {product.category}
        </span>
        <span className="inline-block px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-xs shadow-sm ml-auto">
          {product.id}
        </span>
      </div>
      {/* تفاصيل المنتج */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-1">
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 dark:text-gray-400 text-xs">الوحدة</span>
          <span className="inline-block px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900 text-orange-800 dark:text-orange-200 font-medium text-center">
            {product.unit}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 dark:text-gray-400 text-xs">البراند</span>
          <span className="inline-block px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium text-center">
            {product.brand}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 dark:text-gray-400 text-xs">السعر</span>
          <span className="inline-block px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold text-center">
            {formatNumberEn(product.price)} ج.م
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 dark:text-gray-400 text-xs">النقاط المكتسبة</span>
          <span className="inline-block px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold text-center">
            {formatNumberEn(product.pointsEarned)} نقطة
          </span>
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <span className="text-gray-500 dark:text-gray-400 text-xs">النقاط المطلوبة للاستبدال</span>
          <span className="inline-block px-2 py-1 rounded-lg bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 font-bold text-center">
            {formatNumberEn(product.pointsRequired)}
          </span>
        </div>
      </div>
      {/* أزرار الإجراءات */}
      <div className="flex gap-2 mt-2 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onView(product.id)}
          className="hover:bg-blue-200 dark:hover:bg-blue-800 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-100 dark:border-blue-900 rounded-lg shadow-sm transition"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">عرض</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(product)}
          className="hover:bg-yellow-200 dark:hover:bg-yellow-800 bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border border-yellow-100 dark:border-yellow-900 rounded-lg shadow-sm transition"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">تعديل</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(product.id)}
          className="hover:bg-red-200 dark:hover:bg-red-800 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-100 dark:border-red-900 rounded-lg shadow-sm transition"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">حذف</span>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
