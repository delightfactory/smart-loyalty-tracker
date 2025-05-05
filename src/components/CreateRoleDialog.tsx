import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole } from '@/services/roles-api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface FormValues {
  name: string;
  description?: string;
}

export default function CreateRoleDialog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { name: '', description: '' } });
  const mutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({ title: 'تم إنشاء الدور بنجاح' });
      reset();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'خطأ في إنشاء الدور', description: error.message });
    }
  });
  const onSubmit = (data: FormValues) => mutation.mutate(data);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">إنشاء دور</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء دور جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>الاسم</Label>
            <Input {...register('name', { required: true })} />
          </div>
          <div>
            <Label>الوصف</Label>
            <Input {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.status === 'pending'}>
              {mutation.status === 'pending' ? 'جاري الإنشاء...' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
