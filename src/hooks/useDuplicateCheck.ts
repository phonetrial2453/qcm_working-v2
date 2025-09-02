import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DuplicateMatch } from '@/utils/multiApplicationParser';

export const useDuplicateCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkForDuplicates = async (mobile: string, email?: string): Promise<DuplicateMatch[]> => {
    setIsChecking(true);
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('id, student_details, other_details')
        .or(`student_details->>mobile.eq.${mobile}${email ? `,other_details->>email.eq.${email}` : ''}`);

      if (error) {
        console.error('Error checking duplicates:', error);
        return [];
      }

      if (!applications || applications.length === 0) {
        return [];
      }

      return applications.map(app => ({
        id: app.id,
        name: (app.student_details as any)?.fullName || 'Unknown',
        mobile: (app.student_details as any)?.mobile || mobile,
      }));
    } catch (error) {
      console.error('Error in duplicate check:', error);
      return [];
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkForDuplicates,
    isChecking,
  };
};