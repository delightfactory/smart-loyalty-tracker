
import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Phone, Mail, ArrowUpRight, History, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { customers } from '@/lib/data';

// Mock data to simulate inactive customers
const inactiveCustomers = customers.map(customer => ({
  ...customer,
  lastPurchase: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000),
  inactiveDays: Math.floor(Math.random() * 180) + 1,
}));

const CustomerFollowup = () => {
  const [period, setPeriod] = useState<string>("30");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [filteredCustomers, setFilteredCustomers] = useState(inactiveCustomers);
  
  // Filter customers based on inactivity period
  useEffect(() => {
    const days = parseInt(period);
    const filtered = inactiveCustomers.filter(customer => 
      customer.inactiveDays >= days
    );
    setFilteredCustomers(filtered.sort((a, b) => b.inactiveDays - a.inactiveDays));
  }, [period]);

  // Group customers by inactivity range
  const criticalCustomers = filteredCustomers.filter(c => c.inactiveDays > 90);
  const warningCustomers = filteredCustomers.filter(c => c.inactiveDays >= 30 && c.inactiveDays <= 90);
  const recentCustomers = filteredCustomers.filter(c => c.inactiveDays < 30);

  return (
    <PageContainer 
      title="متابعة العملاء"
      subtitle="متابعة العملاء غير النشطين وتحفيزهم على العودة للشراء"
      showSearch
      searchPlaceholder="بحث عن عميل..."
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div className="flex gap-2 items-center">
            <History className="text-muted-foreground h-5 w-5" />
            <h3 className="font-medium">تصفية حسب فترة عدم النشاط</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 يوم</SelectItem>
                <SelectItem value="30">30 يوم</SelectItem>
                <SelectItem value="60">60 يوم</SelectItem>
                <SelectItem value="90">90 يوم</SelectItem>
                <SelectItem value="180">180 يوم</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-right"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? (
                    format(date, 'PPP', { locale: ar })
                  ) : (
                    <span>اختر تاريخًا محددًا</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <Card className="border-r-4 border-r-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">عملاء غير نشطين جدًا</CardTitle>
              <CardDescription>
                غائبون لأكثر من 90 يوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{criticalCustomers.length}</div>
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
              <div className="text-4xl font-bold">{warningCustomers.length}</div>
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
              <div className="text-4xl font-bold">{recentCustomers.length}</div>
              <p className="text-muted-foreground mt-2">فرصة للتذكير</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">جميع العملاء</TabsTrigger>
            <TabsTrigger value="critical">عملاء غير نشطين جدًا</TabsTrigger>
            <TabsTrigger value="warning">عملاء في خطر الضياع</TabsTrigger>
            <TabsTrigger value="recent">عملاء حديثي الغياب</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <InactiveCustomersTable customers={filteredCustomers} />
          </TabsContent>
          
          <TabsContent value="critical">
            <InactiveCustomersTable customers={criticalCustomers} />
          </TabsContent>
          
          <TabsContent value="warning">
            <InactiveCustomersTable customers={warningCustomers} />
          </TabsContent>
          
          <TabsContent value="recent">
            <InactiveCustomersTable customers={recentCustomers} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

interface InactiveCustomersTableProps {
  customers: typeof inactiveCustomers;
}

const InactiveCustomersTable = ({ customers }: InactiveCustomersTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">الرقم</TableHead>
              <TableHead>اسم العميل</TableHead>
              <TableHead>آخر شراء</TableHead>
              <TableHead>مدة الغياب</TableHead>
              <TableHead>نقاط العميل</TableHead>
              <TableHead>حالة العميل</TableHead>
              <TableHead>اتصال</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  لا يوجد عملاء تطابق معايير البحث
                </TableCell>
              </TableRow>
            ) : (
              customers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar} alt={customer.name} />
                        <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{format(customer.lastPurchase, 'PPP', { locale: ar })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.inactiveDays > 90 ? "destructive" : customer.inactiveDays > 30 ? "outline" : "secondary"}>
                      {customer.inactiveDays} يوم
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.loyaltyPoints} نقطة</TableCell>
                  <TableCell>
                    <StatusBadge days={customer.inactiveDays} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ days }: { days: number }) => {
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

export default CustomerFollowup;
