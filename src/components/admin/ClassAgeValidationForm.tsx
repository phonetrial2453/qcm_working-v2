
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClassFormValues } from '@/hooks/useClassForm';

interface ClassAgeValidationFormProps {
  form: UseFormReturn<ClassFormValues>;
}

const ClassAgeValidationForm: React.FC<ClassAgeValidationFormProps> = ({ form }) => {
  return (
    <>
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
                value={field.value === undefined ? '' : field.value}
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
                value={field.value === undefined ? '' : field.value}
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
    </>
  );
};

export default ClassAgeValidationForm;
