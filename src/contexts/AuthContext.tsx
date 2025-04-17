
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

// Define user types and roles
export type UserRole = 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  classes?: string[]; // Classes the moderator has access to
}

// Mock users for demonstration - would be replaced by Supabase auth
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'adminpass',
    name: 'Admin User',
    role: 'admin' as UserRole,
  },
  {
    id: '2',
    email: 'moderator@example.com',
    password: 'moderatorpass',
    name: 'Moderator User',
    role: 'moderator' as UserRole,
    classes: ['QRAN', 'SRAT'],
  },
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('qsUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('qsUser');
      }
    }
    setLoading(false);
  }, []);

  // Mock login function (would use Supabase auth in production)
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        classes: foundUser.role === 'moderator' ? foundUser.classes : undefined,
      };
      
      setUser(userData);
      localStorage.setItem('qsUser', JSON.stringify(userData));
      toast.success(`Welcome back, ${userData.name}!`);
      setLoading(false);
      return true;
    }
    
    toast.error('Invalid email or password');
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qsUser');
    toast.info('You have been logged out');
  };

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated, 
      isAdmin, 
      isModerator
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
