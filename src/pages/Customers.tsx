
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, Plus, Search, Filter, UserPlus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { BusinessType, Customer } from '@/lib/types';
import { customers, addCustomer } from '@/lib/data';
import { cn } from '@/lib/utils';

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    contactPerson: '',
    phone: '',
    businessType: BusinessType.SERVICE_CENTER,
    pointsEarned: 0,
    pointsRedeemed: 0,
    currentPoints: 0,
    creditBalance: 0,
    classification: 0,
    level: 0
  });

  const filteredCustomers = customers.filter(customer => {
    // Apply search filter
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    // Apply business type filter - Use 'all' instead of empty string
    const matchesBusinessType = businessTypeFilter !== 'all' ? customer.businessType === businessTypeFilter : true;
    
    return matchesSearch && matchesBusinessType;
  });
  
  const handleAddCustomer = () => {
    const customerId = `C${(customers.length + 1).toString().padStart(3, '0')}`;
    const customer: Customer = {
      id: customerId,
      ...newCustomer,
      currentPoints: 0,
      pointsEarned: 0,
      pointsRedeemed: 0,
      classification: 0,
      level: customers.length + 1
    } as Customer;
    
    addCustomer(customer);
    setNewCustomer({
      name: '',
      contactPerson: '',
      phone: '',
      businessType: BusinessType.SERVICE_CENTER,
      creditBalance: 0
    });
    setIsAddDialogOpen(false);
  };
  
  const handleCustomerClick = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  const getLevelBadgeClass = (level: number) => {
    if (level === 1) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (level === 2) return "bg-gray-100 text-gray-800 border-gray-300";
    if (level === 3) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  const getClassificationDisplay = (classification: number) => {
    const stars = Array(classification).fill('★').join('');
    const emptyStars = Array(5 - classification).fill('☆').join('');
    return stars + emptyStars;
  };

  return (
    <PageContainer title="إدارة العملاء" subtitle="عرض وإضافة وتحليل العملاء">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="بحث عن عميل..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="جميع الأنشطة" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنشطة</SelectItem>
              {Object.values(BusinessType).map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">اسم العميل</Label>
                    <Input 
                      id="name" 
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">اسم المسؤول</Label>
                    <Input 
                      id="contactPerson" 
                      value={newCustomer.contactPerson}
                      onChange={(e) => setNewCustomer({...newCustomer, contactPerson: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input 
                      id="phone" 
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">نوع النشاط</Label>
                    <Select 
                      value={newCustomer.businessType as string} 
                      onValueChange={(value) => setNewCustomer({...newCustomer, businessType: value as BusinessType})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر نوع النشاط" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(BusinessType).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="creditBalance">رصيد الآجل (ج.م)</Label>
                    <Input 
                      id="creditBalance"
                      type="number"
                      value={newCustomer.creditBalance?.toString() || ''}
                      onChange={(e) => setNewCustomer({...newCustomer, creditBalance: Number(e.target.value)})}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddCustomer}>إضافة العميل</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>كود العميل</TableHead>
              <TableHead>اسم العميل</TableHead>
              <TableHead>المسؤول</TableHead>
              <TableHead>نوع النشاط</TableHead>
              <TableHead>هاتف</TableHead>
              <TableHead>النقاط الحالية</TableHead>
              <TableHead>رصيد الآجل</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>المستوى</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCustomerClick(customer.id)}
                >
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.contactPerson}</TableCell>
                  <TableCell>{customer.businessType}</TableCell>
                  <TableCell dir="ltr">{customer.phone}</TableCell>
                  <TableCell>{customer.currentPoints}</TableCell>
                  <TableCell>{customer.creditBalance} ج.م</TableCell>
                  <TableCell>
                    <div className="flex items-center text-amber-500">
                      {getClassificationDisplay(customer.classification)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      getLevelBadgeClass(customer.level)
                    )}>
                      المستوى {customer.level}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-10 w-10 mb-2" />
                    <p>لا يوجد عملاء</p>
                    {searchTerm && <p className="text-sm">جرب البحث بمصطلح آخر</p>}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
};

export default Customers;
