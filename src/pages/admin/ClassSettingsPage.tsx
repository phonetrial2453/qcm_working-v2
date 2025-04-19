
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useApplications } from '@/contexts/ApplicationContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface ClassFormData {
  code: string;
  name: string;
  description: string;
  template: string;
  allowedLocations: string;
  minAge: number;
  maxAge: number;
  minQualification: string;
}

const ClassSettingsPage: React.FC = () => {
  const { classes, refreshClasses } = useApplications();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ClassFormData>();

  useEffect(() => {
    if (editingClass) {
      const classToEdit = classes.find(c => c.code === editingClass);
      if (classToEdit) {
        setValue('code', classToEdit.code);
        setValue('name', classToEdit.name);
        setValue('description', classToEdit.description || '');
        setValue('template', classToEdit.template || '');
        
        // Handle validation rules
        try {
          const validationRules = classToEdit.validation_rules;
          let parsedRules: any = {};
          
          if (typeof validationRules === 'string') {
            parsedRules = JSON.parse(validationRules);
          } else if (validationRules && typeof validationRules === 'object') {
            parsedRules = validationRules;
          }
          
          setValue('allowedLocations', (parsedRules.allowedStates || []).join(', '));
          setValue('minAge', parsedRules.ageRange?.min || 25);
          setValue('maxAge', parsedRules.ageRange?.max || 45);
          setValue('minQualification', parsedRules.minimumQualification || 'Graduate');
        } catch (error) {
          console.error('Error parsing validation rules:', error);
          setValue('allowedLocations', '');
          setValue('minAge', 25);
          setValue('maxAge', 45);
          setValue('minQualification', 'Graduate');
        }
      }
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        template: '',
        allowedLocations: 'Tamil Nadu, Telangana, Andhra Pradesh',
        minAge: 25,
        maxAge: 45,
        minQualification: 'Graduate'
      });
    }
  }, [editingClass, classes, setValue, reset]);

  const onSubmit = async (data: ClassFormData) => {
    setIsSubmitting(true);
    
    try {
      // Format validation rules
      const allowedLocations = data.allowedLocations
        .split(',')
        .map(location => location.trim())
        .filter(location => location.length > 0);
      
      const validationRules = {
        allowedStates: allowedLocations,
        ageRange: {
          min: parseInt(data.minAge.toString()),
          max: parseInt(data.maxAge.toString())
        },
        minimumQualification: data.minQualification
      };
      
      if (editingClass) {
        // Update existing class
        const { error } = await supabase
          .from('classes')
          .update({
            name: data.name,
            description: data.description,
            validation_rules: validationRules,
            template: data.template
          })
          .eq('code', editingClass);
        
        if (error) throw error;
        
        toast.success(`Class ${editingClass} updated successfully!`);
      } else {
        // Create new class
        if (data.code.length < 2 || data.code.length > 10) {
          throw new Error('Class code must be between 2 and 10 characters');
        }
        
        const { error } = await supabase
          .from('classes')
          .insert({
            code: data.code.toUpperCase(),
            name: data.name,
            description: data.description,
            validation_rules: validationRules,
            template: data.template
          });
        
        if (error) throw error;
        
        toast.success(`Class ${data.code.toUpperCase()} created successfully!`);
      }
      
      setOpenDialog(false);
      setEditingClass(null);
      reset();
      await refreshClasses();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (classCode: string) => {
    setEditingClass(classCode);
    setOpenDialog(true);
  };

  const handleDelete = async (classCode: string) => {
    if (!confirm(`Are you sure you want to delete class ${classCode}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('code', classCode);
      
      if (error) throw error;
      
      toast.success(`Class ${classCode} deleted successfully!`);
      await refreshClasses();
    } catch (error: any) {
      toast.error('Error deleting class: ' + error.message);
    }
  };

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Class Settings</h1>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="bg-islamic-primary hover:bg-islamic-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClass ? `Edit Class: ${editingClass}` : 'Add New Class'}</DialogTitle>
                <DialogDescription>
                  {editingClass
                    ? 'Update the class details and settings.'
                    : 'Create a new class with its validation rules and template.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="col-span-1">Class Code</Label>
                    <Input
                      id="code"
                      className="col-span-3"
                      {...register('code', { 
                        required: 'Class Code is required',
                        minLength: {
                          value: 2,
                          message: 'Class Code must be at least 2 characters'
                        },
                        maxLength: {
                          value: 10,
                          message: 'Class Code cannot exceed 10 characters'
                        }
                      })}
                      disabled={!!editingClass}
                    />
                    {errors.code && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.code.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="col-span-1">Class Name</Label>
                    <Input
                      id="name"
                      className="col-span-3"
                      {...register('name', { required: 'Class Name is required' })}
                    />
                    {errors.name && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.name.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="col-span-1 pt-2">Description</Label>
                    <Textarea
                      id="description"
                      className="col-span-3 min-h-[100px]"
                      {...register('description')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="template" className="col-span-1 pt-2">Application Template</Label>
                    <Textarea
                      id="template"
                      className="col-span-3 min-h-[200px] font-mono text-sm"
                      {...register('template')}
                      placeholder="Enter the application template format here..."
                    />
                    <div className="col-span-3 col-start-2 text-xs text-gray-500">
                      This template will be used for copying application forms and for validation.
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h3 className="font-medium mb-4">Validation Rules</h3>
                    
                    <div className="grid grid-cols-4 items-start gap-4 mb-4">
                      <Label htmlFor="allowedLocations" className="col-span-1 pt-2">Allowed Locations</Label>
                      <Textarea
                        id="allowedLocations"
                        className="col-span-3"
                        {...register('allowedLocations')}
                        placeholder="Tamil Nadu, Telangana, Andhra Pradesh"
                      />
                      <div className="col-span-3 col-start-2 text-xs text-gray-500">
                        Comma-separated list of allowed states or locations.
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ageRange" className="col-span-1">Age Range</Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <Input
                          id="minAge"
                          type="number"
                          className="w-20"
                          {...register('minAge', { 
                            required: true,
                            valueAsNumber: true,
                            min: { value: 15, message: 'Minimum age cannot be less than 15' }
                          })}
                        />
                        <span>to</span>
                        <Input
                          id="maxAge"
                          type="number"
                          className="w-20"
                          {...register('maxAge', { 
                            required: true,
                            valueAsNumber: true,
                            min: { value: 15, message: 'Maximum age cannot be less than 15' }
                          })}
                        />
                        <span>years</span>
                      </div>
                      {(errors.minAge || errors.maxAge) && (
                        <p className="text-red-500 text-xs col-span-3 col-start-2">
                          {errors.minAge?.message || errors.maxAge?.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                      <Label htmlFor="minQualification" className="col-span-1">Min. Qualification</Label>
                      <Input
                        id="minQualification"
                        className="col-span-3"
                        {...register('minQualification')}
                        placeholder="Graduate"
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenDialog(false);
                      setEditingClass(null);
                      reset();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-islamic-primary hover:bg-islamic-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (editingClass ? 'Update Class' : 'Add Class')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>
              Manage classes and their validation rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map(cls => (
                  <TableRow key={cls.code}>
                    <TableCell className="font-medium">{cls.code}</TableCell>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{cls.description}</TableCell>
                    <TableCell>{cls.template ? 'Available' : 'Not set'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(cls.code)}
                        className="mr-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cls.code)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {classes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No classes found. Add a new class to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ClassSettingsPage;
