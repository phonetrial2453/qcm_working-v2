
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import { UserCog, UserPlus, Edit, Trash2, Check, X } from 'lucide-react';

// Mock moderators for now, would be replaced with actual data
const MOCK_MODERATORS = [
  {
    id: '1',
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    role: 'moderator',
    classes: ['QRAN', 'SRAT'],
    lastActive: '2023-04-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Fatima Ali',
    email: 'fatima@example.com',
    role: 'moderator',
    classes: ['FIQH'],
    lastActive: '2023-04-16T09:15:00Z',
  },
];

const ModeratorManagementPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { classes } = useApplications();
  const navigate = useNavigate();
  
  const [moderators, setModerators] = useState(MOCK_MODERATORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newModerator, setNewModerator] = useState({
    name: '',
    email: '',
    password: '',
    selectedClasses: [] as string[],
  });

  // Will connect to Supabase for moderator management in the future
  useEffect(() => {
    const fetchModerators = async () => {
      try {
        // In the future, replace with actual Supabase query
        // const { data, error } = await supabase.from('moderators').select('*');
        console.log('Would fetch moderators from Supabase here');
      } catch (error) {
        console.error('Error fetching moderators:', error);
        toast.error('Failed to load moderators');
      }
    };

    fetchModerators();
  }, []);
  
  const handleClassToggle = (classCode: string) => {
    if (editingId) {
      // Editing existing moderator
      setModerators(prev => 
        prev.map(mod => 
          mod.id === editingId 
            ? {
                ...mod,
                classes: mod.classes.includes(classCode)
                  ? mod.classes.filter(c => c !== classCode)
                  : [...mod.classes, classCode]
              }
            : mod
        )
      );
    } else {
      // Adding new moderator
      setNewModerator(prev => ({
        ...prev,
        selectedClasses: prev.selectedClasses.includes(classCode)
          ? prev.selectedClasses.filter(c => c !== classCode)
          : [...prev.selectedClasses, classCode]
      }));
    }
  };
  
  const handleAddModerator = async () => {
    try {
      // Validation
      if (!newModerator.name || !newModerator.email || !newModerator.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (newModerator.selectedClasses.length === 0) {
        toast.error('Please assign at least one class');
        return;
      }
      
      // Mock implementation - in real app, this would create a user in Supabase Auth
      // and then store the moderator's class assignments
      const newId = (moderators.length + 1).toString();
      
      setModerators(prev => [
        ...prev,
        {
          id: newId,
          name: newModerator.name,
          email: newModerator.email,
          role: 'moderator',
          classes: [...newModerator.selectedClasses],
          lastActive: new Date().toISOString(),
        }
      ]);
      
      // Reset form
      setNewModerator({
        name: '',
        email: '',
        password: '',
        selectedClasses: [],
      });
      
      setShowAddForm(false);
      toast.success('Moderator added successfully');
    } catch (error) {
      console.error('Error adding moderator:', error);
      toast.error('Failed to add moderator');
    }
  };
  
  const handleDeleteModerator = (id: string) => {
    // In a real app, this would delete the user from Supabase Auth
    setModerators(prev => prev.filter(mod => mod.id !== id));
    toast.success('Moderator removed successfully');
  };
  
  const handleSaveEdit = (id: string) => {
    // In a real app, this would update the moderator's class assignments in Supabase
    setEditingId(null);
    toast.success('Moderator updated successfully');
  };
  
  const filteredModerators = moderators.filter(mod => 
    mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
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
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <X className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
            {showAddForm ? 'Cancel' : 'Add Moderator'}
          </Button>
        </div>
        
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Moderator</CardTitle>
              <CardDescription>Create a new moderator account and assign classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    placeholder="Enter full name" 
                    value={newModerator.name}
                    onChange={(e) => setNewModerator(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    placeholder="Enter email address" 
                    value={newModerator.email}
                    onChange={(e) => setNewModerator(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input 
                    type="password"
                    placeholder="Enter temporary password" 
                    value={newModerator.password}
                    onChange={(e) => setNewModerator(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Assign Classes</label>
                <div className="flex flex-wrap gap-2">
                  {classes.map(cls => (
                    <Button
                      key={cls.code}
                      variant={newModerator.selectedClasses.includes(cls.code) ? "default" : "outline"}
                      onClick={() => handleClassToggle(cls.code)}
                      className={newModerator.selectedClasses.includes(cls.code) ? "bg-islamic-primary" : ""}
                    >
                      {cls.name} ({cls.code})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-islamic-primary hover:bg-islamic-primary/90 w-full"
                onClick={handleAddModerator}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Moderator
              </Button>
            </CardFooter>
          </Card>
        )}
        
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
                        <TableCell className="font-medium">{moderator.name}</TableCell>
                        <TableCell>{moderator.email}</TableCell>
                        <TableCell>
                          {editingId === moderator.id ? (
                            <div className="flex flex-wrap gap-2">
                              {classes.map(cls => (
                                <Button
                                  key={cls.code}
                                  size="sm"
                                  variant={moderator.classes.includes(cls.code) ? "default" : "outline"}
                                  onClick={() => handleClassToggle(cls.code)}
                                  className={moderator.classes.includes(cls.code) ? "bg-islamic-primary h-8" : "h-8"}
                                >
                                  {cls.code}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {moderator.classes.map(classCode => (
                                <span key={classCode} className="px-2 py-1 text-xs bg-islamic-primary/10 text-islamic-primary rounded-md">
                                  {classCode}
                                </span>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(moderator.lastActive)}</TableCell>
                        <TableCell className="text-right">
                          {editingId === moderator.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => handleSaveEdit(moderator.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => setEditingId(moderator.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteModerator(moderator.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No moderators found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ModeratorManagementPage;
