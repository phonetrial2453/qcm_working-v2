import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Class, ClassRecord } from '@/types/supabase-types';
import { useAuth } from './AuthContext';
import { Json } from '@/integrations/supabase/types';
import { Application as AppType, ApplicationStatus, ValidationError } from '@/types/application';

export type Application = AppType;

interface ApplicationContextType {
  applications: Application[];
  classes: Class[];
  loading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  refreshClasses: () => Promise<void>;
  createApplication: (applicationData: Partial<Application>) => Promise<string | null>;
  updateApplication: (applicationId: string, applicationData: Partial<Application>) => Promise<string | null>;
  deleteApplication: (applicationId: string) => Promise<void>;
  formatApplicationForDisplay: (app: Application) => any;
  getApplication: (id: string) => Application | undefined;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const transformValidationRules = (rules: Json) => {
    const typedRules = rules as {
      ageRange?: { min?: number; max?: number };
      allowedStates?: string[];
      minimumQualification?: string;
    };
    return typedRules;
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const transformedClasses = data.map(cls => ({
          id: cls.id,
          code: cls.code,
          name: cls.name,
          description: cls.description || '',
          validationRules: cls.validation_rules ? transformValidationRules(cls.validation_rules) : undefined,
          template: cls.template || '',
          created_at: cls.created_at,
          updated_at: cls.updated_at
        }));
        setClasses(transformedClasses as Class[]);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes');
    }
  };

  const fetchApplications = async () => {
    if (!isAuthenticated) {
      setApplications([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const transformedApplications = data.map(app => {
          const studentDetails = app.student_details as { [key: string]: any } || {};
          const otherDetails = app.other_details as { [key: string]: any } || {};
          const hometownDetails = app.hometown_details as { [key: string]: any } || {};
          const currentResidence = app.current_residence as { [key: string]: any } || {};
          const referredBy = app.referred_by as { [key: string]: any } || {};
          
          // Extract validation warnings if they exist in the data
          const validationWarnings = studentDetails.validationWarnings || 
                                 otherDetails.validationWarnings || 
                                 app.validation_warnings || [];

          return {
            id: app.id,
            classCode: app.class_code,
            status: app.status as ApplicationStatus,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
            studentDetails: {
              fullName: studentDetails?.fullName || '',
              mobile: studentDetails?.mobile || '',
              whatsapp: studentDetails?.whatsapp || '',
              ...studentDetails
            },
            otherDetails: {
              email: otherDetails?.email || '',
              age: otherDetails?.age,
              qualification: otherDetails?.qualification,
              profession: otherDetails?.profession,
              ...otherDetails
            },
            hometownDetails: {
              area: hometownDetails?.area,
              city: hometownDetails?.city,
              district: hometownDetails?.district,
              state: hometownDetails?.state,
              ...hometownDetails
            },
            currentResidence: {
              area: currentResidence?.area,
              mandal: currentResidence?.mandal,
              city: currentResidence?.city,
              state: currentResidence?.state,
              ...currentResidence
            },
            referredBy: {
              fullName: referredBy?.fullName || '',
              mobile: referredBy?.mobile || '',
              studentId: referredBy?.studentId,
              batch: referredBy?.batch,
              ...referredBy
            },
            remarks: app.remarks,
            callResponse: app.call_response,
            studentNature: app.student_nature,
            studentCategory: app.student_category,
            followUpBy: app.followup_by,
            naqeeb: app.naqeeb,
            naqeebResponse: app.naqeeb_response,
            validationWarnings: validationWarnings
          };
        });

        setApplications(transformedApplications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const getApplication = (id: string): Application | undefined => {
    return applications.find(app => app.id === id);
  };

  const createApplication = async (applicationData: Partial<Application>): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            id: applicationData.id,
            class_code: applicationData.classCode,
            status: applicationData.status || 'pending',
            student_details: applicationData.studentDetails || {},
            other_details: applicationData.otherDetails || {},
            hometown_details: applicationData.hometownDetails || {},
            current_residence: applicationData.currentResidence || {},
            referred_by: applicationData.referredBy || {},
            remarks: applicationData.remarks,
            validation_warnings: applicationData.validationWarnings || [],
            user_id: user?.id
          },
        ])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating application:', error);
        setError('Failed to create application');
        return null;
      }

      await fetchApplications();
      return data.id;
    } catch (err) {
      console.error('Error creating application:', err);
      setError('Failed to create application');
      return null;
    }
  };

  const updateApplication = async (applicationId: string, applicationData: Partial<Application>): Promise<string | null> => {
    try {
      const updates: Record<string, any> = {};
      
      if (applicationData.classCode) updates.class_code = applicationData.classCode;
      if (applicationData.status) updates.status = applicationData.status;
      if (applicationData.studentDetails) updates.student_details = applicationData.studentDetails;
      if (applicationData.otherDetails) updates.other_details = applicationData.otherDetails;
      if (applicationData.hometownDetails) updates.hometown_details = applicationData.hometownDetails;
      if (applicationData.currentResidence) updates.current_residence = applicationData.currentResidence;
      if (applicationData.referredBy) updates.referred_by = applicationData.referredBy;
      if (applicationData.remarks !== undefined) updates.remarks = applicationData.remarks;
      if (applicationData.validationWarnings) updates.validation_warnings = applicationData.validationWarnings;
      
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', applicationId)
        .select('id')
        .single();

      if (error) {
        console.error('Error updating application:', error);
        setError('Failed to update application');
        return null;
      }

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, ...applicationData } 
            : app
        )
      );

      return data.id;
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application');
      return null;
    }
  };

  const deleteApplication = async (applicationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) {
        console.error('Error deleting application:', error);
        setError('Failed to delete application');
      } else {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application');
    }
  };

  const refreshClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const transformedClasses = data.map(cls => ({
          id: cls.id,
          code: cls.code,
          name: cls.name,
          description: cls.description || '',
          validationRules: cls.validation_rules ? transformValidationRules(cls.validation_rules) : undefined,
          template: cls.template || '',
          created_at: cls.created_at,
          updated_at: cls.updated_at
        }));
        setClasses(transformedClasses as Class[]);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes');
    }
  };

  useEffect(() => {
    fetchClasses();
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      console.error('Application Context Error:', error);
    }
  }, [error]);

  const formatApplicationForDisplay = (app: Application) => {
    const studentDetails = app.studentDetails || {};
    const otherDetails = app.otherDetails || {};
    const currentResidence = app.currentResidence || {};

    return {
      id: app.id,
      name: studentDetails.fullName || 'N/A',
      phone: studentDetails.mobile || 'N/A',
      email: otherDetails.email || 'N/A',
      class: app.classCode,
      status: app.status,
      createdAt: app.createdAt,
      address: `${currentResidence.area || ''}, ${currentResidence.city || ''}, ${currentResidence.state || ''}`.trim(),
    };
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        classes,
        loading,
        error,
        fetchApplications,
        refreshClasses,
        createApplication,
        updateApplication,
        deleteApplication,
        formatApplicationForDisplay,
        getApplication
      }}
    >
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
