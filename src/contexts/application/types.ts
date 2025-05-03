
import { Class } from '@/types/supabase-types';
import { Application, ValidationError } from '@/types/application';

export interface ApplicationContextType {
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
