
import { useUserData } from './admin/useUserData';
import { useUserAddition } from './admin/useUserAddition';
import { useUserEditing } from './admin/useUserEditing';
import { useUserDeletion } from './admin/useUserDeletion';

export const useModeratorManagement = () => {
  const { users, userRoles, moderatorClasses, loading, fetchData } = useUserData();
  const { openDialog, setOpenDialog, onAddModerator } = useUserAddition(fetchData);
  const { 
    editingUser, 
    setEditingUser, 
    selectedClasses, 
    isUserAdmin, 
    setIsUserAdmin,
    onEditUser, 
    handleEditClick, 
    toggleClassSelection,
    updateSelectedClasses
  } = useUserEditing(userRoles, fetchData);
  const {
    userToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    confirmDeleteUser,
    handleDeleteUser,
    cancelDeleteUser
  } = useUserDeletion(fetchData);

  // Initialize selected classes when a user is selected for editing
  if (editingUser && selectedClasses.length === 0) {
    const userClasses = moderatorClasses
      .filter(mc => mc.user_id === editingUser.id)
      .map(mc => mc.class_code);
    
    if (userClasses.length > 0) {
      updateSelectedClasses(userClasses);
    }
  }

  return {
    // User data
    users,
    userRoles,
    moderatorClasses,
    loading,
    
    // User addition
    openDialog,
    setOpenDialog,
    onAddModerator,
    
    // User editing
    editingUser,
    setEditingUser,
    selectedClasses,
    isUserAdmin,
    setIsUserAdmin,
    onEditUser,
    handleEditClick,
    toggleClassSelection,
    updateSelectedClasses,
    
    // User deletion
    userToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    confirmDeleteUser,
    handleDeleteUser,
    cancelDeleteUser,
    
    // Utility
    fetchData
  };
};

export * from './admin/useUserData';
