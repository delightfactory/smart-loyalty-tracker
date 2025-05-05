
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';

/**
 * تزامن حالة المصادقة ومسح الذاكر المؤقتة عند تغيير المستخدم أو تسجيل الخروج
 */
export function useAuthSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prevUserId, setPrevUserId] = useState<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id || null;

    // إذا تغير المستخدم أو تم تسجيل الخروج، نقوم بمسح ذاكرة التخزين المؤقتة
    if (prevUserId !== currentUserId) {
      console.log('User changed, invalidating query cache', { 
        prevUserId, 
        currentUserId 
      });
      
      // مسح كافة بيانات الذاكرة المؤقتة
      queryClient.invalidateQueries();
      
      // تحديث معرف المستخدم السابق
      setPrevUserId(currentUserId);
    }
  }, [user?.id, queryClient, prevUserId]);

  return { isAuthenticated: !!user };
}
