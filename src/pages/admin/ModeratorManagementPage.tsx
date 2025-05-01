
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Trash2, Edit2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

const ModeratorManagementPage: React.FC = () => {
  const { isAdmin: userIsAdmin } = useAuth();
  const { classes } = useApplications();
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
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddModeratorForm>();

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
      reset();
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
    const isUserAdmin = userRoles.some(ur => ur.user_id === user.id && ur.role === 'admin');
    setIsUserAdmin(isUserAdmin);
    
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

  const getUserRoles = (userId: string) => {
    return userRoles
      .filter(ur => ur.user_id === userId)
      .map(ur => ur.role);
  };

  const getUserClasses = (userId: string) => {
    return moderatorClasses
      .filter(mc => mc.user_id === userId)
      .map(mc => mc.class_code);
  };

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Moderator Management</h1>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-primary hover:bg-islamic-primary/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Add a new administrator or moderator to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onAddModerator)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="col-span-1">Name</Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="col-span-1">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="col-span-3"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    {errors.email && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.email.message}</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="col-span-1">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      className="col-span-3"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    {errors.password && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.password.message}</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isAdmin" className="col-span-1">Admin</Label>
                    <div className="col-span-3 flex items-center">
                      <Checkbox 
                        id="isAdmin" 
                        {...register('isAdmin')} 
                      />
                      <Label htmlFor="isAdmin" className="ml-2">Make this user an admin</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-islamic-primary hover:bg-islamic-primary/90">Add User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user roles and class assignments.
                </DialogDescription>
              </DialogHeader>
              {editingUser && (
                <div className="py-4">
                  <h3 className="font-medium mb-2">{editingUser.raw_user_meta_data?.name || 'Unnamed User'}</h3>
                  <p className="text-sm text-gray-500 mb-4">{editingUser.email}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Checkbox 
                        id="isAdmin" 
                        checked={isUserAdmin}
                        onCheckedChange={(checked) => setIsUserAdmin(checked as boolean)}
                      />
                      <Label htmlFor="isAdmin" className="ml-2">Admin Access</Label>
                    </div>
                    <p className="text-xs text-gray-500">Admins have full access to all features.</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Class Assignments</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {classes.map(cls => (
                        <div key={cls.code} className="flex items-center">
                          <Checkbox 
                            id={`class-${cls.code}`}
                            checked={selectedClasses.includes(cls.code)}
                            onCheckedChange={() => toggleClassSelection(cls.code)}
                            disabled={isUserAdmin}
                          />
                          <Label htmlFor={`class-${cls.code}`} className="ml-2">{cls.name}</Label>
                        </div>
                      ))}
                    </div>
                    {isUserAdmin && (
                      <p className="text-xs text-gray-500 mt-2">Admins automatically have access to all classes.</p>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-islamic-primary hover:bg-islamic-primary/90"
                      onClick={() => onEditUser(editingUser.id)}
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user and remove all of their data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelDeleteUser} disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteUser} 
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage administrators and moderators, and assign them to specific classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-islamic-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Assigned Classes</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {user.raw_user_meta_data?.name || 'Unnamed User'}
                        </td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {getUserRoles(user.id).map(role => (
                              <Badge key={role} variant={role === 'admin' ? 'default' : 'outline'}>
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {getUserRoles(user.id).includes('admin') ? (
                              <span className="text-xs text-gray-500">All Classes</span>
                            ) : (
                              getUserClasses(user.id).map(classCode => (
                                <Badge key={classCode} variant="secondary">
                                  {classCode}
                                </Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(user)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => confirmDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ModeratorManagementPage;
