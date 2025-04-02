
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/lib/auth-types';
import { useToast } from '@/components/ui/use-toast';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: UserRole[];
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    roles: [],
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // مزامنة بيانات الملف الشخصي مع حالة المستخدم
  const fetchUserProfile = async (userId: string) => {
    try {
      // جلب بيانات الملف الشخصي
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // جلب أدوار المستخدم
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) throw rolesError;
      
      // تنسيق بيانات الملف الشخصي
      const userRoles = rolesData.map(r => r.role as UserRole);
      
      const userProfile: UserProfile = {
        id: profileData.id,
        fullName: profileData.full_name,
        email: state.user?.email,
        avatarUrl: profileData.avatar_url,
        phone: profileData.phone,
        position: profileData.position,
        roles: userRoles,
      };
      
      setState(prev => ({
        ...prev,
        profile: userProfile,
        roles: userRoles,
        isLoading: false,
        isAuthenticated: true,
      }));
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'حدث خطأ أثناء جلب الملف الشخصي',
      }));
    }
  };

  // استمع للتغييرات في حالة المصادقة
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prevState => ({
          ...prevState,
          session,
          user: session?.user || null,
          isAuthenticated: !!session?.user,
        }));
        
        console.info('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // استخدم setTimeout لتجنب أي مشكلات في عمليات supabase المتداخلة
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setState(prevState => ({
            ...prevState,
            profile: null,
            roles: [],
            isAuthenticated: false,
          }));
        }
      }
    );

    // تحقق من وجود جلسة موجودة
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prevState => ({
        ...prevState,
        session,
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        isLoading: !!session?.user, // فقط استمر في تحميل إذا كان هناك مستخدم
      }));
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState(prevState => ({
          ...prevState,
          isLoading: false,
        }));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
      }));
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${data.user?.email}`,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: error.message,
      });
      
      throw error;
    }
  };

  // إنشاء حساب جديد
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم إرسال بريد تأكيد الحساب إلى بريدك الإلكتروني",
      });
      
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      
      toast({
        variant: "destructive",
        title: "فشل إنشاء الحساب",
        description: error.message,
      });
      
      throw error;
    }
  };

  // تسجيل الخروج
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({
        user: null,
        profile: null,
        session: null,
        roles: [],
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الخروج",
        description: error.message,
      });
    }
  };

  // تحديث الملف الشخصي
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!state.user) {
        throw new Error('غير مصرح به');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
          position: profileData.position,
          avatar_url: profileData.avatarUrl,
        })
        .eq('id', state.user.id);
      
      if (error) throw error;
      
      // تحديث الملف الشخصي في الحالة
      setState(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          ...profileData,
        },
      }));
      
      toast({
        title: "تم تحديث الملف الشخصي بنجاح",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تحديث الملف الشخصي",
        description: error.message,
      });
      
      throw error;
    }
  };

  // تحديث كلمة المرور
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "تم تحديث كلمة المرور بنجاح",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تحديث كلمة المرور",
        description: error.message,
      });
      
      throw error;
    }
  };

  // التحقق من صلاحيات المستخدم
  const hasRole = (role: UserRole): boolean => {
    return state.roles.includes(role);
  };

  const authContextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    hasRole,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
