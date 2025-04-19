import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { ValidationRules } from '@/types/supabase-types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Class name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  minAge: z.number().optional().nullable().transform(val => val === null ? undefined : val),
  maxAge: z.number().optional().nullable().transform(val => val === null ? undefined : val),
  allowedStates: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()) : []),
  minimumQualification: z.string().optional(),
  template: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ClassSettingsPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const { classes, refreshClasses } = useApplications();
  const { user } = useAuth();
  const router = useRouter();

  const accessibleClasses = user?.role === 'admin'
    ? classes
    : classes.filter(cls => user?.classes?.includes(cls.code));

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      minAge: undefined,
      maxAge: undefined,
      allowedStates: [],
      minimumQualification: '',
      template: '',
    },
  });

  useEffect(() => {
    if (selectedClass) {
      const classDetails = classes.find(cls => cls.code === selectedClass);
      if (classDetails) {
        form.reset({
          name: classDetails.name,
          description: classDetails.description || '',
          minAge: classDetails.validationRules?.ageRange?.min,
          maxAge: classDetails.validationRules?.ageRange?.max,
          allowedStates: classDetails.validationRules?.allowedStates?.join(', ') || '',
          minimumQualification: classDetails.validationRules?.minimumQualification || '',
          template: classDetails.template || '',
        });
      }
    }
  }, [selectedClass, classes, form]);

  // Fix the variable name to match the Class type property name
  const handleSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const validationRules: ValidationRules = {
        ageRange: {
          min: data.minAge,
          max: data.maxAge
        },
        allowedStates: data.allowedStates,
        minimumQualification: data.minimumQualification
      };
      
      const { error } = await supabase
        .from('classes')
        .update({
          name: data.name,
          description: data.description,
          validation_rules: validationRules,
          template: data.template
        })
        .eq('code', selectedClass);
      
      if (error) throw error;
      
      toast.success('Class settings updated successfully');
      await refreshClasses();
      router.push('/admin/classes');
    } catch (error: any) {
      toast.error('Failed to update class: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout requireAuth={true} requiredRole="admin">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Class Settings</h1>
          <p className="text-muted-foreground">Manage class details and validation rules</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Class</CardTitle>
            <CardDescription>
              Modify the settings for the selected class.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class">Select Class</Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class to edit" />
                </SelectTrigger>
                <SelectContent>
                  {accessibleClasses.map(cls => (
                    <SelectItem key={cls.code} value={cls.code}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass && (
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input id="name" placeholder="Class Name" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Description" {...form.register('description')} />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAge">Minimum Age</Label>
                    <Input
                      id="minAge"
                      type="number"
                      placeholder="Minimum Age"
                      {...form.register('minAge', { valueAsNumber: true })}
                    />
                    {form.formState.errors.minAge && (
                      <p className="text-sm text-red-500">{form.formState.errors.minAge.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAge">Maximum Age</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      placeholder="Maximum Age"
                      {...form.register('maxAge', { valueAsNumber: true })}
                    />
                    {form.formState.errors.maxAge && (
                      <p className="text-sm text-red-500">{form.formState.errors.maxAge.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedStates">Allowed States (comma-separated)</Label>
                  <Input id="allowedStates" placeholder="e.g., NY, CA, TX" {...form.register('allowedStates')} />
                  {form.formState.errors.allowedStates && (
                    <p className="text-sm text-red-500">{form.formState.errors.allowedStates.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumQualification">Minimum Qualification</Label>
                  <Select {...form.register('minimumQualification')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelors">Bachelors</SelectItem>
                      <SelectItem value="masters">Masters</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.minimumQualification && (
                    <p className="text-sm text-red-500">{form.formState.errors.minimumQualification.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Textarea id="template" placeholder="Template" {...form.register('template')} />
                  {form.formState.errors.template && (
                    <p className="text-sm text-red-500">{form.formState.errors.template.message}</p>
                  )}
                </div>

                <Button disabled={isSubmitting} className="bg-islamic-primary hover:bg-islamic-primary/90" type="submit">
                  {isSubmitting ? 'Updating...' : 'Update Class'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ClassSettingsPage;
