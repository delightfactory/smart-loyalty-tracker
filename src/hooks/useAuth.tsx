
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/lib/auth-types';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  roles: UserRole[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.info(`Fetching user profile for ID: ${userId}`);
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      console.info('Profile data:', profileData);
      
      // Get roles data
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) throw rolesError;
      console.info('Roles data:', rolesData);
      
      // Extract roles
      const userRoles = rolesData.map(r => r.role as UserRole);
      setRoles(userRoles);
      
      // Set profile
      const userProfile: UserProfile = {
        id: profileData.id,
        fullName: profileData.full_name,
        avatarUrl: profileData.avatar_url,
        phone: profileData.phone,
        position: profileData.position,
        roles: userRoles
      };
      
      console.info('Setting user profile:', userProfile);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);
  
  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    console.info(`Checking for role: ${role} in user roles:`, roles);
    return roles.includes(role);
  }, [roles]);
  
  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setRoles([]);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'حدث خطأ أثناء تسجيل الخروج');
    }
  };
  
  // Effect to check for initial session
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.info('Initial session check:', session ? 'Session exists' : 'No session');
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info('Auth state change event:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setRoles([]);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);
  
  // Context value
  const value = {
    user,
    profile,
    roles,
    isAuthenticated: !!user,
    isLoading,
    hasRole,
    signIn,
    signOut,
    refreshProfile
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
