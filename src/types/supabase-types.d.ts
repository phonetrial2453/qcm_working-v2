
import { Database } from '@/integrations/supabase/types';

// Custom type for classes
export type ClassRecord = Database['public']['Tables']['classes']['Row'] & {
  template?: string | null;
};
export type ClassInsert = Database['public']['Tables']['classes']['Insert'] & {
  template?: string;
};
export type ClassUpdate = Database['public']['Tables']['classes']['Update'] & {
  template?: string;
};

// Add other types as needed
export type ModeratorClass = Database['public']['Tables']['moderator_classes']['Row'];

// Add ValidationRules type
export type ValidationRules = {
  ageRange: {
    min: number;
    max: number;
  };
  allowedStates: string[];
  minimumQualification: string;
};

// Add StudentApplication type
export interface StudentApplication {
  id?: string;
  classCode: string;
  status: string;
  createdAt?: string;
  studentDetails: {
    fullName: string;
    mobile: string;
    whatsapp?: string;
    [key: string]: any;
  };
  otherDetails: {
    email: string;
    age?: number;
    qualification?: string;
    profession?: string;
    [key: string]: any;
  };
  hometownDetails: {
    area?: string;
    city?: string;
    district?: string;
    state?: string;
    [key: string]: any;
  };
  currentResidence: {
    area?: string;
    mandal?: string;
    city?: string;
    state?: string;
    [key: string]: any;
  };
  referredBy: {
    fullName?: string;
    mobile?: string;
    studentId?: string;
    batch?: string;
    [key: string]: any;
  };
  remarks?: string;
  [key: string]: any;
}
