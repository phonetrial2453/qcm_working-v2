
import React from 'react';
import { useParams } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import AppLayout from '@/components/layout/AppLayout';
import { useClassForm } from '@/hooks/useClassForm';
import ClassFormLoader from '@/components/admin/ClassFormLoader';
import ClassFormContainer from '@/components/admin/ClassFormContainer';

const ClassSettingsPage: React.FC = () => {
  const { classCode } = useParams<{ classCode: string }>();
  const { classes, refreshClasses } = useApplications();
  
  // Use our custom hook to handle form logic
  const { form, loading, isEditing, onSubmit } = useClassForm(classCode, classes);
  
  // Handle form submission with class refreshing
  const handleSubmit = (values: any) => {
    return onSubmit(values, refreshClasses);
  };

  if (loading) {
    return (
      <AppLayout>
        <ClassFormLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ClassFormContainer 
        form={form} 
        isEditing={isEditing} 
        onSubmit={handleSubmit} 
      />
    </AppLayout>
  );
};

export default ClassSettingsPage;
