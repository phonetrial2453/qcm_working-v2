// src/pages/admin/ClassSettingsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useApplications } from '@/contexts/ApplicationContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Define the form schema using Zod
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
  const { classes, refreshClasses } = useApplications();

  // Initialize the form
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

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Check if the class code already exists
      const existingClass = classes.find((cls) => cls.code === values.code);
      if (existingClass) {
        toast.error('Class code already exists. Please use a different code.');
        return;
      }

      // Simulate saving to a database
      console.log('Saving class settings:', values);
      // In a real application, you would save the values to a database here

      // Show a success message
      toast.success('Class settings saved successfully!');

      // Refresh classes
      await refreshClasses();

      // Redirect to the classes list page
      navigate('/admin/classes');
    } catch (error) {
      console.error('Error saving class settings:', error);
      toast.error('Failed to save class settings. Please try again.');
    }
  };

  // Add the missing code for the form's allowedStates field
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
          Create New Class
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
                      placeholder="e.g., An introductory class to Quranic studies."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the class.
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

            {/* In the form fields section, update the allowedStates field */}
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
