
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InactivityStatCardsProps {
  criticalCount: number;
  warningCount: number;
  recentCount: number;
}

const InactivityStatCards = ({ criticalCount, warningCount, recentCount }: InactivityStatCardsProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <Card className="border-r-4 border-r-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">عملاء غير نشطين جدًا</CardTitle>
          <CardDescription>
            غائبون لأكثر من 90 يوم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{criticalCount}</div>
          <p className="text-muted-foreground mt-2">بحاجة لمتابعة عاجلة</p>
        </CardContent>
      </Card>
      <Card className="border-r-4 border-r-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">عملاء في خطر الضياع</CardTitle>
          <CardDescription>
            غائبون بين 30-90 يوم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{warningCount}</div>
          <p className="text-muted-foreground mt-2">بحاجة للتواصل معهم</p>
        </CardContent>
      </Card>
      <Card className="border-r-4 border-r-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">عملاء حديثي الغياب</CardTitle>
          <CardDescription>
            غائبون أقل من 30 يوم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{recentCount}</div>
          <p className="text-muted-foreground mt-2">فرصة للتذكير</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InactivityStatCards;
