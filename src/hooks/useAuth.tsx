import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile as BaseUserProfile, UserRole } from '@/lib/auth-types';
import type { Role } from '@/lib/auth-rbac-types';

// تعريف مؤقت لملف المستخدم الخاص بالمصادقة، متوافق مع الأدوار الجديدة
interface AuthUserProfile extends Omit<BaseUserProfile, 'roles'> {
  roles: Role[];
}

import { useToast } from '@/components/ui/use-toast';
import { adminCredentials } from '@/services/admin';

interface AuthState {
  user: User | null;
  profile: AuthUserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  roles: Role[]; // تعديل النوع ليكون Role[]
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<AuthUserProfile>) => Promise<void>;
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

  const fetchUserProfile = async (userId: string) => {
    try {
      // جلب بيانات المستخدم مع جميع الأدوار والصلاحيات المرتبطة به عبر join
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select(`
          id, full_name, email, avatar_url, phone, position
        `)
        .eq('id', userId)
        .single();

      // إذا كان الخطأ موجودًا أو لم يتم جلب بيانات صحيحة، أوقف التنفيذ
      if (userError || !userData || typeof userData !== 'object' || Array.isArray(userData) || !('id' in userData)) {
        throw userError || new Error('لم يتم العثور على بيانات المستخدم');
      }

      // جلب أدوار المستخدم بشكل منفصل
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role_id, roles:role_id(id, name, description)
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        throw rolesError;
      }

      // تحويل الأدوار إلى النموذج المطلوب
      const roles: Role[] = [];

      // تحقق من أن userRoles هو مصفوفة وليست خطأ
      if (Array.isArray(userRoles)) {
        for (const userRole of userRoles) {
          if (userRole.roles && typeof userRole.roles === 'object') {
            // لكل دور، جلب الصلاحيات المرتبطة به
            const { data: rolePerms, error: permsError } = await supabase
              .from('role_permissions')
              .select(`
                permission_id, permissions:permission_id(id, name, description)
              `)
              .eq('role_id', userRole.roles.id);

            if (permsError) {
              console.error("Error fetching role permissions:", permsError);
              continue;
            }

            const permissions = (Array.isArray(rolePerms) ? 
              rolePerms.map(rp => rp.permissions).filter(Boolean) : 
              []);

            roles.push({
              id: userRole.roles.id,
              name: userRole.roles.name,
              description: userRole.roles.description,
              permissions: permissions
            });
          }
        }
      }

      // بناء الملف الشخصي
      interface UserProfile extends Omit<BaseUserProfile, 'roles'> {
        roles: Role[];
      }

      const userProfile: AuthUserProfile = {
        id: userData.id,
        fullName: userData.full_name,
        email: userData.email,
        avatarUrl: userData.avatar_url,
        phone: userData.phone,
        position: userData.position,
        roles: roles, // Role[]
      };

      setState(prev => ({
        ...prev,
        profile: userProfile,
        roles: roles, // Role[]
        isLoading: false,
        isAuthenticated: true,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'حدث خطأ أثناء جلب الملف الشخصي',
      }));
    }
  };

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prevState => ({
        ...prevState,
        session,
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        isLoading: !!session?.user,
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

  const updateProfile = async (profileData: Partial<AuthUserProfile>) => {
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

  const hasRole = (role: UserRole): boolean => {
    // roles: Role[]
    return state.roles.some(r => r.name === role);
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
