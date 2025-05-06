
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClassFormValues } from '@/hooks/useClassForm';

interface ClassLocationQualificationFormProps {
  form: UseFormReturn<ClassFormValues>;
}

const ClassLocationQualificationForm: React.FC<ClassLocationQualificationFormProps> = ({ form }) => {
  // Get the allowedStates array from form
  const validationObj = form.watch("validationRules") || {};
  const allowedStates = Array.isArray(validationObj.allowedStates) 
    ? validationObj.allowedStates.join(", ") 
    : "";

  return (
    <>
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
    </>
  );
};

export default ClassLocationQualificationForm;
