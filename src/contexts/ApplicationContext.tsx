// Update the ClassRecord type to include the template property
import { ClassRecord, ValidationRules } from '@/types/supabase-types';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface Class {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  validationRules: ValidationRules | null;
}

interface ApplicationContextType {
  classes: Class[];
  fetchClasses: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
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
          validationRules: item.validation_rules || null,
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

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <ApplicationContext.Provider value={{ classes, fetchClasses, loading, error }}>
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
