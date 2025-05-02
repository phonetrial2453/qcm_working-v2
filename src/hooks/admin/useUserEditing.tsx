
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from './useUserData';

export const useUserEditing = (userRoles: UserRole[], onUserUpdated: () => Promise<void>) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    const userHasAdmin = userRoles.some(ur => ur.user_id === user.id && ur.role === 'admin');
    setIsUserAdmin(userHasAdmin);
    
    // This will be populated by the calling component using moderatorClasses
    setSelectedClasses([]);
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
      await onUserUpdated();
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const toggleClassSelection = (classCode: string) => {
    setSelectedClasses(prev => 
      prev.includes(classCode)
        ? prev.filter(c => c !== classCode)
        : [...prev, classCode]
    );
  };

  const updateSelectedClasses = (classes: string[]) => {
    setSelectedClasses(classes);
  };

  return {
    editingUser,
    setEditingUser,
    selectedClasses,
    isUserAdmin,
    setIsUserAdmin,
    onEditUser,
    handleEditClick,
    toggleClassSelection,
    updateSelectedClasses
  };
};
