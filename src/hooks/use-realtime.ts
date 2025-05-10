import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type TableName = 'customers' | 'invoices' | 'payments' | 'products' | 'redemptions' | 'redemption_items' | 'points_history';

export const useRealtime = (table: TableName) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
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
          
          // Invalidate and refetch main table query
          queryClient.invalidateQueries({ queryKey: [table] });
          queryClient.refetchQueries({ queryKey: [table] });
          if (table === 'customers') {
            if (newData && newData.id) {
              queryClient.invalidateQueries({ queryKey: ['customers', newData.id] });
              queryClient.refetchQueries({ queryKey: ['customers', newData.id] });
            }
          } else if (table === 'invoices') {
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['invoices', 'customer', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['customers', newData.customer_id] });
            }
          } else if (table === 'payments') {
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['payments', 'customer', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['payments', 'customer', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['customers', newData.customer_id] });
            }
            if (newData && newData.invoice_id) {
              queryClient.invalidateQueries({ queryKey: ['invoices', newData.invoice_id] });
              queryClient.refetchQueries({ queryKey: ['invoices', newData.invoice_id] });
            }
          } else if (table === 'products') {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.refetchQueries({ queryKey: ['products'] });
          } else if (table === 'redemptions') {
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['redemptions', 'customer', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['redemptions', 'customer', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['customers', newData.customer_id] });
            }
          } else if (table === 'redemption_items') {
            queryClient.invalidateQueries({ queryKey: ['redemptions'] });
            queryClient.refetchQueries({ queryKey: ['redemptions'] });
          } else if (table === 'points_history') {
            if (newData && newData.customer_id) {
              queryClient.invalidateQueries({ queryKey: ['points_history', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['points_history', newData.customer_id] });
              queryClient.invalidateQueries({ queryKey: ['customers', newData.customer_id] });
              queryClient.refetchQueries({ queryKey: ['customers', newData.customer_id] });
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
