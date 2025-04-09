
import { UserRole } from "@/lib/auth-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldAlert, ShieldCheck, Briefcase, User, DollarSign } from "lucide-react";

export function UserRolesList() {
  // تعريف معلومات الأدوار
  const roles = [
    {
      role: UserRole.ADMIN,
      title: "مدير النظام",
      description: "صلاحيات كاملة للنظام",
      icon: <ShieldAlert className="h-12 w-12 text-primary" />,
      permissions: [
        "إدارة المستخدمين وصلاحياتهم",
        "إدارة جميع الإعدادات",
        "الوصول لكامل بيانات النظام",
        "إدارة الفواتير والمدفوعات",
        "إدارة العملاء والمنتجات",
        "إنشاء وتعديل الحسابات"
      ]
    },
    {
      role: UserRole.MANAGER,
      title: "مشرف",
      description: "إدارة العمليات اليومية",
      icon: <ShieldCheck className="h-12 w-12 text-blue-500" />,
      permissions: [
        "مراقبة أداء النظام",
        "إدارة العملاء والمنتجات",
        "مراجعة الفواتير والمدفوعات",
        "مراقبة عمليات نقاط الولاء",
        "إنشاء تقارير الأداء",
        "متابعة العملاء"
      ]
    },
    {
      role: UserRole.ACCOUNTANT,
      title: "محاسب",
      description: "إدارة الحسابات والمدفوعات",
      icon: <DollarSign className="h-12 w-12 text-amber-500" />,
      permissions: [
        "إدارة الفواتير بالكامل",
        "إدارة المدفوعات وتسجيلها",
        "إنشاء تقارير مالية",
        "متابعة المديونيات",
        "تسجيل المرتجعات",
        "إدارة الائتمان"
      ]
    },
    {
      role: UserRole.SALES,
      title: "مبيعات",
      description: "إدارة المبيعات والعملاء",
      icon: <Briefcase className="h-12 w-12 text-green-500" />,
      permissions: [
        "إنشاء فواتير جديدة",
        "إضافة عملاء جدد",
        "إدارة ملفات العملاء",
        "عرض المنتجات وأسعارها",
        "تسجيل عمليات استبدال النقاط",
        "متابعة مديونيات العملاء"
      ]
    },
    {
      role: UserRole.USER,
      title: "مستخدم عادي",
      description: "صلاحيات محدودة للاستخدام",
      icon: <User className="h-12 w-12 text-gray-400" />,
      permissions: [
        "عرض لوحة التحكم",
        "عرض المنتجات",
        "عرض العملاء",
        "عرض الفواتير",
        "تغيير بيانات الملف الشخصي",
        "استخدام الأدوات الأساسية"
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((roleInfo) => (
          <Card key={roleInfo.role} className={
            roleInfo.role === UserRole.ADMIN 
              ? "border-primary" 
              : roleInfo.role === UserRole.MANAGER
              ? "border-blue-200"
              : roleInfo.role === UserRole.ACCOUNTANT
              ? "border-amber-200"
              : roleInfo.role === UserRole.SALES
              ? "border-green-200"
              : "border-gray-200"
          }>
            <CardHeader className="flex flex-row items-center gap-4">
              {roleInfo.icon}
              <div>
                <CardTitle>{roleInfo.title}</CardTitle>
                <CardDescription>{roleInfo.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">الصلاحيات:</h4>
              <ul className="space-y-1 list-inside">
                {roleInfo.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm">{permission}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>معلومات عن الصلاحيات</CardTitle>
          <CardDescription>
            كيفية استخدام نظام الصلاحيات في التطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>
            يتم التحقق من صلاحيات المستخدمين من خلال دالة <code>hasRole</code> التي يمكن استخدامها في أي مكون للتحقق من صلاحيات المستخدم الحالي.
          </p>
          <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto rtl:text-left ltr:text-left">
            {`
// مثال للتحقق من صلاحيات المستخدم
const { hasRole } = useAuth();

if (hasRole(UserRole.ADMIN)) {
  // إجراء خاص بالمسؤولين فقط
}
            `}
          </pre>
          <p>
            يمكن للمستخدم أن يكون لديه أكثر من صلاحية في نفس الوقت، وذلك يتيح مرونة أكبر في تحديد صلاحيات المستخدمين.
          </p>
          <p>
            يتم تخزين الصلاحيات في قاعدة البيانات ويتم تحميلها عند تسجيل دخول المستخدم.
            وعند تغيير صلاحيات المستخدم من قبل مدير النظام، يحتاج المستخدم لتسجيل الخروج وإعادة تسجيل الدخول لتفعيل الصلاحيات الجديدة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
