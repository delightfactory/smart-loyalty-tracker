import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { invalidationKeyMap } from './subscriptionHandlers';

export type TableName =
  | 'customers'
  | 'invoices'
  | 'payments'
  | 'products'
  | 'redemptions'
  | 'redemption_items'
  | 'points_history'
  | 'profiles'
  | 'roles'
  | 'user_roles'
  | 'permissions'
  | 'role_permissions'
  | 'user_permissions'
  | 'returns'
  | 'return_items';

export const useRealtime = (table: TableName) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          const newData = payload.new as Record<string, any>;
          // أعد invalidation للجدول الرئيسي
          queryClient.invalidateQueries({ queryKey: [table] });
          // استخدم خريطة المفاتيح لتوليد مفاتيح أخرى
          const keys = invalidationKeyMap[table](newData);
          keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, table]);
};
