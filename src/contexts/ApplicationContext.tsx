import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Json } from '@/integrations/supabase/types';
import { ClassRecord, ValidationRules } from '@/types/supabase-types';

// Define application structure
export interface StudentApplication {
  id: string;
  classCode: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  studentDetails: {
    fullName: string;
    mobile: string;
    whatsapp: string;
  };
  hometownDetails: {
    area: string;
    city: string;
    district: string;
    state: string;
  };
  currentResidence: {
    area: string;
    mandal: string;
    city: string;
    state: string;
  };
  otherDetails: {
    age: number;
    qualification: string;
    profession: string;
    email: string;
  };
  referredBy: {
    fullName: string;
    mobile: string;
    studentId: string;
    batch: string;
  };
  callResponse?: string;
  studentNature?: string;
  studentCategory?: string;
  followUpBy?: string;
  naqeeb?: string;
  naqeebResponse?: string;
}

// Define classes
export interface ClassInfo extends ClassRecord {
  description: string;
}

// Define validation rules
export const VALIDATION_RULES = {
  allowedStates: ['Tamil Nadu', 'Telangana', 'Andhra Pradesh'],
  allowedCities: ['Hyderabad', 'Chennai', 'Mahboobnagar', 'Visakhapatnam', 'Vijayawada'],
  ageRange: { min: 25, max: 45 },
  minimumQualification: 'Graduate',
};

interface ApplicationContextType {
  applications: StudentApplication[];
  classes: ClassInfo[];
  VALIDATION_RULES: typeof VALIDATION_RULES;
  addApplication: (application: Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateApplication: (id: string, updates: Partial<StudentApplication>) => Promise<boolean>;
  getApplication: (id: string) => StudentApplication | undefined;
  getApplicationsByClass: (classCode: string) => StudentApplication[];
  validateApplication: (application: Partial<StudentApplication>) => { valid: boolean; errors: string[] };
  deleteApplication: (id: string) => Promise<boolean>;
  generateApplicationId: (classCode: string) => string;
  refreshClasses: () => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Helper function to safely parse JSON or return a default value
const safeParseJson = <T extends object>(jsonValue: Json | null, defaultValue: T): T => {
  if (!jsonValue) return defaultValue;
  
  if (typeof jsonValue === 'object') {
    return jsonValue as unknown as T;
  }
  
  try {
    if (typeof jsonValue === 'string') {
      return JSON.parse(jsonValue) as T;
    }
    return defaultValue;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
};

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchClasses();
    } else {
      // Even for non-authenticated users, fetch classes
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      
      if (data) {
        const formattedClasses: ClassInfo[] = data.map(cls => ({
          ...cls,
          description: cls.description || '',
        }));
        
        setClasses(formattedClasses);
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes: ' + error.message);
    }
  };

  const refreshClasses = async () => {
    return fetchClasses();
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');
      
      if (error) throw error;
      
      const mappedApplications: StudentApplication[] = data.map(app => {
        // Define default values for complex objects
        const defaultStudentDetails = { fullName: '', mobile: '', whatsapp: '' };
        const defaultHometownDetails = { area: '', city: '', district: '', state: '' };
        const defaultCurrentResidence = { area: '', mandal: '', city: '', state: '' };
        const defaultOtherDetails = { age: 0, qualification: '', profession: '', email: '' };
        const defaultReferredBy = { fullName: '', mobile: '', studentId: '', batch: '' };
        
        return {
          id: app.id,
          classCode: app.class_code,
          status: app.status as 'pending' | 'approved' | 'rejected',
          remarks: app.remarks || undefined,
          createdAt: app.created_at,
          updatedAt: app.updated_at,
          studentDetails: safeParseJson(app.student_details, defaultStudentDetails),
          hometownDetails: safeParseJson(app.hometown_details, defaultHometownDetails),
          currentResidence: safeParseJson(app.current_residence, defaultCurrentResidence),
          otherDetails: safeParseJson(app.other_details, defaultOtherDetails),
          referredBy: safeParseJson(app.referred_by, defaultReferredBy),
          callResponse: app.call_response || undefined,
          studentNature: app.student_nature || undefined,
          studentCategory: app.student_category || undefined,
          followUpBy: app.followup_by || undefined,
          naqeeb: app.naqeeb || undefined,
          naqeebResponse: app.naqeeb_response || undefined
        };
      });
      
      setApplications(mappedApplications);
    } catch (error: any) {
      toast.error('Error fetching applications: ' + error.message);
    }
  };

  const generateApplicationId = (classCode: string): string => {
    const classApplications = applications.filter(app => app.classCode === classCode);
    const nextNumber = classApplications.length + 1;
    return `${classCode}${nextNumber.toString().padStart(4, '0')}`;
  };

  const addApplication = async (applicationData: Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) throw new Error('User must be logged in to add applications');

