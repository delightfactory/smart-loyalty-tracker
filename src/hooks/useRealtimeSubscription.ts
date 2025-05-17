import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type TableName = 
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

/**
 * Hook to subscribe to Supabase real-time updates for a specific table
 * and automatically invalidate related queries
 */
export function useRealtimeSubscription(tables: TableName[], { enabled = true } = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const channels = tables.map(table => {
      const channel = supabase
        .channel(`public:${table}:changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
          },
          (payload) => {
            console.log(`Realtime update for ${table}:`, payload);
            invalidateRelatedQueries(queryClient, table, payload);
          }
        )
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.error(`Failed to subscribe to ${table} changes:`, status);
          }
        });

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient, tables, enabled]);
}

/**
 * Helper function to invalidate related queries based on the table and payload
 */
function invalidateRelatedQueries(queryClient: any, table: TableName, payload: any) {
  const { new: newData, old: oldData, eventType } = payload;
  
  // Base invalidation for the table
  queryClient.invalidateQueries({ queryKey: [table] });
  
  // Specific invalidations based on table relationships
  switch (table) {
    case 'customers':
      if (newData?.id || oldData?.id) {
        queryClient.invalidateQueries({ queryKey: ['customers', newData?.id || oldData?.id] });
      }
      break;
      
    case 'invoices':
      if (newData?.id || oldData?.id) {
        queryClient.invalidateQueries({ queryKey: ['invoices', newData?.id || oldData?.id] });
      }
      if (newData?.customer_id || oldData?.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['customers', newData?.customer_id || oldData?.customer_id] });
        queryClient.invalidateQueries({ queryKey: ['invoices', 'customer', newData?.customer_id || oldData?.customer_id] });
      }
      break;
      
    case 'payments':
      if (newData?.customer_id || oldData?.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['customers', newData?.customer_id || oldData?.customer_id] });
        queryClient.invalidateQueries({ queryKey: ['payments', 'customer', newData?.customer_id || oldData?.customer_id] });
      }
      if (newData?.invoice_id || oldData?.invoice_id) {
        queryClient.invalidateQueries({ queryKey: ['invoices', newData?.invoice_id || oldData?.invoice_id] });
      }
      break;
      
    case 'roles':
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      break;
      
    case 'permissions':
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      break;
      
    case 'user_roles':
      if (newData?.user_id || oldData?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['users', newData?.user_id || oldData?.user_id] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
      break;
      
    case 'role_permissions':
      if (newData?.role_id || oldData?.role_id) {
        queryClient.invalidateQueries({ queryKey: ['roles', newData?.role_id || oldData?.role_id] });
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
      }
      break;
      
    case 'profiles':
      if (newData?.id || oldData?.id) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      break;
      
    default:
      // For any other tables, invalidate their base queries
      queryClient.invalidateQueries({ queryKey: [table] });
      break;
  }
}
