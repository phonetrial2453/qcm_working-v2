import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Extended User type to include additional properties
export interface ExtendedUser extends User {
  name?: string;
  role?: string;
  classes?: string[];
}

interface AuthContextType {
  session: Session | null;
  user: ExtendedUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: (redirectTo?: string) => Promise<void>;
  loading: boolean;
  // Computed properties
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Alias for more readable code
  login: (email: string, password: string) => Promise<boolean>;
  logout: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [adminStatus, setAdminStatus] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      if (session?.user) {
        // Create an extended user with additional properties
        const extendedUser: ExtendedUser = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: 'user' // Default role
        };
        setUser(extendedUser);
        
        // Use setTimeout to prevent recursion in auth state changes
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setUserRoles([]);
        setAdminStatus(false);
      }
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Create an extended user with additional properties
        const extendedUser: ExtendedUser = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: 'user' // Default role
        };
        setUser(extendedUser);
        
        // Use setTimeout to prevent recursion in auth state changes
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user roles directly from the database
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching roles for user:', userId);
      
      // Query user_roles table directly instead of using RPC
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error fetching user roles:', roleError.message);
        return;
      }

      if (roleData && Array.isArray(roleData) && roleData.length > 0) {
        // Extract role strings from the returned objects
        const roles = roleData.map(r => r.role);
        console.log('Found roles:', roles);
        setUserRoles(roles);
        
        const isAdmin = roles.includes('admin');
        setAdminStatus(isAdmin);
        
        // Update the user with role information
        setUser(prevUser => {
          if (!prevUser) return null;
          
          const role = isAdmin ? 'admin' : 
                      roles.includes('moderator') ? 'moderator' : 'user';
          
          // For moderators, fetch their class assignments
          if (role === 'moderator') {
            fetchModeratorClasses(userId);
          }
          
          return {
            ...prevUser,
            role
          };
        });
      } else {
        console.log('No roles found for user');
        setUserRoles([]);
        setAdminStatus(false);
      }
    } catch (error: any) {
      console.error('Error in fetchUserRole:', error.message);
    }
  };

  // Fetch moderator class assignments (in a real app, this would come from a database)
  const fetchModeratorClasses = async (userId: string) => {
    // This is a placeholder - in a real app, you would fetch from the database
    // For now, we'll assign some mock classes to all moderators
    const mockClasses = ['QRAN', 'SRAT'];
    
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        classes: mockClasses
      };
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Successfully signed in');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  // Alias for signIn with a boolean return value for the LoginPage
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signIn(email, password);
      return true;
    } catch (error) {
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Registration successful! Please check your email for verification.');
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
      throw error;
    }
  };

  const signOut = async (redirectTo?: string) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out');
      
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  // Alias for signOut
  const logout = signOut;

  // Computed properties
  const isAuthenticated = !!user;
  const isAdmin = adminStatus;

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signUp, 
      signOut, 
      loading,
      isAuthenticated,
      isAdmin,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
