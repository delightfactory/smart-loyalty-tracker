
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RealtimeCallback = () => void;

export function useRealtime(table: string, callback: RealtimeCallback) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        () => {
          callback();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}
