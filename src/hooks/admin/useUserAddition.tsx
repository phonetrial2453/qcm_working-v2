
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddModeratorForm {
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}

export const useUserAddition = (onUserAdded: () => Promise<void>) => {
  const [openDialog, setOpenDialog] = useState(false);

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
      await onUserAdded();
    } catch (error: any) {
      toast.error('Failed to add user: ' + error.message);
    }
  };

  return {
    openDialog,
    setOpenDialog,
    onAddModerator
  };
};
