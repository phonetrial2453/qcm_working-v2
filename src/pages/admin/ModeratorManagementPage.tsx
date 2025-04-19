
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { PlusCircle, Search, Trash2, User, UsersRound } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

type Moderator = {
  id: string;
  email: string;
  name: string | null;
  assignedClasses: string[];
};

const ModeratorManagementPage: React.FC = () => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('existing');
  
  const { classes } = useApplications();

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    setIsLoading(true);
    try {
      const { data: moderatorRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'moderator');

      if (rolesError) throw rolesError;

      if (!moderatorRoles || moderatorRoles.length === 0) {
        setModerators([]);
        setIsLoading(false);
        return;
      }

      const moderatorIds = moderatorRoles.map(m => m.user_id);
      
      // Fetch users directly from auth.users
      const { data: users, error: usersError } = await supabase.rpc('get_users_by_ids', {
        user_ids: moderatorIds
      });

      if (usersError) throw usersError;

      // Get assigned classes for each moderator
      const { data: moderatorClasses, error: classesError } = await supabase
        .from('moderator_classes')
        .select('user_id, class_code')
        .in('user_id', moderatorIds);

      if (classesError) throw classesError;

      // Map moderator classes to users
      const moderatorClassMap: Record<string, string[]> = {};
      moderatorClasses?.forEach(mc => {
        if (!moderatorClassMap[mc.user_id]) {
          moderatorClassMap[mc.user_id] = [];
        }
        moderatorClassMap[mc.user_id].push(mc.class_code);
      });

      const formattedModerators: Moderator[] = users?.map(user => ({
        id: user.id,
        email: user.email,
        name: user.raw_user_meta_data?.name || null,
        assignedClasses: moderatorClassMap[user.id] || []
      })) || [];

      setModerators(formattedModerators);
    } catch (error: any) {
      console.error('Error fetching moderators:', error);
      toast.error('Failed to load moderators: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Use RPC to search users
      const { data, error } = await supabase.rpc('search_users', {
        search_term: searchQuery.toLowerCase()
      });

      if (error) throw error;

      // Filter out users who are already moderators
      const moderatorIds = moderators.map(mod => mod.id);
      const filteredResults = data?.filter(user => !moderatorIds.includes(user.id)) || [];
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users: ' + error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddModerator = async () => {
    if (!selectedUser && !newEmail) {
      toast.error('Please select a user or enter an email address');
      return;
    }

    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    setIsLoading(true);
    try {
      let userId = selectedUser;
      
      // If we're adding by email, we need to first create or find the user
      if (!userId && newEmail) {
        // Check if user already exists
        const { data: existingUser, error: searchError } = await supabase.rpc('search_users', {
          search_term: newEmail.toLowerCase()
        });

        if (searchError) throw searchError;

        if (existingUser && existingUser.length > 0) {
          // Use existing user
          userId = existingUser[0].id;
        } else {
          // Create new user
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: newEmail,
            email_confirm: true,
            user_metadata: { name: 'New Moderator' }
          });

          if (createError) throw createError;
          userId = newUser.user.id;
        }
      }

      if (!userId) {
        throw new Error('Failed to get user ID');
      }

      // Add moderator role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'moderator' });

      if (roleError) throw roleError;

      // Add classes for the moderator
      const classInserts = selectedClasses.map(classCode => ({
        user_id: userId,
        class_code: classCode
      }));

      const { error: classesError } = await supabase
        .from('moderator_classes')
        .upsert(classInserts);

      if (classesError) throw classesError;

      // Get user details to add to our state
      const { data: userData, error: userError } = await supabase.rpc('get_users_by_ids', {
        user_ids: [userId]
      });

      if (userError) throw userError;

      const newModeratorData = {
        id: userId,
        email: userData ? userData[0].email : newEmail,
        name: userData && userData[0].raw_user_meta_data?.name || null,
        assignedClasses: selectedClasses
      };

      setModerators(prev => [...prev, newModeratorData]);
      setDialogOpen(false);
      setSelectedUser(null);
      setNewEmail('');
      setSelectedClasses([]);
      setActiveTab('existing');
      toast.success(`Moderator ${newModeratorData.email} added successfully`);
    } catch (error: any) {
      console.error('Error adding moderator:', error);
      toast.error('Failed to add moderator: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeModerator = async (moderatorId: string) => {
    if (!confirm('Are you sure you want to remove this moderator?')) {
      return;
    }

    setIsLoading(true);
    try {
      // Remove moderator role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', moderatorId)
        .eq('role', 'moderator');

      if (roleError) throw roleError;

      // Remove class assignments
      const { error: classesError } = await supabase
        .from('moderator_classes')
        .delete()
        .eq('user_id', moderatorId);

      if (classesError) throw classesError;

      setModerators(prev => prev.filter(mod => mod.id !== moderatorId));
      toast.success('Moderator removed successfully');
    } catch (error: any) {
      console.error('Error removing moderator:', error);
      toast.error('Failed to remove moderator: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateModeratorClasses = async (moderatorId: string, updatedClasses: string[]) => {
    setIsLoading(true);
    try {
      // First, delete all existing class assignments
      const { error: deleteError } = await supabase
        .from('moderator_classes')
        .delete()
        .eq('user_id', moderatorId);

      if (deleteError) throw deleteError;

      // Then, add the new ones if there are any
      if (updatedClasses.length > 0) {
        const classInserts = updatedClasses.map(classCode => ({
          user_id: moderatorId,
          class_code: classCode
        }));

        const { error: insertError } = await supabase
          .from('moderator_classes')
          .insert(classInserts);

        if (insertError) throw insertError;
      }

      // Update the local state
      setModerators(prev => prev.map(mod => 
        mod.id === moderatorId 
          ? { ...mod, assignedClasses: updatedClasses } 
          : mod
      ));

      toast.success('Moderator classes updated successfully');
    } catch (error: any) {
      console.error('Error updating moderator classes:', error);
      toast.error('Failed to update moderator classes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassToggle = (moderatorId: string, classCode: string, isAssigned: boolean) => {
    const moderator = moderators.find(mod => mod.id === moderatorId);
    if (!moderator) return;

    let updatedClasses: string[];
    
    if (isAssigned) {
      updatedClasses = [...moderator.assignedClasses, classCode];
    } else {
      updatedClasses = moderator.assignedClasses.filter(code => code !== classCode);
    }

    updateModeratorClasses(moderatorId, updatedClasses);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setSelectedUser(null);
    setNewEmail('');
    setSelectedClasses([]);
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('existing');
  };

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-islamic-primary">Moderator Management</h1>
            <p className="text-muted-foreground">
              Manage access to class applications for moderators
            </p>
          </div>
          
          <Button 
            className="bg-islamic-primary hover:bg-islamic-primary/90"
            onClick={handleOpenDialog}
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Moderator
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Moderators</CardTitle>
            <CardDescription>
              Manage moderators and their assigned classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <p>Loading moderators...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Assigned Classes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderators.length > 0 ? (
                      moderators.map(moderator => (
                        <TableRow key={moderator.id}>
                          <TableCell className="font-medium">{moderator.email}</TableCell>
                          <TableCell>{moderator.name || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {classes.map(cls => (
                                <div key={cls.code} className="flex items-center mb-1 mr-4">
                                  <Checkbox
                                    id={`${moderator.id}-${cls.code}`}
                                    checked={moderator.assignedClasses.includes(cls.code)}
                                    onCheckedChange={(checked) => {
                                      handleClassToggle(moderator.id, cls.code, !!checked);
                                    }}
                                    disabled={isLoading}
                                  />
                                  <label
                                    htmlFor={`${moderator.id}-${cls.code}`}
                                    className="ml-2 text-sm font-medium"
                                  >
                                    {cls.name} ({cls.code})
                                  </label>
                                </div>
                              ))}
                              {classes.length === 0 && <span className="text-muted-foreground">No classes configured</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-500 hover:text-red-600"
                              onClick={() => removeModerator(moderator.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No moderators added yet. Add your first moderator.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-background">
            <DialogHeader>
              <DialogTitle>Add New Moderator</DialogTitle>
              <DialogDescription>
                Add a new moderator and assign classes they can manage
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">Existing User</TabsTrigger>
                <TabsTrigger value="new">New User</TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4 py-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search users by email or name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={searchUsers} 
                    disabled={searchLoading || !searchQuery.trim()}
                    variant="outline"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {searchLoading ? (
                  <div className="text-center py-4">Searching...</div>
                ) : (
                  <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                    {searchResults.length === 0 ? (
                      <div className="p-3 text-center text-muted-foreground text-sm">
                        {searchQuery ? 'No users found' : 'Enter a search term to find users'}
                      </div>
                    ) : (
                      searchResults.map(user => (
                        <div 
                          key={user.id} 
                          className={`p-3 hover:bg-muted cursor-pointer ${selectedUser === user.id ? 'bg-muted' : ''}`}
                          onClick={() => setSelectedUser(user.id)}
                        >
                          <div className="font-medium">{user.email}</div>
                          {user.raw_user_meta_data?.name && (
                            <div className="text-sm text-muted-foreground">{user.raw_user_meta_data.name}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="new" className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="new-email" className="text-sm font-medium">Email Address</label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    User will receive an invitation email to set up their account
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="space-y-2 py-2">
              <label className="text-sm font-medium">Assign Classes</label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {classes.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm">No classes configured</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {classes.map(cls => (
                      <div key={cls.code} className="flex items-center">
                        <Checkbox
                          id={`class-${cls.code}`}
                          checked={selectedClasses.includes(cls.code)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedClasses(prev => [...prev, cls.code]);
                            } else {
                              setSelectedClasses(prev => prev.filter(code => code !== cls.code));
                            }
                          }}
                        />
                        <label
                          htmlFor={`class-${cls.code}`}
                          className="ml-2 text-sm font-medium"
                        >
                          {cls.name} ({cls.code})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-islamic-primary hover:bg-islamic-primary/90"
                onClick={handleAddModerator}
                disabled={isLoading || (activeTab === 'existing' && !selectedUser) || (activeTab === 'new' && !newEmail) || selectedClasses.length === 0}
              >
                {isLoading ? 'Adding...' : 'Add Moderator'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ModeratorManagementPage;
