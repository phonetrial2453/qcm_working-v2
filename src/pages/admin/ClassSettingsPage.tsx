
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { PlusCircle, Edit, Trash2, Save, X, FileText, Download, Settings } from 'lucide-react';

const ClassSettingsPage: React.FC = () => {
  const { classes: initialClasses, VALIDATION_RULES } = useApplications();
  const [classes, setClasses] = useState([...initialClasses]); // Create a mutable copy
  const [editingClass, setEditingClass] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // In a real implementation, this would fetch from Supabase
  useEffect(() => {
    const fetchClassesFromSupabase = async () => {
      try {
        // This would be replaced with a real Supabase query
        // const { data, error } = await supabase.from('classes').select('*');
        console.log('Would fetch classes from Supabase here');
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      }
    };
    
    fetchClassesFromSupabase();
  }, []);
  
  const handleEditClass = (classInfo: any) => {
    setEditingClass({
      ...classInfo,
      validationRules: {
        ageRange: { ...VALIDATION_RULES.ageRange },
        allowedStates: [...VALIDATION_RULES.allowedStates],
        minimumQualification: VALIDATION_RULES.minimumQualification,
      }
    });
    setFormErrors({});
  };
  
  const handleAddNewClass = () => {
    setEditingClass({
      isNew: true,
      code: '',
      name: '',
      description: '',
      validationRules: {
        ageRange: { ...VALIDATION_RULES.ageRange },
        allowedStates: [...VALIDATION_RULES.allowedStates],
        minimumQualification: VALIDATION_RULES.minimumQualification,
      }
    });
    setFormErrors({});
  };
  
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!editingClass.code.trim()) {
      errors.code = 'Class code is required';
    } else if (!/^[A-Z0-9]{3,5}$/.test(editingClass.code)) {
      errors.code = 'Code must be 3-5 uppercase letters/numbers';
    }
    
    if (!editingClass.name.trim()) {
      errors.name = 'Class name is required';
    }
    
    if (editingClass.validationRules.ageRange.min >= editingClass.validationRules.ageRange.max) {
      errors.ageRange = 'Maximum age must be greater than minimum age';
    }
    
    if (editingClass.validationRules.allowedStates.length === 0) {
      errors.states = 'At least one state must be selected';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveClass = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    
    try {
      if (editingClass.isNew) {
        // Check if class code already exists
        if (classes.some(c => c.code === editingClass.code)) {
          setFormErrors(prev => ({ ...prev, code: 'This class code already exists' }));
          return;
        }
        
        // In a real app, this would create a new class in Supabase
        setClasses(prev => [...prev, {
          code: editingClass.code,
          name: editingClass.name,
          description: editingClass.description,
        }]);
        
        toast.success(`Class ${editingClass.name} created successfully`);
      } else {
        // In a real app, this would update an existing class in Supabase
        setClasses(prev => prev.map(c => 
          c.code === editingClass.code 
            ? { 
                code: editingClass.code, 
                name: editingClass.name, 
                description: editingClass.description 
              }
            : c
        ));
        
        toast.success(`Class ${editingClass.name} updated successfully`);
      }
      
      setEditingClass(null);
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Failed to save class');
    }
  };
  
  const handleDeleteClass = async (classCode: string) => {
    // In a real app, this would delete the class from Supabase
    // and handle related applications
    
    try {
      setClasses(prev => prev.filter(c => c.code !== classCode));
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };
  
  const handleExportClassTemplate = (classCode: string) => {
    // In a real app, this would generate a template CSV for the class
    console.log(`Exporting template for class ${classCode}`);
    toast.success('Template exported successfully');
  };

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-islamic-primary">Class Settings</h1>
            <p className="text-muted-foreground">
              Manage classes and their validation rules
            </p>
          </div>
          
          <Button 
            className="bg-islamic-primary hover:bg-islamic-primary/90"
            onClick={handleAddNewClass}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Class
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Configured Classes</CardTitle>
            <CardDescription>
              Manage class information, validation rules, and templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map(classInfo => (
                    <TableRow key={classInfo.code}>
                      <TableCell className="font-medium">{classInfo.code}</TableCell>
                      <TableCell>{classInfo.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{classInfo.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleEditClass(classInfo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleExportClassTemplate(classInfo.code)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteClass(classInfo.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {classes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No classes configured. Add your first class.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {editingClass && (
          <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingClass.isNew ? 'Add New Class' : `Edit Class: ${editingClass.name}`}
                </DialogTitle>
                <DialogDescription>
                  Configure class details and validation rules
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Code:</label>
                  <div className="col-span-3">
                    <Input
                      value={editingClass.code}
                      onChange={(e) => setEditingClass({ ...editingClass, code: e.target.value.toUpperCase() })}
                      disabled={!editingClass.isNew}
                      placeholder="e.g., QRAN"
                      maxLength={5}
                    />
                    {formErrors.code && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Name:</label>
                  <div className="col-span-3">
                    <Input
                      value={editingClass.name}
                      onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                      placeholder="e.g., Quran Studies"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <label className="text-right text-sm font-medium pt-2">Description:</label>
                  <div className="col-span-3">
                    <Textarea
                      value={editingClass.description}
                      onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                      placeholder="Brief description of the class"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Age Range:</label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      type="number"
                      value={editingClass.validationRules.ageRange.min}
                      onChange={(e) => setEditingClass({
                        ...editingClass,
                        validationRules: {
                          ...editingClass.validationRules,
                          ageRange: {
                            ...editingClass.validationRules.ageRange,
                            min: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      min={0}
                      max={100}
                      className="w-20"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      value={editingClass.validationRules.ageRange.max}
                      onChange={(e) => setEditingClass({
                        ...editingClass,
                        validationRules: {
                          ...editingClass.validationRules,
                          ageRange: {
                            ...editingClass.validationRules.ageRange,
                            max: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      min={0}
                      max={100}
                      className="w-20"
                    />
                    <span>years</span>
                  </div>
                  {formErrors.ageRange && (
                    <div className="col-span-3 col-start-2">
                      <p className="text-red-500 text-xs mt-1">{formErrors.ageRange}</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <label className="text-right text-sm font-medium pt-2">Allowed States:</label>
                  <div className="col-span-3">
                    <div className="flex flex-wrap gap-2">
                      {['Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Karnataka', 'Kerala'].map(state => (
                        <Button
                          key={state}
                          type="button"
                          variant={editingClass.validationRules.allowedStates.includes(state) ? "default" : "outline"}
                          onClick={() => {
                            const states = editingClass.validationRules.allowedStates.includes(state)
                              ? editingClass.validationRules.allowedStates.filter((s: string) => s !== state)
                              : [...editingClass.validationRules.allowedStates, state];
                            
                            setEditingClass({
                              ...editingClass,
                              validationRules: {
                                ...editingClass.validationRules,
                                allowedStates: states
                              }
                            });
                          }}
                          className={editingClass.validationRules.allowedStates.includes(state) ? "bg-islamic-primary" : ""}
                        >
                          {state}
                        </Button>
                      ))}
                    </div>
                    {formErrors.states && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.states}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">Min. Qualification:</label>
                  <div className="col-span-3">
                    <Input
                      value={editingClass.validationRules.minimumQualification}
                      onChange={(e) => setEditingClass({
                        ...editingClass,
                        validationRules: {
                          ...editingClass.validationRules,
                          minimumQualification: e.target.value
                        }
                      })}
                      placeholder="e.g., Graduate"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingClass(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-islamic-primary hover:bg-islamic-primary/90"
                  onClick={handleSaveClass}
                >
                  {editingClass.isNew ? 'Create Class' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
};

export default ClassSettingsPage;
