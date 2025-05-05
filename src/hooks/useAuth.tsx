import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, UserProfile } from '@/lib/auth-types';
import { getAllUsers, getUserById } from '@/services/users-api';
import { UserRole } from '@/lib/auth-types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  refreshProfile?: () => Promise<void>; // Add this new method
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
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.session) {
        setIsAuthenticated(true);
        await loadUserProfile(session.session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    if (session) {
      setIsAuthenticated(true);
      loadUserProfile(session.data.session?.user.id);
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
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

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    profile,
    signIn,
    signOut,
    hasRole,
    refreshProfile, // Add this to the context
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
