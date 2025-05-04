
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { ValidationError } from '@/types/application';

export const useApplicationSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createApplication } = useApplications();
  const navigate = useNavigate();

  const handleSubmit = async ({
    parsedData,
    selectedClassCode,
    warnings,
  }: {
    parsedData: any;
    selectedClassCode: string;
    warnings: ValidationError[];
  }) => {
    if (!selectedClassCode) {
      toast.error('Please select a class');
      return;
    }

    if (!parsedData) {
      toast.error('Invalid application data');
      return;
    }

    setIsSubmitting(true);

    try {
      // Add class code to parsed data
      const applicationData = {
        ...parsedData,
        classCode: selectedClassCode,
        validationWarnings: warnings.length > 0 ? warnings : undefined,
        remarks: warnings.length > 0 ? 
          `Application submitted with ${warnings.length} validation warning(s):\n${warnings.map(w => `- ${w.field}: ${w.message}`).join('\n')}` :
          parsedData.remarks || ''
      };

      const applicationId = await createApplication(applicationData);

      if (applicationId) {
        const warningsMessage = warnings.length > 0 
          ? `Application submitted with ${warnings.length} validation warning(s)`
          : 'Application submitted successfully!';
        
        toast.success(warningsMessage);
        navigate(`/applications/${applicationId}`);
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
