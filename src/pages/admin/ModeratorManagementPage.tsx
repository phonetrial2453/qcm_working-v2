
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { UserCog, UserPlus, Edit, Trash2, Check, X, Key, Shield } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

// Define validation schema for moderator form
const moderatorSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  selectedClasses: z.array(z.string()).min(1, { message: "Please assign at least one class" })
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
});

type ModeratorFormValues = z.infer<typeof moderatorSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface Moderator {
  id: string;
  email: string;
  name: string | null;
  role: string;
  classes: string[];
  lastActive: string | null;
}

const ModeratorManagementPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { classes } = useApplications();
  const navigate = useNavigate();
  
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedModeratorId, setSelectedModeratorId] = useState<string | null>(null);
  
  const moderatorForm = useForm<ModeratorFormValues>({
    resolver: zodResolver(moderatorSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      selectedClasses: []
    }
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: ''
    }
  });
  
  // Fetch moderators from Supabase
  const fetchModerators = async () => {
    setIsLoading(true);
    try {
      // Get users with moderator role
      const { data: userData, error: userError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role
        `)
        .eq('role', 'moderator');
      
      if (userError) throw userError;
      
      if (!userData || userData.length === 0) {
        setModerators([]);
        setIsLoading(false);
        return;
      }
      
      // Get user details from auth schema (using separate fetch for each user)
      const moderatorPromises = userData.map(async (userRole) => {
        // Get moderator's profile information from auth.users
        const { data: moderatorData, error: moderatorError } = await supabase.auth.admin.getUserById(
          userRole.user_id
        );
        
        if (moderatorError) {
          console.error('Error fetching moderator details:', moderatorError);
          return null;
        }
        
        if (!moderatorData?.user) {
          return null;
        }
        
        // Get assigned classes for this moderator
        const { data: classData, error: classError } = await supabase
          .from('moderator_classes')
          .select('class_code')
          .eq('user_id', userRole.user_id);
          
        if (classError) {
          console.error('Error fetching moderator classes:', classError);
        }
        
        return {
          id: userRole.user_id,
          email: moderatorData.user.email || '',
          name: moderatorData.user.user_metadata?.name || null,
          role: 'moderator',
          classes: classData ? classData.map(c => c.class_code) : [],
          lastActive: moderatorData.user.last_sign_in_at
        };
      });
      
      const moderatorResults = await Promise.all(moderatorPromises);
      setModerators(moderatorResults.filter(Boolean) as Moderator[]);
    } catch (error) {
      console.error('Error fetching moderators:', error);
      toast.error('Failed to load moderators');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModerators();
  }, []);
  
  const handleAddModerator = async (values: ModeratorFormValues) => {
    setIsLoading(true);
    try {
      // Create user in Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          name: values.name
        }
      });
      
      if (userError) throw userError;
      
      if (!userData.user) {
        throw new Error('Failed to create user');
      }
      
      // Assign moderator role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'moderator'
        });
        
      if (roleError) throw roleError;
      
      // Assign classes to moderator
      if (values.selectedClasses.length > 0) {
        const classAssignments = values.selectedClasses.map(classCode => ({
          user_id: userData.user.id,
          class_code: classCode
        }));
        
        const { error: classError } = await supabase
          .from('moderator_classes')
          .insert(classAssignments);
          
        if (classError) throw classError;
      }
      
      // Refresh the moderator list
      fetchModerators();
      setAddDialogOpen(false);
      moderatorForm.reset();
      toast.success('Moderator added successfully');
    } catch (error: any) {
      console.error('Error adding moderator:', error);
      toast.error(`Failed to add moderator: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteModerator = async (id: string) => {
    if (!confirm('Are you sure you want to delete this moderator? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Remove role assignments
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', id);
        
      if (roleError) throw roleError;
      
      // Remove class assignments
      const { error: classError } = await supabase
        .from('moderator_classes')
        .delete()
        .eq('user_id', id);
        
      if (classError) throw classError;
      
      // Delete user from Supabase Auth
      const { error: userError } = await supabase.auth.admin.deleteUser(id);
      
      if (userError) throw userError;
      
      // Refresh the moderator list
      fetchModerators();
      toast.success('Moderator removed successfully');
    } catch (error: any) {
      console.error('Error deleting moderator:', error);
      toast.error(`Failed to delete moderator: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditClasses = (moderator: Moderator) => {
    setSelectedModeratorId(moderator.id);
    // Set the form's selected classes based on moderator's current assignments
    moderatorForm.setValue('selectedClasses', moderator.classes || []);
    setClassDialogOpen(true);
  };
  
  const handleSaveClasses = async () => {
    if (!selectedModeratorId) return;
    
    setIsLoading(true);
    try {
      const selectedClasses = moderatorForm.getValues('selectedClasses');
      
      // Delete existing class assignments
      const { error: deleteError } = await supabase
        .from('moderator_classes')
        .delete()
        .eq('user_id', selectedModeratorId);
        
      if (deleteError) throw deleteError;
      
      // Add new class assignments
      if (selectedClasses.length > 0) {
        const classAssignments = selectedClasses.map(classCode => ({
          user_id: selectedModeratorId,
          class_code: classCode
        }));
        
        const { error: insertError } = await supabase
          .from('moderator_classes')
          .insert(classAssignments);
          
        if (insertError) throw insertError;
      }
      
      // Refresh the moderator list
      fetchModerators();
      setClassDialogOpen(false);
      toast.success('Class assignments updated successfully');
    } catch (error: any) {
      console.error('Error updating class assignments:', error);
      toast.error(`Failed to update class assignments: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = (id: string) => {
    setSelectedModeratorId(id);
    resetPasswordForm.reset();
    setResetPasswordDialogOpen(true);
  };
  
  const handleSaveNewPassword = async (values: ResetPasswordFormValues) => {
    if (!selectedModeratorId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.admin.updateUserById(
        selectedModeratorId,
        { password: values.password }
      );
      
      if (error) throw error;
      
      setResetPasswordDialogOpen(false);
      toast.success('Password reset successfully');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(`Failed to reset password: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredModerators = moderators.filter(mod => 
    mod.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mod.name && mod.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-islamic-primary">Moderator Management</h1>
            <p className="text-muted-foreground">
              Manage moderators and their class assignments
            </p>
          </div>
          
          <Button 
            className="bg-islamic-primary hover:bg-islamic-primary/90"
            onClick={() => {
              moderatorForm.reset();
              setAddDialogOpen(true);
            }}
            disabled={isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Moderator
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Moderators</CardTitle>
            <div className="relative">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && moderators.length === 0 ? (
              <div className="flex justify-center p-6">
                <p>Loading moderators...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Classes</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModerators.length > 0 ? (
                      filteredModerators.map(moderator => (
                        <TableRow key={moderator.id}>
                          <TableCell className="font-medium">{moderator.name || 'N/A'}</TableCell>
                          <TableCell>{moderator.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {moderator.classes && moderator.classes.length > 0 ? (
                                moderator.classes.map(classCode => (
                                  <span key={classCode} className="px-2 py-1 text-xs bg-islamic-primary/10 text-islamic-primary rounded-md">
                                    {classCode}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground">No classes assigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(moderator.lastActive)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => handleEditClasses(moderator)}
                                disabled={isLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => handleResetPassword(moderator.id)}
                                disabled={isLoading}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteModerator(moderator.id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          {searchTerm ? 'No moderators found matching your search.' : 'No moderators found. Add your first moderator.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Add Moderator Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-background">
            <DialogHeader>
              <DialogTitle>Add New Moderator</DialogTitle>
              <DialogDescription>Create a new moderator account and assign classes</DialogDescription>
            </DialogHeader>
            
            <Form {...moderatorForm}>
              <form onSubmit={moderatorForm.handleSubmit(handleAddModerator)} className="space-y-4">
                <FormField
                  control={moderatorForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={moderatorForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Enter temporary password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={moderatorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={moderatorForm.control}
                  name="selectedClasses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Classes</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {classes.map(cls => (
                          <Button
                            key={cls.code}
                            type="button"
                            variant={field.value.includes(cls.code) ? "default" : "outline"}
                            onClick={() => {
                              const updatedClasses = field.value.includes(cls.code)
                                ? field.value.filter(c => c !== cls.code)
                                : [...field.value, cls.code];
                              field.onChange(updatedClasses);
                            }}
                            className={field.value.includes(cls.code) ? "bg-islamic-primary" : ""}
                          >
                            {cls.name} ({cls.code})
                          </Button>
                        ))}
                      </div>
                      <FormDescription>
                        Assign classes that this moderator will be responsible for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setAddDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-islamic-primary hover:bg-islamic-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Moderator'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Classes Dialog */}
        <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-background">
            <DialogHeader>
              <DialogTitle>Edit Assigned Classes</DialogTitle>
              <DialogDescription>Update class assignments for this moderator</DialogDescription>
            </DialogHeader>
            
            <Form {...moderatorForm}>
              <div className="space-y-4">
                <FormField
                  control={moderatorForm.control}
                  name="selectedClasses"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2">
                        {classes.map(cls => (
                          <Button
                            key={cls.code}
                            type="button"
                            variant={field.value.includes(cls.code) ? "default" : "outline"}
                            onClick={() => {
                              const updatedClasses = field.value.includes(cls.code)
                                ? field.value.filter(c => c !== cls.code)
                                : [...field.value, cls.code];
                              field.onChange(updatedClasses);
                            }}
                            className={field.value.includes(cls.code) ? "bg-islamic-primary" : ""}
                          >
                            {cls.name} ({cls.code})
                          </Button>
                        ))}
                      </div>
                      <FormDescription>
                        Assign classes that this moderator will be responsible for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setClassDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-islamic-primary hover:bg-islamic-primary/90"
                    onClick={handleSaveClasses}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-background">
            <DialogHeader>
              <DialogTitle>Reset Moderator Password</DialogTitle>
              <DialogDescription>Set a new password for this moderator</DialogDescription>
            </DialogHeader>
            
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleSaveNewPassword)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Enter new password" />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setResetPasswordDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-islamic-primary hover:bg-islamic-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ModeratorManagementPage;
