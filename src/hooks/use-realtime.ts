
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
          
          // Define the type for the payload.new data
          const newData = payload.new as Record<string, any>;
          
          // Invalidate relevant queries based on the table
          if (table === 'customers') {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            if (newData && newData.id) {
              queryClient.invalidateQueries({ queryKey: ['customers', newData.id] });
            }
          } else if (table === 'invoices') {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
            }
          } else if (table === 'payments') {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['payments', 'customer', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
            }
            if (newData && newData.invoice_id) {
              queryClient.invalidateQueries({ queryKey: ['invoices', newData.invoice_id] });
            }
          } else if (table === 'products') {
            queryClient.invalidateQueries({ queryKey: ['products'] });
          } else if (table === 'redemptions') {
            queryClient.invalidateQueries({ queryKey: ['redemptions'] });
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
            }
          } else if (table === 'redemption_items') {
            queryClient.invalidateQueries({ queryKey: ['redemptions'] });
          } else if (table === 'points_history') {
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['points_history', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
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
