import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { transformApplicationData } from '@/contexts/application/utils';

export interface DuplicateMatch {
  applicationId: string;
  studentName: string;
  email?: string;
  mobile?: string;
  classCode: string;
  status: string;
  createdAt: string;
}

export const useDuplicateCheck = () => {
  const checkForDuplicates = async (email?: string, mobile?: string): Promise<DuplicateMatch[]> => {
    if (!email && !mobile) return [];
    
    try {
      // Query the database for potential duplicates
      let query = supabase
        .from('applications')
        .select('*');
      
      // Build OR condition for email and mobile
      const conditions: string[] = [];
      
      if (email) {
        conditions.push(`other_details->>'email' ilike '${email}'`);
      }
      
      if (mobile) {
        const normalizedMobile = mobile.replace(/\D/g, ''); // Remove non-digits
        // Check for mobile numbers with last 10 digits matching
        conditions.push(`student_details->>'mobile' like '%${normalizedMobile.slice(-10)}'`);
      }
      
      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }
      
      const { data: applications, error } = await query;
      
      if (error) {
        console.error('Error checking for duplicates:', error);
        return [];
      }
      
      const duplicates: DuplicateMatch[] = [];
      
      for (const app of applications || []) {
        const transformedApp = transformApplicationData(app);
        let isDuplicate = false;
        
        // Check email match
        if (email && transformedApp.otherDetails?.email) {
          if (transformedApp.otherDetails.email.toLowerCase() === email.toLowerCase()) {
            isDuplicate = true;
          }
        }
        
        // Check mobile match
        if (mobile && transformedApp.studentDetails?.mobile) {
          const normalizedMobile1 = mobile.replace(/\D/g, '');
          const normalizedMobile2 = transformedApp.studentDetails.mobile.replace(/\D/g, '');
          
          // Check if the last 10 digits match (handles country codes)
          if (normalizedMobile1.slice(-10) === normalizedMobile2.slice(-10)) {
            isDuplicate = true;
          }
        }
        
        if (isDuplicate) {
          duplicates.push({
            applicationId: transformedApp.id,
            studentName: transformedApp.studentDetails?.fullName || 'Unknown',
            email: transformedApp.otherDetails?.email,
            mobile: transformedApp.studentDetails?.mobile,
            classCode: transformedApp.classCode,
            status: transformedApp.status,
            createdAt: transformedApp.createdAt
          });
        }
      }
      
      return duplicates;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  };
  
  return { checkForDuplicates };
};