
import { ClassRecord, ValidationRules } from '@/types/supabase-types';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface Application {
  id: string;
  classCode: string;
  status: string;
  createdAt: string;
  studentDetails: {
    fullName: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Class {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  validationRules: ValidationRules | null;
  template?: string | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  [key: string]: any;
}

interface ApplicationContextType {
  classes: Class[];
  applications: Application[];
  users: User[];
  fetchClasses: () => Promise<void>;
  refreshClasses: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch classes: ${error.message}`);
      }

      if (data) {
        const classList = data.map(item => ({
          id: item.id,
          name: item.name,
          code: item.code,
          description: item.description,
          createdAt: item.created_at,
          validationRules: item.validation_rules as ValidationRules | null,
          template: item.template || null,
        }));
        setClasses(classList);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a simple dummy implementation of fetchApplications for now
  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }

      setApplications(data || []);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      toast.error(`Error fetching applications: ${err.message}`);
    }
  };

  // Add a simple dummy implementation for users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('search_users', {
        search_term: '',
      });
      
      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  // Alias for fetchClasses for consistency
  const refreshClasses = fetchClasses;

  useEffect(() => {
    fetchClasses();
    fetchApplications();
    fetchUsers();
  }, []);

  return (
    <ApplicationContext.Provider value={{ 
      classes, 
      applications, 
      users,
      fetchClasses, 
      refreshClasses,
      loading, 
      error 
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};
