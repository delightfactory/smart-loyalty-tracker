
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type RealtimeCallback = () => void;
type TableName = 'products' | 'customers' | 'invoices' | 'payments' | 'redemptions';

export function useRealtime(table: TableName, callback?: RealtimeCallback) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleChange = () => {
      console.log(`Realtime update detected on table: ${table}`);
      
      // إبطال الاستعلامات المتعلقة بهذا الجدول
      queryClient.invalidateQueries({ queryKey: [table] });
      
      // استدعاء الدالة المخصصة إذا تم توفيرها
      if (callback) {
        callback();
      }
    };

    // إنشاء قناة للتحديثات في الوقت الفعلي
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          handleChange();
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status);
      });
      
    return () => {
      console.log(`Cleaning up realtime subscription for ${table}`);
      supabase.removeChannel(channel);
    };
  }, [table, callback, queryClient]);
}
