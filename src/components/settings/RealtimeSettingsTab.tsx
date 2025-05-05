
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { enableRealtimeForAllTables } from '@/lib/realtime-utils';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function RealtimeSettingsTab() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnableRealtime = async () => {
    setIsProcessing(true);
    try {
      const result = await enableRealtimeForAllTables();
      
      if (result) {
        toast({
          title: "تم تمكين التحديثات الفورية",
          description: "تم تمكين التحديثات الفورية لجميع الجداول بنجاح. ستظهر التغييرات فوريًا في التطبيق."
        });
      }
    } catch (error: any) {
      console.error("Error enabling realtime:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تمكين التحديثات الفورية",
        description: error.message || "حدث خطأ أثناء تمكين التحديثات الفورية"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>إعدادات التحديثات الفورية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="realtime-switch">تمكين التحديثات الفورية</Label>
              <p className="text-sm text-muted-foreground">
                تمكين هذه الميزة سيعمل على تحديث واجهة المستخدم فوريًا عند حدوث أي تغييرات في قاعدة البيانات
              </p>
            </div>
            <Switch id="realtime-switch" defaultChecked />
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="text-sm font-medium mb-1">ملاحظة هامة</h4>
            <p className="text-sm text-muted-foreground">
              تمكين التحديثات الفورية قد يزيد من استهلاك الموارد على الخادم. يفضل استخدامها في البيئات التي تتطلب تحديثات فورية فقط.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleEnableRealtime} 
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          تمكين التحديثات الفورية لجميع الجداول
        </Button>
      </CardFooter>
    </Card>
  );
}
