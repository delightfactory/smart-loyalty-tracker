
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type RealtimeCallback = () => void;
type TableName = 'products' | 'customers' | 'invoices' | 'payments' | 'redemptions';

export function useRealtime(table: TableName, callback?: RealtimeCallback) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleChange = () => {
      // Invalidate queries related to this table
      queryClient.invalidateQueries({ queryKey: [table] });
      
      // Call custom callback if provided
      if (callback) {
        callback();
      }
    };

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        handleChange
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback, queryClient]);
}
