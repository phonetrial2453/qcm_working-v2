import { useState, useEffect } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { Application } from '@/types/application';

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
  const { applications } = useApplications();
  
  const checkForDuplicates = (email?: string, mobile?: string): DuplicateMatch[] => {
    if (!email && !mobile) return [];
    
    const duplicates: DuplicateMatch[] = [];
    
    for (const app of applications) {
      let isDuplicate = false;
      
      // Check email match
      if (email && app.otherDetails?.email) {
        if (app.otherDetails.email.toLowerCase() === email.toLowerCase()) {
          isDuplicate = true;
        }
      }
      
      // Check mobile match
      if (mobile && app.studentDetails?.mobile) {
        const normalizedMobile1 = mobile.replace(/\D/g, ''); // Remove non-digits
        const normalizedMobile2 = app.studentDetails.mobile.replace(/\D/g, '');
        
        // Check if the last 10 digits match (handles country codes)
        if (normalizedMobile1.slice(-10) === normalizedMobile2.slice(-10)) {
          isDuplicate = true;
        }
      }
      
      if (isDuplicate) {
        duplicates.push({
          applicationId: app.id,
          studentName: app.studentDetails?.fullName || 'Unknown',
          email: app.otherDetails?.email,
          mobile: app.studentDetails?.mobile,
          classCode: app.classCode,
          status: app.status,
          createdAt: app.createdAt
        });
      }
    }
    
    return duplicates;
  };
  
  return { checkForDuplicates };
};