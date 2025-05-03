
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateSimpleApplicationId } from "@/utils/applicationIdGenerator";
import { useApplications } from "@/contexts/ApplicationContext";
import { useAuth } from "@/contexts/AuthContext";

interface SubmissionOptions {
  parsedData: any;
  selectedClassCode: string;
  warnings: Array<{ field: string; message: string }>;
}

export function useApplicationSubmission() {
  const { createApplication } = useApplications();
  const { user, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ({ parsedData, selectedClassCode, warnings }: SubmissionOptions) => {
    if (!parsedData || !selectedClassCode) {
      toast.error('Please select a class and enter valid application data');
      return;
    }

    // Check if user has access to this class
    if (!isAdmin && user?.classes) {
      const hasAccess = user.classes.includes(selectedClassCode);
      if (!hasAccess) {
        toast.error('You do not have permission to submit applications for this class');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('class_code', selectedClassCode);

      const currentCount = count || 0;
      const applicationId = generateSimpleApplicationId(selectedClassCode, currentCount);

      // Format validation warnings for storage
      const warningMessages = warnings.map(w => `${w.field}: ${w.message}`).join('; ');
      
      const applicationData = {
        id: applicationId,
        classCode: selectedClassCode,
        status: 'pending',
        studentDetails: parsedData.studentDetails || {},
        otherDetails: parsedData.otherDetails || {},
        hometownDetails: parsedData.hometownDetails || {},
        currentResidence: parsedData.currentResidence || {},
        referredBy: parsedData.referredBy || {},
        remarks: warnings.length > 0 ? 
          `Application has validation issues: ${warningMessages}` : 
          'Application submitted with no validation warnings',
      };

      const result = await createApplication(applicationData);

      if (result) {
        toast.success(`Application submitted successfully. ID: ${applicationId}`);
        navigate('/applications');
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred while submitting the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
