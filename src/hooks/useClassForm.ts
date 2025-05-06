
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Class, ValidationRules } from '@/types/supabase-types';
import { toast } from 'sonner';

// Define the form schema
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

export type ClassFormValues = z.infer<typeof formSchema>;

export const useClassForm = (classCode?: string, classes: Class[] = []) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isEditing = Boolean(classCode);

  // Initialize form with default values
  const form = useForm<ClassFormValues>({
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

  // Function to safely convert Json to ValidationRules
  const safelyParseValidationRules = (rules: Json | null): ValidationRules => {
    if (!rules) {
      return {
        ageRange: { min: undefined, max: undefined },
        allowedStates: [],
        minimumQualification: ''
      };
    }
    
    // Ensure we have an object
    if (typeof rules !== 'object' || rules === null) {
      return {
        ageRange: { min: undefined, max: undefined },
        allowedStates: [],
        minimumQualification: ''
      };
    }
    
    // Cast to any first to help with type checking
    const rulesObj = rules as any;
    
    return {
      ageRange: {
        min: typeof rulesObj.ageRange?.min === 'number' ? rulesObj.ageRange.min : undefined,
        max: typeof rulesObj.ageRange?.max === 'number' ? rulesObj.ageRange.max : undefined
      },
      allowedStates: Array.isArray(rulesObj.allowedStates) ? rulesObj.allowedStates : [],
      minimumQualification: typeof rulesObj.minimumQualification === 'string' ? rulesObj.minimumQualification : ''
    };
  };

  // Load class data if in edit mode
  useEffect(() => {
    const fetchClass = async () => {
      setLoading(true);
      if (isEditing && classCode) {
        // First check in the context
        let classData = classes.find(c => c.code === classCode);
        
        // If not found in context, try to fetch directly from database
        if (!classData) {
          const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('code', classCode)
            .single();
            
          if (error) {
            console.error('Error fetching class:', error);
            toast.error('Failed to load class data');
            navigate('/admin/classes');
            return;
          }
          
          if (data) {
            // Map database fields to our expected format with proper type handling
            classData = {
              id: data.id,
              code: data.code,
              name: data.name,
              description: data.description || '',
              validationRules: safelyParseValidationRules(data.validation_rules),
              template: data.template || '',
              created_at: data.created_at,
              updated_at: data.updated_at
            };
          } else {
            toast.error('Class not found');
            navigate('/admin/classes');
            return;
          }
        }
        
        // Once we have the class data, update the form
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
      setLoading(false);
    };

    fetchClass();
  }, [isEditing, classCode, classes, form, navigate]);

  // Form submission handler
  const onSubmit = async (values: ClassFormValues, refreshClasses: () => Promise<void>) => {
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
        ], { onConflict: 'code' });

      if (error) throw error;

      toast.success(`Class ${isEditing ? 'updated' : 'created'} successfully!`);
      await refreshClasses();
      navigate('/admin/classes');
    } catch (error: any) {
      console.error('Error saving class settings:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} class. Please try again.`);
    }
  };

  return {
    form,
    loading,
    isEditing,
    onSubmit
  };
};
