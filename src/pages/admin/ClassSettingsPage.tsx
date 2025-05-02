
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApplications } from '@/contexts/ApplicationContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  code: z.string().min(4, {
    message: 'Class code must be at least 4 characters.',
  }),
  name: z.string().min(2, {
    message: 'Class name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  validationRules: z.object({
    ageRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    allowedStates: z.array(z.string()).optional(),
    minimumQualification: z.string().optional(),
  }).optional(),
  template: z.string().optional(),
});

const ClassSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { classCode } = useParams();
  const { classes, refreshClasses } = useApplications();
  const isEditing = Boolean(classCode);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      validationRules: {
        ageRange: { min: undefined, max: undefined },
        allowedStates: [],
        minimumQualification: '',
      },
      template: '',
    },
  });

  useEffect(() => {
    if (isEditing && classCode) {
      const classData = classes.find(c => c.code === classCode);
      if (classData) {
        form.reset({
          code: classData.code,
          name: classData.name,
          description: classData.description || '',
          validationRules: classData.validationRules || {
            ageRange: { min: undefined, max: undefined },
            allowedStates: [],
            minimumQualification: '',
          },
          template: classData.template || '',
        });
      }
    }
  }, [isEditing, classCode, classes, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!isEditing) {
        const existingClass = classes.find((cls) => cls.code === values.code);
        if (existingClass) {
          toast.error('Class code already exists. Please use a different code.');
          return;
        }
      }

      const { error } = await supabase
        .from('classes')
        .upsert([
          {
            code: values.code,
            name: values.name,
            description: values.description,
            validation_rules: values.validationRules,
            template: values.template,
          },
        ], { onConflict: 'code' }); // Fix: Added onConflict option

      if (error) throw error;

      toast.success(`Class ${isEditing ? 'updated' : 'created'} successfully!`);
      await refreshClasses();
      navigate('/admin/classes');
    } catch (error: any) {
      console.error('Error saving class settings:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} class. Please try again.`);
    }
  };

  const validationObj = form.watch("validationRules") || {};
  const allowedStates = Array.isArray(validationObj.allowedStates) ? validationObj.allowedStates.join(", ") : "";

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          className="w-fit p-0 h-auto mb-4"
          onClick={() => navigate('/admin/classes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>

        <h1 className="text-3xl font-bold text-islamic-primary mb-6">
          {isEditing ? 'Edit Class' : 'Create New Class'}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., QRAN101" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the unique code for the class.
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
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quran Class 101" {...field} />
                  </FormControl>
                  <FormDescription>This is the display name for the class.</FormDescription>
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
                      placeholder="e.g., An introductory class to Quranic studies. Use multiple lines for better formatting."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A detailed description of the class. You can use multiple lines to better format the content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validationRules.ageRange.min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 13"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        form.setValue("validationRules.ageRange.min", value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The minimum age allowed for this class. Leave blank for no
                    restriction.
                  </FormDescription>
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
                      placeholder="e.g., 19"
                      {...field}
                       onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        form.setValue("validationRules.ageRange.max", value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The maximum age allowed for this class. Leave blank for no
                    restriction.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validationRules.allowedStates"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Allowed Locations</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Telangana, Andhra Pradesh"
                      value={allowedStates}
                      onChange={(e) => {
                        const values = e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter((item) => item.length > 0);
                        form.setValue("validationRules.allowedStates", values);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter comma-separated locations where this class is available
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validationRules.minimumQualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Qualification</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10th grade" {...field} />
                  </FormControl>
                  <FormDescription>
                    The minimum qualification required for this class.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Form Template</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the JSON template here"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A JSON template for the application form.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="bg-islamic-primary hover:bg-islamic-primary/90">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
};

export default ClassSettingsPage;
