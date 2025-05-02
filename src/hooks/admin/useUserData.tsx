
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    name?: string;
  };
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

interface ModeratorClass {
  id: string;
  user_id: string;
  class_code: string;
  created_at: string;
}

export const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [moderatorClasses, setModeratorClasses] = useState<ModeratorClass[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase.rpc('search_users', {
        search_term: '',
      });
      
      if (usersError) throw usersError;
      setUsers(usersData as User[]);
      
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      setUserRoles(rolesData as UserRole[]);
      
      const { data: classesData, error: classesError } = await supabase
        .from('moderator_classes')
        .select('*');
      
      if (classesError) throw classesError;
      setModeratorClasses(classesData as ModeratorClass[]);
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    users,
    userRoles,
    moderatorClasses,
    loading,
    fetchData
  };
};

export type { User, UserRole, ModeratorClass };
