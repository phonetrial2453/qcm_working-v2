
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ClassFormValues } from '@/hooks/useClassForm';

interface ClassTemplateFormProps {
  form: UseFormReturn<ClassFormValues>;
}

const ClassTemplateForm: React.FC<ClassTemplateFormProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="template"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Application Form Template</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Paste the JSON template here"
              className="resize-y min-h-[200px] font-mono"
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
  );
};

export default ClassTemplateForm;
