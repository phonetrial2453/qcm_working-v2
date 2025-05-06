
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ClassFormValues } from '@/hooks/useClassForm';

interface ClassBasicInfoFormProps {
  form: UseFormReturn<ClassFormValues>;
  isEditing: boolean;
}

const ClassBasicInfoForm: React.FC<ClassBasicInfoFormProps> = ({ form, isEditing }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Class Code</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., QRAN101" 
                {...field}
                disabled={isEditing}
              />
            </FormControl>
            <FormDescription>
              This is the unique code for the class.
              {isEditing && " The code cannot be changed once created."}
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
    </>
  );
};

export default ClassBasicInfoForm;
