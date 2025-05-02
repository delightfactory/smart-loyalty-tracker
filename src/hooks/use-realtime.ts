
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type TableName = 'customers' | 'invoices' | 'payments' | 'products' | 'redemptions' | 'redemption_items' | 'points_history';

export const useRealtime = (table: TableName) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('realtime-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload);
          
          // Invalidate relevant queries based on the table
          if (table === 'customers') {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            if (payload.new.id) {
              queryClient.invalidateQueries({ queryKey: ['customers', payload.new.id] });
            }
          } else if (table === 'invoices') {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            if (payload.new.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', payload.new.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', payload.new.customer_id] });
            }
          } else if (table === 'payments') {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            if (payload.new.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['payments', 'customer', payload.new.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', payload.new.customer_id] });
            }
            if (payload.new.invoice_id) {
              queryClient.invalidateQueries({ queryKey: ['invoices', payload.new.invoice_id] });
            }
          } else if (table === 'products') {
            queryClient.invalidateQueries({ queryKey: ['products'] });
          } else if (table === 'redemptions') {
            queryClient.invalidateQueries({ queryKey: ['redemptions'] });
            if (payload.new.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', payload.new.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', payload.new.customer_id] });
            }
          } else if (table === 'redemption_items') {
            queryClient.invalidateQueries({ queryKey: ['redemptions'] });
          } else if (table === 'points_history') {
            if (payload.new.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['points_history', payload.new.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', payload.new.customer_id] });
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, table]);
};
