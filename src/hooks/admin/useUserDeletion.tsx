
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from './useUserData';

export const useUserDeletion = (onUserDeleted: () => Promise<void>) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      await onUserDeleted();
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

  return {
    userToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    confirmDeleteUser,
    handleDeleteUser,
    cancelDeleteUser
  };
};
