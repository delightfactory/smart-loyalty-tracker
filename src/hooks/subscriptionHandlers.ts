import type { TableName } from './use-realtime';

type InvalidationKey = Array<string | number>;
type KeyGenerator = (data: Record<string, any>) => InvalidationKey[];

// خريطة لتوليد مفاتيح الاستعلامات التي تحتاج إلى Invalidating
export const invalidationKeyMap: Record<TableName, KeyGenerator> = {
  customers: (data) => data?.id ? [['customers', data.id]] : [],
  invoices: (data) => data?.customer_id ? [
    ['invoices'],
    ['invoices', 'customer', data.customer_id],
    ['customers', data.customer_id]
  ] : [],
  payments: (data) => {
    const keys: InvalidationKey[] = [];
    if (data?.customer_id) {
      keys.push(['payments', 'customer', data.customer_id]);
      keys.push(['customers', data.customer_id]);
    }
    if (data?.invoice_id) {
      keys.push(['invoices', data.invoice_id]);
    }
    return keys;
  },
  products: () => [],
  profiles: () => [],
  redemptions: (data) => data?.customer_id ? [
    ['redemptions'],
    ['redemptions', 'customer', data.customer_id],
    ['customers', data.customer_id]
  ] : [],
  redemption_items: () => [],
  return_items: () => [],
  returns: (data) => data?.customer_id ? [
    ['returns'],
    ['returns', 'customer', data.customer_id],
    ['customers', data.customer_id]
  ] : [],
  roles: () => [],
  user_roles: () => [],
  permissions: () => [],
  role_permissions: () => [],
  user_permissions: () => [],
  points_history: (data) => data?.customer_id ? [
    ['points_history', data.customer_id],
    ['customers', data.customer_id]
  ] : [],
};
