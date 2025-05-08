
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ValidationResult } from "@/types/application";

export const useApplicationValidation = (
  selectedClassCode: string,
  classes: any[]
) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: false, warnings: [] });

  const validateApplication = useCallback(async (data: any) => {
    const warnings: { field: string; message: string }[] = [];

    const requiredFields = [
      { path: 'studentDetails.fullName', label: 'Student Name' },
      { path: 'studentDetails.mobile', label: 'Mobile Number' },
      { path: 'otherDetails.email', label: 'Email Address' },
    ];

    requiredFields.forEach(field => {
      const value = getNestedValue(data, field.path);
      if (!value) {
        warnings.push({ field: field.label, message: `${field.label} is required` });
      }
    });

    if (selectedClassCode) {
      const selectedClass = classes.find(c => c.code === selectedClassCode);

      if (selectedClass?.validationRules) {
        if (selectedClass.validationRules.ageRange && data.otherDetails?.age) {
          const age = parseInt(data.otherDetails.age);
          const minAge = selectedClass.validationRules.ageRange.min;
          const maxAge = selectedClass.validationRules.ageRange.max;

          if (minAge && age < minAge) {
            warnings.push({
              field: 'Age',
              message: `Age must be at least ${minAge} years`
            });
          }

          if (maxAge && age > maxAge) {
            warnings.push({
              field: 'Age',
              message: `Age must not exceed ${maxAge} years`
            });
          }
        }

        if (selectedClass.validationRules.allowedStates &&
          selectedClass.validationRules.allowedStates.length > 0 &&
          data.currentResidence?.state) {
          const state = data.currentResidence.state.toLowerCase();
          const allowedStates = selectedClass.validationRules.allowedStates.map((s: string) => s.toLowerCase());

          if (!allowedStates.some(s => state.includes(s))) {
            warnings.push({
              field: 'Current State',
              message: `State must be one of: ${selectedClass.validationRules.allowedStates.join(', ')}`
            });
          }
        }

        if (selectedClass.validationRules.minimumQualification && data.otherDetails?.qualification) {
          const qualification = data.otherDetails.qualification.toLowerCase();
          const minQualification = selectedClass.validationRules.minimumQualification.toLowerCase();

          if (!qualification.includes(minQualification)) {
            warnings.push({
              field: 'Qualification',
              message: `Qualification must be at least ${selectedClass.validationRules.minimumQualification}`
            });
          }
        }
      }

      // Check for duplicate applications - handle network errors gracefully
      if (data.studentDetails?.fullName && data.studentDetails?.mobile) {
        try {
          const { data: existingApps, error } = await supabase
            .from('applications')
            .select('id, student_details')
            .eq('class_code', selectedClassCode)
            .not('status', 'eq', 'rejected');

          if (error) {
            console.error('Error checking for duplicates:', error);
            // Don't block validation if we can't check for duplicates
            warnings.push({
              field: 'Validation Warning',
              message: 'Could not check for duplicate applications'
            });
          } else if (existingApps) {
            const duplicates = existingApps.filter((app: any) => {
              const studentDetails = app.student_details as any;
              return (
                studentDetails?.fullName?.toLowerCase() === data.studentDetails.fullName.toLowerCase() &&
                studentDetails?.mobile === data.studentDetails.mobile
              );
            });

            if (duplicates.length > 0) {
              warnings.push({
                field: 'Duplicate Application',
                message: 'An application with this name and mobile number already exists'
              });
            }
          }
        } catch (error) {
          console.error('Error checking for duplicates:', error);
          // Add a warning but don't block submission
          warnings.push({
            field: 'Validation Warning', 
            message: 'Could not check for duplicate applications due to network error'
          });
        }
      }
    }

    setValidationResult({
      valid: warnings.length === 0,
      warnings
    });
  }, [selectedClassCode, classes]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  return { validationResult, validateApplication, setValidationResult };
};
