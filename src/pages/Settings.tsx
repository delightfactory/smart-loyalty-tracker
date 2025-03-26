
import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings2, 
  User, 
  Building, 
  Award, 
  Receipt, 
  CreditCard, 
  Save, 
  Info,
  ArrowUp,
  Download,
  Upload,
  Shield
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PageContainer from '@/components/layout/PageContainer';

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    toast({
      title: "تم الحفظ",
      description: "تم حفظ الإعدادات بنجاح",
    });
  };

  return (
    <PageContainer title="الإعدادات" subtitle="إدارة إعدادات النظام">
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 md:col-span-3">
          <CardHeader>
            <CardTitle>الإعدادات</CardTitle>
            <CardDescription>إدارة إعدادات النظام المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="general" 
              orientation="vertical" 
              onValueChange={setActiveTab}
              value={activeTab}
              className="h-full"
            >
              <TabsList className="flex flex-col items-stretch h-full space-y-1 bg-transparent">
                <TabsTrigger value="general" className="justify-start">
                  <Settings2 className="ml-2 h-4 w-4" />
                  الإعدادات العامة
                </TabsTrigger>
                <TabsTrigger value="company" className="justify-start">
                  <Building className="ml-2 h-4 w-4" />
                  بيانات الشركة
                </TabsTrigger>
                <TabsTrigger value="users" className="justify-start">
                  <User className="ml-2 h-4 w-4" />
                  المستخدمين
                </TabsTrigger>
                <TabsTrigger value="loyalty" className="justify-start">
                  <Award className="ml-2 h-4 w-4" />
                  برنامج الولاء
                </TabsTrigger>
                <TabsTrigger value="invoices" className="justify-start">
                  <Receipt className="ml-2 h-4 w-4" />
                  الفواتير
                </TabsTrigger>
                <TabsTrigger value="payments" className="justify-start">
                  <CreditCard className="ml-2 h-4 w-4" />
                  المدفوعات
                </TabsTrigger>
                <TabsTrigger value="backup" className="justify-start">
                  <Download className="ml-2 h-4 w-4" />
                  النسخ الاحتياطي
                </TabsTrigger>
                <TabsTrigger value="security" className="justify-start">
                  <Shield className="ml-2 h-4 w-4" />
                  الأمان
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="col-span-12 md:col-span-9">
          <TabsContent value="general" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>تخصيص الإعدادات العامة للنظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">اللغة</Label>
                    <Select defaultValue="ar">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر اللغة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">المنطقة الزمنية</Label>
                    <Select defaultValue="cairo">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنطقة الزمنية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cairo">القاهرة (GMT+2)</SelectItem>
                        <SelectItem value="riyadh">الرياض (GMT+3)</SelectItem>
                        <SelectItem value="dubai">دبي (GMT+4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">العملة</Label>
                    <Select defaultValue="egp">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العملة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="egp">جنيه مصري (EGP)</SelectItem>
                        <SelectItem value="sar">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="aed">درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="usd">دولار أمريكي (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_format">تنسيق التاريخ</Label>
                    <Select defaultValue="dd_mm_yyyy">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر تنسيق التاريخ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd_mm_yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm_dd_yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy_mm_dd">YYYY/MM/DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">إشعارات البريد الإلكتروني</Label>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    تلقي إشعارات بالبريد الإلكتروني عند وجود فواتير متأخرة أو تغييرات مهمة
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analytics">تتبع البيانات التحليلية</Label>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    جمع بيانات استخدام النظام لتحسين الأداء وتخصيص التجربة
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>بيانات الشركة</CardTitle>
                <CardDescription>تعديل معلومات الشركة الأساسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">اسم الشركة</Label>
                    <Input id="company_name" placeholder="اسم الشركة" defaultValue="شركة العناية بالسيارات" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_number">رقم التسجيل الضريبي</Label>
                    <Input id="tax_number" placeholder="رقم التسجيل الضريبي" defaultValue="123456789" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input id="phone" placeholder="رقم الهاتف" defaultValue="01234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" placeholder="البريد الإلكتروني" type="email" defaultValue="info@autocare.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea id="address" placeholder="العنوان" defaultValue="شارع النصر، مدينة نصر، القاهرة" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">شعار الشركة</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <Button variant="outline">اختيار صورة</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ البيانات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
                <CardDescription>إضافة وتعديل وحذف مستخدمي النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Button>
                    <User className="ml-2 h-4 w-4" />
                    إضافة مستخدم جديد
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-2">اسم المستخدم</th>
                        <th className="text-right p-2">البريد الإلكتروني</th>
                        <th className="text-right p-2">الصلاحية</th>
                        <th className="text-right p-2">الحالة</th>
                        <th className="text-right p-2">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2">أحمد محمد</td>
                        <td className="p-2">ahmed@example.com</td>
                        <td className="p-2">مدير</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">نشط</span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">تعديل</Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500">حذف</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>هل أنت متأكد من حذف المستخدم؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم نهائياً من النظام.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    تأكيد الحذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-2">محمد علي</td>
                        <td className="p-2">mohamed@example.com</td>
                        <td className="p-2">محاسب</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">نشط</span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">تعديل</Button>
                            <Button variant="ghost" size="sm" className="text-red-500">حذف</Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">سارة أحمد</td>
                        <td className="p-2">sara@example.com</td>
                        <td className="p-2">مبيعات</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">معلق</span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">تعديل</Button>
                            <Button variant="ghost" size="sm" className="text-red-500">حذف</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات برنامج الولاء</CardTitle>
                <CardDescription>ضبط وتخصيص برنامج النقاط والمكافآت</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable_loyalty">تفعيل برنامج الولاء</Label>
                    <Switch id="enable_loyalty" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    تمكين أو تعطيل برنامج الولاء بالكامل
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="points_per_egp">النقاط لكل جنيه</Label>
                    <Input id="points_per_egp" type="number" min="0" step="0.1" defaultValue="0.5" />
                    <p className="text-sm text-muted-foreground">
                      عدد النقاط المكتسبة لكل جنيه من المشتريات
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points_expiry">مدة صلاحية النقاط (بالأيام)</Label>
                    <Input id="points_expiry" type="number" min="0" defaultValue="365" />
                    <p className="text-sm text-muted-foreground">
                      عدد الأيام قبل انتهاء صلاحية النقاط، 0 تعني لا تنتهي أبداً
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="min_points_redemption">الحد الأدنى للاستبدال</Label>
                    <Input id="min_points_redemption" type="number" min="0" defaultValue="100" />
                    <p className="text-sm text-muted-foreground">
                      الحد الأدنى للنقاط المطلوبة لإجراء عملية استبدال
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points_value">قيمة النقطة (بالجنيه)</Label>
                    <Input id="points_value" type="number" min="0" step="0.01" defaultValue="0.25" />
                    <p className="text-sm text-muted-foreground">
                      القيمة النقدية للنقطة الواحدة عند الاستبدال
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>مستويات العملاء</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">المستوى 1 (برونزي)</p>
                        <p className="text-sm text-muted-foreground">0 - 500 نقطة</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">المستوى 2 (فضي)</p>
                        <p className="text-sm text-muted-foreground">501 - 1000 نقطة</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">المستوى 3 (ذهبي)</p>
                        <p className="text-sm text-muted-foreground">1001 - 2000 نقطة</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">المستوى 4 (بلاتيني)</p>
                        <p className="text-sm text-muted-foreground">2001+ نقطة</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الفواتير</CardTitle>
                <CardDescription>تخصيص إعدادات الفواتير والتسعير</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_prefix">بادئة رقم الفاتورة</Label>
                    <Input id="invoice_prefix" defaultValue="INV" />
                    <p className="text-sm text-muted-foreground">
                      البادئة المستخدمة قبل الرقم التسلسلي للفاتورة
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_invoice_number">رقم الفاتورة التالي</Label>
                    <Input id="next_invoice_number" type="number" min="1" defaultValue="1001" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="default_payment_terms">شروط الدفع الافتراضية (بالأيام)</Label>
                    <Input id="default_payment_terms" type="number" min="0" defaultValue="30" />
                    <p className="text-sm text-muted-foreground">
                      عدد الأيام الافتراضي لسداد الفواتير الآجلة
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">نسبة الضريبة (%)</Label>
                    <Input id="tax_rate" type="number" min="0" max="100" step="0.01" defaultValue="14" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_tax">عرض الضريبة في الفواتير</Label>
                    <Switch id="show_tax" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    عرض تفاصيل الضريبة منفصلة في الفواتير
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_points">عرض النقاط في الفواتير</Label>
                    <Switch id="show_points" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    عرض تفاصيل النقاط المكتسبة في الفواتير
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_notes">ملاحظات الفاتورة الافتراضية</Label>
                  <Textarea id="invoice_notes" defaultValue="شكراً لثقتكم في منتجاتنا. يرجى الاحتفاظ بالفاتورة للرجوع إليها عند الحاجة." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_footer">تذييل الفاتورة</Label>
                  <Textarea id="invoice_footer" defaultValue="جميع الحقوق محفوظة - شركة العناية بالسيارات © 2023" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المدفوعات</CardTitle>
                <CardDescription>تخصيص طرق الدفع وإعدادات المدفوعات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>طرق الدفع المتاحة</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="payment_cash" defaultChecked />
                      <Label htmlFor="payment_cash" className="mr-2">نقداً</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="payment_credit" defaultChecked />
                      <Label htmlFor="payment_credit" className="mr-2">آجل</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="payment_bank" defaultChecked />
                      <Label htmlFor="payment_bank" className="mr-2">تحويل بنكي</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="payment_card" defaultChecked />
                      <Label htmlFor="payment_card" className="mr-2">بطاقة ائتمان</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="default_payment_method">طريقة الدفع الافتراضية</Label>
                    <Select defaultValue="cash">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع الافتراضية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقداً</SelectItem>
                        <SelectItem value="credit">آجل</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="card">بطاقة ائتمان</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_prefix">بادئة رقم الدفعة</Label>
                    <Input id="payment_prefix" defaultValue="PAY" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow_partial_payments">السماح بالمدفوعات الجزئية</Label>
                    <Switch id="allow_partial_payments" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    السماح للعملاء بتسديد جزء من قيمة الفاتورة
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="overdue_notifications">إشعارات المتأخرات</Label>
                    <Switch id="overdue_notifications" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    إرسال إشعارات تلقائية للفواتير المتأخرة
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>إعدادات المتأخرات</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_reminder">تذكير أول (بالأيام)</Label>
                      <Input id="first_reminder" type="number" min="0" defaultValue="3" />
                    </div>
                    <div>
                      <Label htmlFor="second_reminder">تذكير ثاني (بالأيام)</Label>
                      <Input id="second_reminder" type="number" min="0" defaultValue="7" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>النسخ الاحتياطي واستعادة البيانات</CardTitle>
                <CardDescription>إدارة نسخ البيانات الاحتياطية واستعادتها</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start mb-6">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 ml-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">معلومات هامة</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      ننصح بعمل نسخة احتياطية من البيانات بشكل دوري. في حالة استعادة البيانات، ستتم إزالة جميع البيانات الحالية واستبدالها بالبيانات المستعادة.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>النسخ الاحتياطي اليدوي</Label>
                  <div className="flex items-center gap-4">
                    <Button>
                      <Download className="ml-2 h-4 w-4" />
                      إنشاء نسخة احتياطية
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="ml-2 h-4 w-4" />
                          استعادة من نسخة احتياطية
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من استعادة البيانات؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            ستتم إزالة جميع البيانات الحالية واستبدالها بالبيانات من النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            تأكيد الاستعادة
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto_backup">النسخ الاحتياطي التلقائي</Label>
                    <Switch id="auto_backup" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    إنشاء نسخة احتياطية تلقائية بشكل دوري
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="backup_frequency">تكرار النسخ الاحتياطي</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر تكرار النسخ الاحتياطي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">يومي</SelectItem>
                        <SelectItem value="weekly">أسبوعي</SelectItem>
                        <SelectItem value="monthly">شهري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup_retention">مدة الاحتفاظ بالنسخ الاحتياطية (بالأيام)</Label>
                    <Input id="backup_retention" type="number" min="1" defaultValue="30" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>آخر النسخ الاحتياطية</Label>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-2">تاريخ النسخة</th>
                          <th className="text-right p-2">الحجم</th>
                          <th className="text-right p-2">النوع</th>
                          <th className="text-right p-2">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2">2023-06-15 14:30:00</td>
                          <td className="p-2">2.4 MB</td>
                          <td className="p-2">تلقائي</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">استعادة</Button>
                              <Button variant="ghost" size="sm">تنزيل</Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="p-2">2023-06-10 09:15:00</td>
                          <td className="p-2">2.2 MB</td>
                          <td className="p-2">يدوي</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">استعادة</Button>
                              <Button variant="ghost" size="sm">تنزيل</Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
                <CardDescription>ضبط إعدادات الأمان وحماية الحساب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>تغيير كلمة المرور</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                      <Input id="current_password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                      <Input id="new_password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">تأكيد كلمة المرور الجديدة</Label>
                      <Input id="confirm_password" type="password" />
                    </div>
                    <Button className="mt-2 w-full md:w-auto">تغيير كلمة المرور</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two_factor">المصادقة الثنائية</Label>
                    <Switch id="two_factor" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    تفعيل المصادقة الثنائية لتعزيز أمان الحساب
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="session_timeout">انتهاء مهلة الجلسة بعد عدم النشاط</Label>
                    <Switch id="session_timeout" defaultChecked />
                  </div>
                  <div className="pt-2">
                    <Label htmlFor="timeout_minutes">مدة عدم النشاط (بالدقائق)</Label>
                    <Input id="timeout_minutes" type="number" min="1" defaultValue="30" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>سجل تسجيل الدخول</Label>
                  <div className="overflow-x-auto bg-gray-50 rounded-md p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-2">التاريخ</th>
                          <th className="text-right p-2">المستخدم</th>
                          <th className="text-right p-2">عنوان IP</th>
                          <th className="text-right p-2">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2">2023-06-15 14:30:00</td>
                          <td className="p-2">أحمد محمد</td>
                          <td className="p-2">192.168.1.1</td>
                          <td className="p-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">ناجح</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2">2023-06-15 10:25:00</td>
                          <td className="p-2">محمد علي</td>
                          <td className="p-2">192.168.1.2</td>
                          <td className="p-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">ناجح</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2">2023-06-14 16:10:00</td>
                          <td className="p-2">غير معروف</td>
                          <td className="p-2">192.168.1.100</td>
                          <td className="p-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">فاشل</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </div>
    </PageContainer>
  );
};

export default Settings;
