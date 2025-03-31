
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, UserProfile, UserRole } from '@/lib/auth-types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // تحقق من المستخدم الحالي عند تحميل التطبيق
  useEffect(() => {
    setIsLoading(true);
    
    // تعيين مستمع لحالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // استخدام setTimeout لمنع التداخل مع استدعاءات supabase الأخرى
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setIsLoading(false);
        }
      }
    );
    
    // التحقق من وجود جلسة للمستخدم
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session exists" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // استرجاع بيانات المستخدم وأدواره
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      
      // استرجاع الملف الشخصي
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }
      
      console.log("Profile data:", profileData);
      
      // استرجاع الأدوار
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error("Roles fetch error:", rolesError);
        throw rolesError;
      }
      
      console.log("Roles data:", rolesData);
      
      const userRoles = rolesData.map(r => r.role as UserRole);
      
      if (profileData) {
        const userProfile: UserProfile = {
          id: profileData.id,
          fullName: profileData.full_name,
          avatarUrl: profileData.avatar_url,
          phone: profileData.phone,
          position: profileData.position,
          roles: userRoles
        };
        
        console.log("Setting user profile:", userProfile);
        setProfile(userProfile);
        setRoles(userRoles);
      } else {
        console.warn("No profile found for user", userId);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
      setProfile(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // دالة تسجيل الدخول
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك مرة أخرى",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // دالة إنشاء حساب جديد
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يرجى تأكيد بريدك الإلكتروني للمتابعة",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // دالة تسجيل الخروج
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // التحقق من صلاحيات المستخدم
  const hasRole = (role: UserRole) => {
    console.log("Checking for role:", role, "in user roles:", roles);
    return roles.includes(role);
  };
  
  const value = {
    session,
    user,
    profile,
    roles,
    signIn,
    signUp,
    signOut,
    isLoading,
    isAuthenticated: !!user,
    hasRole
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
