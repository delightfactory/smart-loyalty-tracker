import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart2, Package, Settings, Users } from 'lucide-react';
import FloatingQuickActions from '@/components/FloatingQuickActions';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Auto-redirect to dashboard
    // Uncomment this if you want automatic redirection
    // navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">مرحباً بك في نظام العناية بالسيارات</h1>
        <p className="text-xl text-muted-foreground">منصة متكاملة لإدارة خدمات متاجر العناية بالسيارات ونظام الولاء للعملاء</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-primary" />
              <span>لوحة التحكم</span>
            </CardTitle>
            <CardDescription>
              عرض الإحصائيات والمعلومات الهامة عن نشاط متجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>استعرض تقارير المبيعات، ومتابعة العملاء، ونقاط الولاء في مكان واحد.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full group"
            >
              الانتقال إلى لوحة التحكم
              <ArrowRight className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-500" />
              <span>إدارة العملاء</span>
            </CardTitle>
            <CardDescription>
              إضافة ومتابعة العملاء وإدارة حساباتهم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>تتبع نقاط العملاء، وتاريخ الشراء، وإدارة المكافآت بسهولة.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/customers')}
              variant="outline"
              className="w-full group"
            >
              عرض العملاء
              <ArrowRight className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-amber-500" />
              <span>المنتجات والخدمات</span>
            </CardTitle>
            <CardDescription>
              إدارة المنتجات والخدمات التي تقدمها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>قم بإضافة وتعديل المنتجات والخدمات وتحديد أسعارها ونقاط المكافآت.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/products')}
              variant="outline"
              className="w-full group"
            >
              إدارة المنتجات
              <ArrowRight className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-green-500" />
              <span>الإعدادات</span>
            </CardTitle>
            <CardDescription>
              ضبط وتخصيص إعدادات النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>قم بتعديل إعدادات الفواتير، ونظام النقاط، وبيانات المتجر.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/settings')}
              variant="outline"
              className="w-full group"
            >
              فتح الإعدادات
              <ArrowRight className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      <FloatingQuickActions />
    </div>
  );
};

export default Index;
