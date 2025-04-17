import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Json } from '@/integrations/supabase/types';

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
export interface ClassInfo {
  code: string;
  name: string;
  description: string;
}

const MOCK_CLASSES: ClassInfo[] = [
  {
    code: 'QRAN',
    name: 'Quran Studies',
    description: 'In-depth study of Quranic verses and their interpretation',
  },
  {
    code: 'SRAT',
    name: 'Seerat Studies',
    description: 'Study of the life and teachings of Prophet Muhammad (PBUH)',
  },
  {
    code: 'FIQH',
    name: 'Fiqh Studies',
    description: 'Islamic jurisprudence and legal framework',
  },
  {
    code: 'HDTH',
    name: 'Hadith Studies',
    description: 'Study of the sayings and traditions of Prophet Muhammad (PBUH)',
  },
];

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
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [classes] = useState<ClassInfo[]>(MOCK_CLASSES);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');
      
      if (error) throw error;
      
      const mappedApplications: StudentApplication[] = data.map(app => ({
        id: app.id,
        classCode: app.class_code,
        status: app.status as 'pending' | 'approved' | 'rejected',
        remarks: app.remarks || undefined,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        studentDetails: typeof app.student_details === 'object' 
          ? app.student_details as StudentApplication['studentDetails']
          : { 
            fullName: '', 
            mobile: '', 
            whatsapp: '' 
          },
        hometownDetails: typeof app.hometown_details === 'object'
          ? app.hometown_details as StudentApplication['hometownDetails']
          : {
            area: '',
            city: '',
            district: '',
            state: ''
          },
        currentResidence: typeof app.current_residence === 'object'
          ? app.current_residence as StudentApplication['currentResidence']
          : {
            area: '',
            mandal: '',
            city: '',
            state: ''
          },
        otherDetails: typeof app.other_details === 'object'
          ? app.other_details as StudentApplication['otherDetails']
          : {
            age: 0,
            qualification: '',
            profession: '',
            email: ''
          },
        referredBy: typeof app.referred_by === 'object'
          ? app.referred_by as StudentApplication['referredBy']
          : {
            fullName: '',
            mobile: '',
            studentId: '',
            batch: ''
          },
        callResponse: app.call_response || undefined,
        studentNature: app.student_nature || undefined,
        studentCategory: app.student_category || undefined,
        followUpBy: app.followup_by || undefined,
        naqeeb: app.naqeeb || undefined,
        naqeebResponse: app.naqeeb_response || undefined
      }));
      
      setApplications(mappedApplications);
    } catch (error: any) {
      toast.error('Error fetching applications: ' + error.message);
    }
  };

  const addApplication = async (applicationData: Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) throw new Error('User must be logged in to add applications');

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          class_code: applicationData.classCode,
          status: applicationData.status,
          remarks: applicationData.remarks,
          student_details: applicationData.studentDetails,
          hometown_details: applicationData.hometownDetails,
          current_residence: applicationData.currentResidence,
          other_details: applicationData.otherDetails,
          referred_by: applicationData.referredBy,
          call_response: applicationData.callResponse,
          student_nature: applicationData.studentNature,
          student_category: applicationData.studentCategory,
          followup_by: applicationData.followUpBy,
          naqeeb: applicationData.naqeeb,
          naqeeb_response: applicationData.naqeebResponse,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newApplication: StudentApplication = {
        id: data.id,
        classCode: data.class_code,
        status: data.status as 'pending' | 'approved' | 'rejected',
        remarks: data.remarks || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        studentDetails: data.student_details,
        hometownDetails: data.hometown_details,
        currentResidence: data.current_residence,
        otherDetails: data.other_details,
        referredBy: data.referred_by,
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
    
    const mobileRegex = /^[6-9]\d{9}$/;
    if (application.studentDetails?.mobile && !mobileRegex.test(application.studentDetails.mobile)) {
      errors.push('Mobile number must be a 10-digit number starting with 6-9');
    }
    
    if (application.studentDetails?.whatsapp && !mobileRegex.test(application.studentDetails.whatsapp)) {
      errors.push('WhatsApp number must be a 10-digit number starting with 6-9');
    }
    
    if (application.hometownDetails?.state && 
        !VALIDATION_RULES.allowedStates.includes(application.hometownDetails.state)) {
      errors.push(`Hometown state must be one of: ${VALIDATION_RULES.allowedStates.join(', ')}`);
    }
    
    if (application.currentResidence?.state && 
        !VALIDATION_RULES.allowedStates.includes(application.currentResidence.state)) {
      errors.push(`Current residence state must be one of: ${VALIDATION_RULES.allowedStates.join(', ')}`);
    }
    
    if (application.otherDetails?.age) {
      const age = application.otherDetails.age;
      if (age < VALIDATION_RULES.ageRange.min || age > VALIDATION_RULES.ageRange.max) {
        errors.push(`Age should be between ${VALIDATION_RULES.ageRange.min} and ${VALIDATION_RULES.ageRange.max} years`);
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

  const generateApplicationId = (classCode: string): string => {
    const classApplications = applications.filter(app => app.classCode === classCode);
    const nextNumber = classApplications.length + 1;
    return `${classCode}${nextNumber.toString().padStart(4, '0')}`;
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
