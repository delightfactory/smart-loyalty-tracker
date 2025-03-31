
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  days: number;
}

export const StatusBadge = ({ days }: StatusBadgeProps) => {
  if (days > 90) {
    return <Badge variant="destructive">غير نشط جدًا</Badge>;
  } else if (days > 60) {
    return <Badge variant="outline" className="border-amber-500 text-amber-500">في خطر الضياع</Badge>;
  } else if (days > 30) {
    return <Badge variant="outline" className="border-amber-300 text-amber-600">تحت المراقبة</Badge>;
  } else {
    return <Badge variant="outline" className="border-green-500 text-green-600">حديث الغياب</Badge>;
  }
};
