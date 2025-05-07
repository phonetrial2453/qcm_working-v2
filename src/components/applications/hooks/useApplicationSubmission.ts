
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { ValidationError } from '@/types/application';
import { generateSimpleApplicationId } from '@/utils/applicationIdGenerator';

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

    // Don't proceed if already submitting
    if (isSubmitting) {
      return;
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
      };

      // Add detailed remarks about warnings if any exist
      if (warnings.length > 0) {
        const warningDetails = warnings.map(w => `- ${w.field}: ${w.message}`).join('\n');
        applicationData.remarks = parsedData.remarks 
          ? `${parsedData.remarks}\n\n---\nValidation Warnings:\n${warningDetails}`
          : `Application submitted with validation warnings:\n${warningDetails}`;
      }

      console.log("Submitting application data:", applicationData);
      
      const result = await createApplication(applicationData);
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
      toast.error('Failed to submit application');
      setIsSubmitting(false);
      return false;
    }
  };

  return { handleSubmit, isSubmitting };
};
