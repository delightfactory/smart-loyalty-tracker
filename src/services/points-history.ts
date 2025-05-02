
import { supabase } from '@/integrations/supabase/client';

export interface PointsHistoryEntry {
  id?: string;
  customer_id: string;
  points: number;
  type: 'manual_add' | 'manual_deduct' | 'earned' | 'redeemed';
  source: 'invoice' | 'redemption' | 'manual_adjustment';
  notes?: string;
  created_at?: string;
  created_by?: string;
}

export const pointsHistoryService = {
  async getByCustomerId(customerId: string): Promise<PointsHistoryEntry[]> {
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(`Error fetching points history for customer ${customerId}:`, error);
      throw error;
    }
    
    // Properly cast data to ensure it conforms to our PointsHistoryEntry[] type
    return data.map(item => ({
      ...item,
      type: item.type as 'manual_add' | 'manual_deduct' | 'earned' | 'redeemed',
      source: item.source as 'invoice' | 'redemption' | 'manual_adjustment'
    }));
  },
  
  async addEntry(entry: PointsHistoryEntry): Promise<PointsHistoryEntry> {
    const { data, error } = await supabase
      .from('points_history')
      .insert(entry)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding points history entry:', error);
      throw error;
    }
    
    // Properly cast returned data to ensure it conforms to PointsHistoryEntry type
    return {
      ...data,
      type: data.type as 'manual_add' | 'manual_deduct' | 'earned' | 'redeemed',
      source: data.source as 'invoice' | 'redemption' | 'manual_adjustment'
    };
  }
};