      // Count existing applications for this class to generate a simple ID
      const { count, error: countError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('class_code', applicationData.classCode);
        
      if (countError) throw countError;
      
      // Generate a simple ID with class code and sequential number
      const simpleId = `${applicationData.classCode}${(count || 0 + 1).toString().padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          id: simpleId, // Use the simple ID instead of UUID
          class_code: applicationData.classCode,
          status: applicationData.status,
          remarks: applicationData.remarks,
          student_details: applicationData.studentDetails as unknown as Json,
          hometown_details: applicationData.hometownDetails as unknown as Json,
          current_residence: applicationData.currentResidence as unknown as Json,
          other_details: applicationData.otherDetails as unknown as Json,
          referred_by: applicationData.referredBy as unknown as Json,
          call_response: applicationData.callResponse,
          student_nature: applicationData.studentNature,
          student_category: applicationData.studentCategory,
          followup_by: applicationData.followUpBy,
          naqeeb: applicationData.naqeeb,
          naqeeb_response: applicationData.naqeebResponse,
          user_id: user.id // Store the current user's ID
        }])
        .select()
        .single();

      if (error) throw error;

      // Define default values for complex objects
      const defaultStudentDetails = { fullName: '', mobile: '', whatsapp: '' };
      const defaultHometownDetails = { area: '', city: '', district: '', state: '' };
      const defaultCurrentResidence = { area: '', mandal: '', city: '', state: '' };
      const defaultOtherDetails = { age: 0, qualification: '', profession: '', email: '' };
      const defaultReferredBy = { fullName: '', mobile: '', studentId: '', batch: '' };

      const newApplication: StudentApplication = {
        id: data.id,
        classCode: data.class_code,
        status: data.status as 'pending' | 'approved' | 'rejected',
        remarks: data.remarks || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        studentDetails: safeParseJson(data.student_details, defaultStudentDetails),
        hometownDetails: safeParseJson(data.hometown_details, defaultHometownDetails),
        currentResidence: safeParseJson(data.current_residence, defaultCurrentResidence),
        otherDetails: safeParseJson(data.other_details, defaultOtherDetails),
        referredBy: safeParseJson(data.referred_by, defaultReferredBy),
        callResponse: data.call_response || undefined,
        studentNature: data.student_nature || undefined,
        studentCategory: data.student_category || undefined,
        followUpBy: data.followup_by || undefined,
        naqeeb: data.naqeeb || undefined,
        naqeebResponse: data.naqeeb_response || undefined
      };

      setApplications(prev => [...prev, newApplication]);
      toast.success(`Application ${data.id} created successfully`);
      return data.id;
    } catch (error: any) {
      toast.error('Error creating application: ' + error.message);
      throw error;
    }
  };

  const updateApplication = async (id: string, updates: Partial<StudentApplication>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.classCode !== undefined) dbUpdates.class_code = updates.classCode;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
      if (updates.studentDetails !== undefined) dbUpdates.student_details = updates.studentDetails;
      if (updates.hometownDetails !== undefined) dbUpdates.hometown_details = updates.hometownDetails;
      if (updates.currentResidence !== undefined) dbUpdates.current_residence = updates.currentResidence;
      if (updates.otherDetails !== undefined) dbUpdates.other_details = updates.otherDetails;
      if (updates.referredBy !== undefined) dbUpdates.referred_by = updates.referredBy;
      if (updates.callResponse !== undefined) dbUpdates.call_response = updates.callResponse;
      if (updates.studentNature !== undefined) dbUpdates.student_nature = updates.studentNature;
      if (updates.studentCategory !== undefined) dbUpdates.student_category = updates.studentCategory;
      if (updates.followUpBy !== undefined) dbUpdates.followup_by = updates.followUpBy;
      if (updates.naqeeb !== undefined) dbUpdates.naqeeb = updates.naqeeb;
      if (updates.naqeebResponse !== undefined) dbUpdates.naqeeb_response = updates.naqeebResponse;

      const { error } = await supabase
        .from('applications')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, ...updates } : app
      ));
      
      toast.success(`Application ${id} updated successfully`);
      return true;
    } catch (error: any) {
      toast.error('Error updating application: ' + error.message);
      return false;
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== id));
      toast.success(`Application ${id} deleted successfully`);
      return true;
    } catch (error: any) {
      toast.error('Error deleting application: ' + error.message);
      return false;
    }
  };

  const getApplication = (id: string): StudentApplication | undefined => {
    return applications.find(app => app.id === id);
  };

  const getApplicationsByClass = (classCode: string): StudentApplication[] => {
    return applications.filter(app => app.classCode === classCode);
  };

  const validateApplication = (application: Partial<StudentApplication>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Get the class validation rules
    const classValidationRules = application.classCode ? 
      classes.find(c => c.code === application.classCode)?.validation_rules : 
      undefined;
    
    const mobileRegex = /^[6-9]\d{9}$/;
    if (application.studentDetails?.mobile && !mobileRegex.test(application.studentDetails.mobile)) {
      errors.push('Mobile number must be a 10-digit number starting with 6-9');
    }
    
    if (application.studentDetails?.whatsapp && !mobileRegex.test(application.studentDetails.whatsapp)) {
      errors.push('WhatsApp number must be a 10-digit number starting with 6-9');
    }
    
    if (application.hometownDetails?.state) {
      const allowedStates = classValidationRules?.allowedStates || VALIDATION_RULES.allowedStates;
      if (!allowedStates.includes(application.hometownDetails.state)) {
        errors.push(`Hometown state must be one of: ${allowedStates.join(', ')}`);
      }
    }
    
    if (application.currentResidence?.state) {
      const allowedStates = classValidationRules?.allowedStates || VALIDATION_RULES.allowedStates;
      if (!allowedStates.includes(application.currentResidence.state)) {
        errors.push(`Current residence state must be one of: ${allowedStates.join(', ')}`);
      }
    }
    
    if (application.otherDetails?.age) {
      const ageRange = classValidationRules?.ageRange || VALIDATION_RULES.ageRange;
      const age = application.otherDetails.age;
      if (age < ageRange.min || age > ageRange.max) {
        errors.push(`Age should be between ${ageRange.min} and ${ageRange.max} years`);
      }
    }
    
    if (!application.referredBy?.fullName || !application.referredBy?.mobile) {
      errors.push('Referrer name and mobile number are required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      classes,
      VALIDATION_RULES,
      addApplication,
      updateApplication,
      getApplication,
      getApplicationsByClass,
      validateApplication,
      deleteApplication,
      generateApplicationId,
      refreshClasses,
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};
