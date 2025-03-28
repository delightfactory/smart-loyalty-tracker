
import { useFieldArray, useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LoyaltySettings, LoyaltyLevel } from "@/lib/settings-types";
import { Save, Plus, Trash } from "lucide-react";

interface LoyaltySettingsFormProps {
  settings: LoyaltySettings;
  onSave: (settings: LoyaltySettings) => void;
  isLoading?: boolean;
}

export function LoyaltySettingsForm({ settings, onSave, isLoading = false }: LoyaltySettingsFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<LoyaltySettings>({
    defaultValues: settings
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "levels"
  });

  const addLevel = () => {
    const lastLevel = fields[fields.length - 1];
    const newMinPoints = lastLevel?.maxPoints ? lastLevel.maxPoints + 1 : 0;
    
    append({
      id: fields.length + 1,
      name: `المستوى ${fields.length + 1}`,
      minPoints: newMinPoints,
      maxPoints: newMinPoints + 500
    });
  };
  
  const handleLevelChange = (index: number, field: keyof LoyaltyLevel, value: any) => {
    const levels = [...watch("levels")];
    levels[index] = {
      ...levels[index],
      [field]: value
    };
    setValue("levels", levels);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات برنامج الولاء</CardTitle>
        <CardDescription>ضبط وتخصيص برنامج النقاط والمكافآت</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSave)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableLoyaltyProgram">تفعيل برنامج الولاء</Label>
              <Switch 
                id="enableLoyaltyProgram" 
                checked={watch("enableLoyaltyProgram")} 
                onCheckedChange={(checked) => setValue("enableLoyaltyProgram", checked)} 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              تمكين أو تعطيل برنامج الولاء بالكامل
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pointsPerCurrency">النقاط لكل جنيه</Label>
              <Input 
                id="pointsPerCurrency" 
                type="number" 
                min="0" 
                step="0.1" 
                {...register("pointsPerCurrency", { 
                  required: true, 
                  valueAsNumber: true,
                  min: 0
                })} 
              />
              <p className="text-sm text-muted-foreground">
                عدد النقاط المكتسبة لكل جنيه من المشتريات
              </p>
              {errors.pointsPerCurrency && <p className="text-sm text-red-500">قيمة غير صحيحة</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsExpiry">مدة صلاحية النقاط (بالأيام)</Label>
              <Input 
                id="pointsExpiry" 
                type="number" 
                min="0" 
                {...register("pointsExpiry", { 
                  valueAsNumber: true,
                  min: 0
                })} 
              />
              <p className="text-sm text-muted-foreground">
                عدد الأيام قبل انتهاء صلاحية النقاط، 0 تعني لا تنتهي أبداً
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minPointsRedemption">الحد الأدنى للاستبدال</Label>
              <Input 
                id="minPointsRedemption" 
                type="number" 
                min="0" 
                {...register("minPointsRedemption", { 
                  valueAsNumber: true,
                  min: 0
                })} 
              />
              <p className="text-sm text-muted-foreground">
                الحد الأدنى للنقاط المطلوبة لإجراء عملية استبدال
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsValue">قيمة النقطة (بالجنيه)</Label>
              <Input 
                id="pointsValue" 
                type="number" 
                min="0" 
                step="0.01" 
                {...register("pointsValue", { 
                  valueAsNumber: true,
                  min: 0
                })} 
              />
              <p className="text-sm text-muted-foreground">
                القيمة النقدية للنقطة الواحدة عند الاستبدال
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>مستويات العملاء</Label>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addLevel} 
                size="sm"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستوى
              </Button>
            </div>
            
            {fields.map((level, index) => (
              <div key={level.id} className="flex items-start justify-between p-3 border rounded-md">
                <div className="space-y-4 w-full">
                  <div className="flex gap-2">
                    <Input
                      value={level.name}
                      onChange={(e) => handleLevelChange(index, 'name', e.target.value)}
                      className="max-w-[200px]"
                      placeholder="اسم المستوى"
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-4 w-full">
                    <div className="flex-1">
                      <Label htmlFor={`levels.${index}.minPoints`} className="text-xs">الحد الأدنى</Label>
                      <Input
                        id={`levels.${index}.minPoints`}
                        type="number"
                        value={level.minPoints}
                        onChange={(e) => handleLevelChange(index, 'minPoints', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`levels.${index}.maxPoints`} className="text-xs">الحد الأقصى</Label>
                      <Input
                        id={`levels.${index}.maxPoints`}
                        type="number"
                        value={level.maxPoints === null ? "" : level.maxPoints}
                        placeholder="غير محدود"
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : parseInt(e.target.value);
                          handleLevelChange(index, 'maxPoints', val);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <Save className="ml-2 h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
