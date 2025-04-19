
import { ClassRecord, ValidationRules, StudentApplication } from '@/types/supabase-types';
import { Json } from '@/integrations/supabase/types';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Using the StudentApplication interface as the base for our Application type
interface Application extends StudentApplication {
  id: string;
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  validationRules: ValidationRules | null;
  template?: string | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  raw_user_meta_data?: {
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ApplicationContextType {
  classes: Class[];
  applications: Application[];
  users: User[];
  fetchClasses: () => Promise<void>;
  refreshClasses: () => Promise<void>;
  loading: boolean;
  error: string | null;
  getApplication: (id: string) => Application | undefined;
  updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
  addApplication: (application: Omit<Application, 'id' | 'createdAt'>) => Promise<string>;
  validateApplication: (application: Partial<Application>) => { valid: boolean; errors: string[] };
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch classes: ${error.message}`);
      }

      if (data) {
        const classList = data.map(item => ({
          id: item.id,
          name: item.name,
          code: item.code,
          description: item.description || '',
          createdAt: item.created_at,
          validationRules: item.validation_rules as ValidationRules | null,
          template: item.template || null,
        }));
        setClasses(classList);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }

      // Transform the raw data into our Application interface format
      if (data) {
        const formattedApplications: Application[] = data.map(app => {
          // Ensure we have proper objects for nested data
          const studentDetails = typeof app.student_details === 'object' && app.student_details !== null
            ? app.student_details
            : { fullName: 'Unknown', mobile: 'Unknown' };
            
          const otherDetails = typeof app.other_details === 'object' && app.other_details !== null
            ? app.other_details
            : { email: '' };
            
          const hometownDetails = typeof app.hometown_details === 'object' && app.hometown_details !== null
            ? app.hometown_details
            : {};
            
          const currentResidence = typeof app.current_residence === 'object' && app.current_residence !== null
            ? app.current_residence
            : {};
            
          const referredBy = typeof app.referred_by === 'object' && app.referred_by !== null
            ? app.referred_by
            : {};
            
          return {
            id: app.id,
            classCode: app.class_code,
            status: app.status,
            createdAt: app.created_at,
            studentDetails: {
              fullName: studentDetails.fullName || 'Unknown',
              mobile: studentDetails.mobile || 'Unknown',
              ...studentDetails
            },
            otherDetails: {
              email: otherDetails.email || '',
              ...otherDetails
            },
            hometownDetails,
            currentResidence,
            referredBy,
            remarks: app.remarks || '',
          };
        });

        setApplications(formattedApplications);
      } else {
        setApplications([]);
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      toast.error(`Error fetching applications: ${err.message}`);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('search_users', {
        search_term: '',
      });
      
      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      // Ensure data is properly formatted as User[]
      const formattedUsers: User[] = data ? data.map((user: any) => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at || new Date().toISOString(),
        raw_user_meta_data: user.raw_user_meta_data || {},
      })) : [];
      
      setUsers(formattedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  // Get a single application by ID
  const getApplication = (id: string): Application | undefined => {
    return applications.find(app => app.id === id);
  };

  // Update an application
  const updateApplication = async (id: string, data: Partial<Application>): Promise<void> => {
    try {
      // Transform the data back to database format
      const dbData: any = {};
      
      if (data.studentDetails) dbData.student_details = data.studentDetails;
      if (data.otherDetails) dbData.other_details = data.otherDetails;
      if (data.hometownDetails) dbData.hometown_details = data.hometownDetails;
      if (data.currentResidence) dbData.current_residence = data.currentResidence;
      if (data.referredBy) dbData.referred_by = data.referredBy;
      if (data.status) dbData.status = data.status;
      if (data.remarks !== undefined) dbData.remarks = data.remarks;
      
      const { error } = await supabase
        .from('applications')
        .update(dbData)
        .eq('id', id);
        
      if (error) throw new Error(error.message);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, ...data } : app)
      );
      
      toast.success('Application updated successfully');
    } catch (err: any) {
      toast.error('Failed to update application: ' + err.message);
      throw err;
    }
  };

  // Add a new application
  const addApplication = async (application: Omit<Application, 'id' | 'createdAt'>): Promise<string> => {
    try {
      // Generate a unique ID for the application
      const uuid = crypto.randomUUID();

      // Transform the data to database format
      const dbData = {
        id: uuid,
        class_code: application.classCode,
        student_details: application.studentDetails,
        other_details: application.otherDetails,
        hometown_details: application.hometownDetails,
        current_residence: application.currentResidence,
        referred_by: application.referredBy,
        status: application.status || 'pending',
        remarks: application.remarks,
        user_id: '00000000-0000-0000-0000-000000000000' // Placeholder for anonymous submissions
      };
      
      const { data, error } = await supabase
        .from('applications')
        .insert(dbData)
        .select();
        
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) throw new Error('No data returned after insert');
      
      const newApp = data[0];
      
      // Format the returned data and add to state
      const formattedApp: Application = {
        id: newApp.id,
        classCode: newApp.class_code,
        status: newApp.status,
        createdAt: newApp.created_at,
        studentDetails: typeof newApp.student_details === 'object' && newApp.student_details !== null
          ? { fullName: newApp.student_details.fullName || 'Unknown', mobile: newApp.student_details.mobile || 'Unknown', ...newApp.student_details }
          : { fullName: 'Unknown', mobile: 'Unknown' },
        otherDetails: typeof newApp.other_details === 'object' && newApp.other_details !== null
          ? { email: newApp.other_details.email || '', ...newApp.other_details }
          : { email: '' },
        hometownDetails: typeof newApp.hometown_details === 'object' && newApp.hometown_details !== null 
          ? newApp.hometown_details 
          : {},
        currentResidence: typeof newApp.current_residence === 'object' && newApp.current_residence !== null 
          ? newApp.current_residence 
          : {},
        referredBy: typeof newApp.referred_by === 'object' && newApp.referred_by !== null 
          ? newApp.referred_by 
          : {},
        remarks: newApp.remarks,
      };
      
      setApplications(prev => [...prev, formattedApp]);
      
      toast.success('Application submitted successfully');
      return newApp.id;
    } catch (err: any) {
      toast.error('Failed to submit application: ' + err.message);
      throw err;
    }
  };

  // Validate an application against class rules
  const validateApplication = (application: Partial<Application>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Find class validation rules
    const classDetails = classes.find(c => c.code === application.classCode);
    if (!classDetails) {
      errors.push('Invalid class code');
      return { valid: false, errors };
    }
    
    const rules = classDetails.validationRules;
    if (!rules) {
      // No validation rules, consider valid
      return { valid: true, errors: [] };
    }
    
    // Check age if provided
    if (rules.ageRange && application.otherDetails?.age) {
      const age = parseInt(application.otherDetails.age.toString());
      if (age < rules.ageRange.min || age > rules.ageRange.max) {
        errors.push(`Age must be between ${rules.ageRange.min} and ${rules.ageRange.max}`);
      }
    }
    
    // Check state/province if provided
    if (rules.allowedStates && rules.allowedStates.length > 0 && 
        application.currentResidence?.state) {
      const state = application.currentResidence.state.toString();
      if (!rules.allowedStates.includes(state)) {
        errors.push(`State/Province ${state} is not eligible for this class`);
      }
    }
    
    // Check qualification if provided
    if (rules.minimumQualification && application.otherDetails?.qualification) {
      const qualifications = ['none', 'primary', 'secondary', 'diploma', 'bachelors', 'masters', 'doctorate'];
      const reqIndex = qualifications.indexOf(rules.minimumQualification);
      const userIndex = qualifications.indexOf(application.otherDetails.qualification.toString().toLowerCase());
      
      if (userIndex < reqIndex) {
        errors.push(`Minimum qualification required is ${rules.minimumQualification}`);
      }
    }
    
    return { 
      valid: errors.length === 0,
      errors 
    };
  };

  // Alias for fetchClasses for consistency
  const refreshClasses = fetchClasses;

  useEffect(() => {
    fetchClasses();
    fetchApplications();
    fetchUsers();
  }, []);

  return (
    <ApplicationContext.Provider value={{ 
      classes, 
      applications, 
      users,
      fetchClasses, 
      refreshClasses,
      loading, 
      error,
      getApplication,
      updateApplication,
      addApplication,
      validateApplication
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

export type { Class, User, Application };
