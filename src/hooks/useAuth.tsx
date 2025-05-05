
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/lib/auth-types';
import { getAllUsers, getUserById } from '@/services/users-api';
import { UserRole } from '@/lib/auth-types';
import { AuthError, Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

// Define User type using Supabase's User type
type User = SupabaseUser;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  refreshProfile?: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  navigate?: NavigateFunction;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create version of AuthProvider that doesn't require Router context
export const AuthProviderNoRouter: React.FC<{ 
  children: React.ReactNode;
  navigate?: NavigateFunction;
}> = ({ children, navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Set up the auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("Current session:", data?.session?.user?.id);
        
        if (data.session) {
          setIsAuthenticated(true);
          setUser(data.session.user);
          await loadUserProfile(data.session.user.id);
        } 
        setIsLoading(false);
      } catch (err) {
        console.error("Error checking session:", err);
        setIsLoading(false);
      }
    };

    checkSession();

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string | undefined) => {
    if (!userId) return;
    try {
      console.log("Loading profile for user:", userId);
      const userProfile = await getUserById(userId);
      console.log("User profile loaded:", userProfile);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        throw error;
      }
      console.log("Sign-in successful for user:", data.user?.id);
      setIsAuthenticated(true);
      setUser(data.user);
      await loadUserProfile(data.user?.id);
      navigate && navigate('/dashboard');
    } catch (error: any) {
      console.error("Sign-in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log("Signing out user");
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      navigate && navigate('/auth');
    } catch (error) {
      console.error("Sign-out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole) => {
    return profile?.roles?.includes(role) ?? false;
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    
    try {
      const userProfile = await getUserById(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  // Add updatePassword method to change user password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      console.log("Updating password");
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Password update error:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    profile,
    signIn,
    signOut,
    hasRole,
    refreshProfile,
    updatePassword,
    navigate
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Version that uses Router context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  return <AuthProviderNoRouter navigate={navigate}>{children}</AuthProviderNoRouter>;
};
