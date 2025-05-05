
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { UserProfile } from '@/lib/auth-types';

export interface UserFormProps {
  user: UserProfile;
  onSubmit: (values: { fullName: string; phone?: string | null; position?: string | null }) => Promise<void>;
  isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, isLoading }) => {
  const form = useForm({
    defaultValues: {
      fullName: user.fullName || '',
      phone: user.phone || '',
      position: user.position || '',
    }
  });

  const handleSubmit = async (values: { 
    fullName: string; 
    phone: string; 
    position: string;
  }) => {
    await onSubmit({
      fullName: values.fullName,
      phone: values.phone || null,
      position: values.position || null
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل الاسم الكامل" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الهاتف</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل رقم الهاتف" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المسمى الوظيفي</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل المسمى الوظيفي" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          حفظ البيانات
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;
