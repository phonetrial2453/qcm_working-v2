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
  const checkForDuplicates = async (fullName?: string, mobile?: string, email?: string): Promise<DuplicateMatch[]> => {
    if (!fullName && !mobile && !email) return [];
    
    try {
      // Query the database for potential duplicates
      let query = supabase
        .from('applications')
        .select('*');
      
      // Build OR condition for name, mobile, and email
      const conditions: string[] = [];
      
      if (fullName) {
        conditions.push(`student_details->>'fullName'.ilike.%${fullName.trim()}%`);
      }
      
      if (email) {
        conditions.push(`other_details->>'email'.ilike.${email}`);
      }
      
      if (mobile) {
        const normalizedMobile = mobile.replace(/\D/g, ''); // Remove non-digits
        // Check for mobile numbers with last 8 digits matching
        const lastDigits = normalizedMobile.slice(-8);
        if (lastDigits.length >= 8) {
          conditions.push(`student_details->>'mobile'.like.%${lastDigits}`);
        }
      }
      
      if (conditions.length > 0) {
        // Use proper PostgREST OR syntax
        const orCondition = conditions.join(',');
        query = query.or(orCondition);
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
        
        // Check name match
        if (fullName && transformedApp.studentDetails?.fullName) {
          const name1 = fullName.toLowerCase().trim();
          const name2 = transformedApp.studentDetails.fullName.toLowerCase().trim();
          if (name1.includes(name2) || name2.includes(name1) || name1 === name2) {
            isDuplicate = true;
          }
        }
        
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