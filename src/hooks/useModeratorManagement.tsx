
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

interface AddModeratorForm {
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}

export const useModeratorManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [moderatorClasses, setModeratorClasses] = useState<ModeratorClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

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

  const onAddModerator = async (data: AddModeratorForm) => {
    try {
      // Create user
      const { data: userData, error: signupError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name }
        }
      });
      
      if (signupError) throw signupError;
      
      if (!userData.user?.id) {
        throw new Error("User creation failed - no user ID returned");
      }
      
      const userId = userData.user.id;
      
      // Add role - admin or moderator
      const role = data.isAdmin ? 'admin' : 'moderator';
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (roleError) throw roleError;
      
      toast.success(`User ${data.name} added successfully as ${role}`);
      setOpenDialog(false);
      await fetchData();
    } catch (error: any) {
      toast.error('Failed to add user: ' + error.message);
    }
  };

  const onEditUser = async (userId: string) => {
    try {
      if (isUserAdmin) {
        const existingAdminRole = userRoles.find(ur => ur.user_id === userId && ur.role === 'admin');
        
        if (!existingAdminRole) {
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'admin' });
        }
      } else {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
          
        const existingModeratorRole = userRoles.find(ur => ur.user_id === userId && ur.role === 'moderator');
        
        if (!existingModeratorRole) {
          await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: 'moderator' });
        }
      }
      
      await supabase
        .from('moderator_classes')
        .delete()
        .eq('user_id', userId);
      
      if (selectedClasses.length > 0) {
        const classInserts = selectedClasses.map(classCode => ({
          user_id: userId,
          class_code: classCode
        }));
        
        await supabase
          .from('moderator_classes')
          .insert(classInserts);
      }
      
      toast.success('User updated successfully');
      setEditingUser(null);
      await fetchData();
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    const userHasAdmin = userRoles.some(ur => ur.user_id === user.id && ur.role === 'admin');
    setIsUserAdmin(userHasAdmin);
    
    const userClasses = moderatorClasses
      .filter(mc => mc.user_id === user.id)
      .map(mc => mc.class_code);
    setSelectedClasses(userClasses);
  };

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      // First delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDelete.id);
      
      if (rolesError) throw rolesError;
      
      // Then delete moderator classes assignments
      const { error: classesError } = await supabase
        .from('moderator_classes')
        .delete()
        .eq('user_id', userToDelete.id);
      
      if (classesError) throw classesError;
      
      // Finally delete the user from auth
      const { error: userError } = await supabase.auth.admin.deleteUser(
        userToDelete.id
      );
      
      if (userError) throw userError;
      
      toast.success('User deleted successfully');
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const toggleClassSelection = (classCode: string) => {
    setSelectedClasses(prev => 
      prev.includes(classCode)
        ? prev.filter(c => c !== classCode)
        : [...prev, classCode]
    );
  };

  return {
    users,
    userRoles,
    moderatorClasses,
    loading,
    openDialog,
    setOpenDialog,
    editingUser,
    setEditingUser,
    selectedClasses,
    isUserAdmin,
    setIsUserAdmin,
    userToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    onAddModerator,
    onEditUser,
    handleEditClick,
    confirmDeleteUser,
    handleDeleteUser,
    cancelDeleteUser,
    toggleClassSelection,
    fetchData
  };
};
