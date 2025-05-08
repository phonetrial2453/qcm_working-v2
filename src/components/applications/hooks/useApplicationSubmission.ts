
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { ValidationError } from '@/types/application';
import { generateSimpleApplicationId } from '@/utils/applicationIdGenerator';
import { useAuth } from '@/contexts/AuthContext';

export const useApplicationSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createApplication } = useApplications();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      return false;
    }

    if (!parsedData) {
      toast.error('Invalid application data');
      return false;
    }

    // Don't proceed if already submitting
    if (isSubmitting) {
      return false;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting application submission process");
      
      // Generate a unique ID for the application
      const applicationId = generateSimpleApplicationId(selectedClassCode, 0);
      
      // Add class code and detailed validation warnings to parsed data
      const applicationData = {
        ...parsedData,
        id: applicationId,
        classCode: selectedClassCode,
        validationWarnings: warnings.length > 0 ? warnings : undefined,
        status: 'pending',
      };

      console.log("Application data being submitted:", JSON.stringify(applicationData, null, 2));
      
      // Create application with explicit user ID parameter
      const result = await createApplication(applicationData, user?.id);
      console.log("Submission result:", result);

      if (result) {
        let message = 'Application submitted successfully!';
        
        if (warnings.length > 0) {
          message = `Application submitted with ${warnings.length} validation warning(s)`;
        }
        
        // Clear saved form data from localStorage
        localStorage.removeItem('application_form_data');
        
        toast.success(message);
        
        // Reset submission state before navigating
        setIsSubmitting(false);
        
        // Navigate to the application detail page
        navigate(`/applications/${applicationId}`);
        return true;
      } else {
        // Handle failed submission
        toast.error('Failed to submit application');
        setIsSubmitting(false);
        return false;
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error(`Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSubmitting(false);
      return false;
    }
  };

  return { handleSubmit, isSubmitting };
};
