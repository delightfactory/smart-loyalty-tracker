
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fix the getSession call and ensure we handle the Promise correctly
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        await loadUserProfile(data.session.user.id);
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        await loadUserProfile(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string | undefined) => {
    if (!userId) return;
    try {
      const userProfile = await getUserById(userId);
      if (userProfile) {
        setUser(userProfile);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      setIsAuthenticated(true);
      await loadUserProfile(data.user?.id);
      navigate('/dashboard');
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
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      navigate('/auth');
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
    updatePassword, // Add the new method to the context
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
