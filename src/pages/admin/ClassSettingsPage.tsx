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
import { ClassRecord } from '@/types/supabase-types';

const classSchema = z.object({
  code: z.string().min(2).max(5).regex(/^[A-Z0-9]{2,5}$/, {
    message: "Code must be 2-5 uppercase letters/numbers"
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters"
  }),
  description: z.string().optional(),
  validationRules: z.object({
    ageRange: z.object({
      min: z.number().min(0).max(100),
      max: z.number().min(1).max(120)
    }),
    allowedStates: z.array(z.string()).min(1, {
      message: "At least one state must be selected"
    }),
    minimumQualification: z.string().optional()
  })
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassInfo {
  id?: string;
  code: string;
  name: string;
  description: string | null;
  validation_rules?: {
    ageRange: {
      min: number;
      max: number;
    };
    allowedStates: string[];
    minimumQualification: string;
  };
  created_at?: string;
  updated_at?: string;
}

const ClassSettingsPage: React.FC = () => {
  const { VALIDATION_RULES } = useApplications();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      validationRules: {
        ageRange: { ...VALIDATION_RULES.ageRange },
        allowedStates: [...VALIDATION_RULES.allowedStates],
        minimumQualification: VALIDATION_RULES.minimumQualification,
      }
    }
  });

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');

      if (error) throw error;
      
      const formattedClasses = data.map(cls => ({
        id: cls.id,
        code: cls.code,
        name: cls.name,
        description: cls.description,
        validation_rules: cls.validation_rules || {
          ageRange: { ...VALIDATION_RULES.ageRange },
          allowedStates: [...VALIDATION_RULES.allowedStates],
          minimumQualification: VALIDATION_RULES.minimumQualification,
        },
        created_at: cls.created_at,
        updated_at: cls.updated_at
      }));
      
      setClasses(formattedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClasses();
  }, []);
  
  const handleEditClass = (classInfo: ClassInfo) => {
    setEditingClass(classInfo);
    form.reset({
      code: classInfo.code,
      name: classInfo.name,
      description: classInfo.description || '',
      validationRules: classInfo.validation_rules || {
        ageRange: { ...VALIDATION_RULES.ageRange },
        allowedStates: [...VALIDATION_RULES.allowedStates],
        minimumQualification: VALIDATION_RULES.minimumQualification,
      }
    });
    setDialogOpen(true);
  };
  
  const handleAddNewClass = () => {
    setEditingClass(null);
    form.reset({
      code: '',
      name: '',
      description: '',
      validationRules: {
        ageRange: { ...VALIDATION_RULES.ageRange },
        allowedStates: [...VALIDATION_RULES.allowedStates],
        minimumQualification: VALIDATION_RULES.minimumQualification,
      }
    });
    setDialogOpen(true);
  };
  
  const onSubmit = async (values: ClassFormValues) => {
    setIsLoading(true);
    try {
      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update({
            name: values.name,
            description: values.description,
            validation_rules: values.validationRules,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingClass.id);
          
        if (error) throw error;
        toast.success(`Class ${values.name} updated successfully`);
      } else {
        const { data: existingClass } = await supabase
          .from('classes')
          .select('code')
          .eq('code', values.code)
          .single();
          
        if (existingClass) {
          form.setError('code', { 
            type: 'manual',
            message: 'This class code already exists' 
          });
          setIsLoading(false);
          return;
        }
        
        const { error } = await supabase
          .from('classes')
          .insert({
            code: values.code,
            name: values.name,
            description: values.description,
            validation_rules: values.validationRules
          });
          
        if (error) throw error;
        toast.success(`Class ${values.name} created successfully`);
      }
      
      fetchClasses();
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving class:', error);
      toast.error(`Failed to save class: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);
        
      if (error) throw error;
      
      fetchClasses();
      toast.success('Class deleted successfully');
    } catch (error: any) {
      console.error('Error deleting class:', error);
      toast.error(`Failed to delete class: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportClassTemplate = (classCode: string) => {
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
            disabled={isLoading}
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
            {isLoading ? (
              <div className="flex justify-center p-6">
                <p>Loading classes...</p>
              </div>
            ) : (
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
                    {classes.length > 0 ? (
                      classes.map(classInfo => (
                        <TableRow key={classInfo.id}>
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
                                disabled={isLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => handleExportClassTemplate(classInfo.code)}
                                disabled={isLoading}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteClass(classInfo.id || '')}
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
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No classes configured. Add your first class.
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
              <DialogTitle>
                {editingClass ? `Edit Class: ${editingClass.name}` : 'Add New Class'}
              </DialogTitle>
              <DialogDescription>
                Configure class details and validation rules
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., QRAN" 
                          maxLength={5}
                          disabled={!!editingClass}
                          onChange={e => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        A unique 2-5 character code for the class (uppercase letters and numbers only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Quran Studies" />
                      </FormControl>
                      <FormDescription>
                        The full name of the class
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          placeholder="Brief description of the class"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Validation Rules</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="validationRules.ageRange.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              min={0}
                              max={100}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="validationRules.ageRange.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              min={0}
                              max={120}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="validationRules.minimumQualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Qualification</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Graduate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="validationRules.allowedStates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allowed States</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {['Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Karnataka', 'Kerala', 'Delhi', 'Maharashtra', 'Gujarat'].map(state => (
                            <Button
                              key={state}
                              type="button"
                              variant={field.value.includes(state) ? "default" : "outline"}
                              onClick={() => {
                                const updatedStates = field.value.includes(state)
                                  ? field.value.filter(s => s !== state)
                                  : [...field.value, state];
                                field.onChange(updatedStates);
                              }}
                              className={field.value.includes(state) ? "bg-islamic-primary" : ""}
                            >
                              {state}
                            </Button>
                          ))}
                        </div>
                        <FormDescription>
                          Select states where students can apply from
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-islamic-primary hover:bg-islamic-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (editingClass ? 'Save Changes' : 'Create Class')}
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

export default ClassSettingsPage;
