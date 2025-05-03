
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../AuthContext';
import { Application } from '@/types/application';
import { Class } from '@/types/supabase-types';
import { ApplicationContextType } from './types';
import { 
  fetchApplicationsService, 
  fetchClassesService, 
  createApplicationService,
  updateApplicationService,
  deleteApplicationService 
} from './service';
import { formatApplicationForDisplay } from './utils';

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchApplications = async () => {
    if (!isAuthenticated) {
      setApplications([]);
      return;
    }

    try {
      setLoading(true);
      const apps = await fetchApplicationsService();
      setApplications(apps);
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
      const applicationId = await createApplicationService(applicationData, user?.id);
      if (applicationId) {
        await fetchApplications();
      }
      return applicationId;
    } catch (err) {
      console.error('Error creating application:', err);
      setError('Failed to create application');
      return null;
    }
  };

  const updateApplication = async (applicationId: string, applicationData: Partial<Application>): Promise<string | null> => {
    try {
      const updatedId = await updateApplicationService(applicationId, applicationData);
      
      if (updatedId) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, ...applicationData } 
              : app
          )
        );
      }

      return updatedId;
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application');
      return null;
    }
  };

  const deleteApplication = async (applicationId: string): Promise<void> => {
    try {
      const success = await deleteApplicationService(applicationId);
      
      if (success) {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      } else {
        setError('Failed to delete application');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application');
    }
  };

  const refreshClasses = async () => {
    try {
      const fetchedClasses = await fetchClassesService();
      setClasses(fetchedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to fetch classes');
    }
  };

  useEffect(() => {
    refreshClasses();
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      console.error('Application Context Error:', error);
    }
  }, [error]);

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
