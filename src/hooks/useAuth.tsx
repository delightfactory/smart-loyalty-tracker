
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/lib/auth-types';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

// تعريف نوع سياق المصادقة
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

// إنشاء سياق المصادقة
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// مزود المصادقة
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // التحقق من جلسة المستخدم عند تحميل التطبيق
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        
        // التحقق من الجلسة الحالية
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        console.info('Initial session check:', data.session ? 'Session exists' : 'No session');
        
        if (data.session) {
          setUser(data.session.user);
          await fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error('Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // جلب معلومات الملف الشخصي للمستخدم
    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, user_roles(role)')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        // تنسيق كائن الملف الشخصي
        const userProfile: UserProfile = {
          id: data.id,
          fullName: data.full_name,
          phone: data.phone,
          position: data.position,
          avatarUrl: data.avatar_url,
          roles: data.user_roles ? data.user_roles.map((r: any) => r.role) : []
        };
        
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchSession();
    
    // إعداد الاستماع للتغييرات في حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setIsLoading(false);
    });
    
    // تنظيف المشترك عند إلغاء التحميل
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // تسجيل الدخول
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      // تعيين بيانات المستخدم وجلب الملف الشخصي
      setUser(data.user);
      
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحبًا ${data.user?.email}`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // إنشاء حساب جديد
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        toast({
          title: 'خطأ في إنشاء الحساب',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'تم إنشاء حسابك بنجاح، الرجاء التحقق من بريدك الإلكتروني للتأكيد.',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // تسجيل الخروج
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: 'خطأ في تسجيل الخروج',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      // إعادة تعيين حالة المستخدم
      setUser(null);
      setProfile(null);
      
      toast({
        title: 'تم تسجيل الخروج بنجاح',
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // تحديث الملف الشخصي
  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: 'خطأ',
        description: 'المستخدم غير مسجل الدخول',
        variant: 'destructive'
      });
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedProfile.fullName,
          phone: updatedProfile.phone,
          position: updatedProfile.position,
          avatar_url: updatedProfile.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        toast({
          title: 'خطأ في تحديث الملف الشخصي',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      // تحديث الملف الشخصي المحلي
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      
      toast({
        title: 'تم تحديث الملف الشخصي بنجاح',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  // التحقق من صلاحيات المستخدم
  const hasRole = (role: UserRole): boolean => {
    if (!profile || !profile.roles) return false;
    return profile.roles.includes(role);
  };
  
  // قيمة سياق المصادقة
  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook لاستخدام سياق المصادقة
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
