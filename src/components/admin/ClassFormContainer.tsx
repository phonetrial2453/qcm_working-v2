
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ClassFormValues } from '@/hooks/useClassForm';
import ClassBasicInfoForm from './ClassBasicInfoForm';
import ClassAgeValidationForm from './ClassAgeValidationForm';
import ClassLocationQualificationForm from './ClassLocationQualificationForm';
import ClassTemplateForm from './ClassTemplateForm';

interface ClassFormContainerProps {
  form: UseFormReturn<ClassFormValues>;
  isEditing: boolean;
  onSubmit: (values: ClassFormValues) => void;
}

const ClassFormContainer: React.FC<ClassFormContainerProps> = ({ 
  form, 
  isEditing, 
  onSubmit 
}) => {
  const navigate = useNavigate();
  
  return (
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
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <ClassBasicInfoForm form={form} isEditing={isEditing} />
          </div>
          
          {/* Age Validation Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Age Requirements</h2>
            <ClassAgeValidationForm form={form} />
          </div>
          
          {/* Location and Qualification Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Location & Qualification</h2>
            <ClassLocationQualificationForm form={form} />
          </div>
          
          {/* Template Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Form Template</h2>
            <ClassTemplateForm form={form} />
          </div>

          <Button type="submit">
            {isEditing ? 'Update Class' : 'Create Class'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ClassFormContainer;
