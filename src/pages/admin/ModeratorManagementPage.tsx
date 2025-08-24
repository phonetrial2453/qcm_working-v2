
import React, { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { useModeratorManagement } from '@/hooks/useModeratorManagement';

import AddModeratorDialog from '@/components/admin/AddModeratorDialog';
import EditModeratorDialog from '@/components/admin/EditModeratorDialog';
import DeleteModeratorDialog from '@/components/admin/DeleteModeratorDialog';
import { PasswordResetDialog } from '@/components/admin/PasswordResetDialog';
import ModeratorTable from '@/components/admin/ModeratorTable';

const ModeratorManagementPage: React.FC = () => {
  const { isAdmin: userIsAdmin } = useAuth();
  const { classes } = useApplications();
  const [passwordResetUser, setPasswordResetUser] = React.useState<any>(null);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = React.useState(false);
  
  const {
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
    updateSelectedClasses
  } = useModeratorManagement();

  const handlePasswordReset = (user: any) => {
    setPasswordResetUser(user);
    setIsPasswordResetOpen(true);
  };

  // Reset selected classes when editing user changes
  useEffect(() => {
    if (!editingUser) {
      updateSelectedClasses([]);
    }
  }, [editingUser, updateSelectedClasses]);

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Moderator Management</h1>
          
          <AddModeratorDialog 
            open={openDialog} 
            onOpenChange={setOpenDialog}
            onAddModerator={onAddModerator}
          />

          <EditModeratorDialog
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
            editingUser={editingUser}
            isUserAdmin={isUserAdmin}
            setIsUserAdmin={setIsUserAdmin}
            selectedClasses={selectedClasses}
            toggleClassSelection={toggleClassSelection}
            onSave={onEditUser}
            classes={classes}
          />
          
          <DeleteModeratorDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            userToDelete={userToDelete}
            isDeleting={isDeleting}
            onDelete={handleDeleteUser}
            onCancel={cancelDeleteUser}
          />

          <PasswordResetDialog
            open={isPasswordResetOpen}
            onOpenChange={setIsPasswordResetOpen}
            user={passwordResetUser}
          />
        </div>
        
        <ModeratorTable
          users={users}
          userRoles={userRoles}
          moderatorClasses={moderatorClasses}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={confirmDeleteUser}
          onResetPassword={handlePasswordReset}
        />
      </div>
    </AppLayout>
  );
};

export default ModeratorManagementPage;
