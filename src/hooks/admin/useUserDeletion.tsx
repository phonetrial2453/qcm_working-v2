
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    name?: string;
  };
  created_at: string;
}

export const useUserDeletion = (onUserDeleted: () => Promise<void>) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user: currentUser } = useAuth();

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      // Check if trying to delete self
      if (currentUser && currentUser.id === userToDelete.id) {
        throw new Error("You cannot delete your own account");
      }
      
      // Delete user from Supabase Auth
      const { error } = await supabase.functions.invoke('deleteUser', {
        body: { userId: userToDelete.id }
      });
      
      if (error) throw error;
      
      toast.success(`User ${userToDelete.raw_user_meta_data?.name || userToDelete.email} deleted successfully.`);
      
      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      
      // Refresh user data
      await onUserDeleted();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsDeleting(false);
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
