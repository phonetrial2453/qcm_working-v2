
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateSimpleApplicationId } from "@/utils/applicationIdGenerator";
import { useApplications } from "@/contexts/ApplicationContext";

interface SubmissionOptions {
  parsedData: any;
  selectedClassCode: string;
  warningsCount: number;
}

export function useApplicationSubmission() {
  const { createApplication } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ({ parsedData, selectedClassCode, warningsCount }: SubmissionOptions) => {
    if (!parsedData || !selectedClassCode) {
      toast.error('Please select a class and enter valid application data');
      return;
    }

    setIsSubmitting(true);

    try {
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('class_code', selectedClassCode);

      const currentCount = count || 0;
      const applicationId = generateSimpleApplicationId(selectedClassCode, currentCount);

      const applicationData = {
        id: applicationId,
        classCode: selectedClassCode,
        status: 'pending',
        studentDetails: parsedData.studentDetails || {},
        otherDetails: parsedData.otherDetails || {},
        hometownDetails: parsedData.hometownDetails || {},
        currentResidence: parsedData.currentResidence || {},
        referredBy: parsedData.referredBy || {},
        remarks: `Auto-created application with ${warningsCount} validation warnings`,
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
