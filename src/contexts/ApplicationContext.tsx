
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

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
  // Additional fields required
  callResponse?: string;
  studentNature?: string;
  studentCategory?: string;
  followUpBy?: string;
  naqeeb?: string;
  naqeebResponse?: string;
}

// Sample application data for demonstration
const MOCK_APPLICATIONS: StudentApplication[] = [
  {
    id: 'QRAN0001',
    classCode: 'QRAN',
    status: 'approved',
    remarks: 'Meets all criteria',
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-04-16T14:20:00Z',
    studentDetails: {
      fullName: 'Abdullah Khan',
      mobile: '9876543210',
      whatsapp: '9876543210',
    },
    hometownDetails: {
      area: 'Royapettah',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
    },
    currentResidence: {
      area: 'Royapettah',
      mandal: 'Central',
      city: 'Chennai',
      state: 'Tamil Nadu',
    },
    otherDetails: {
      age: 32,
      qualification: 'B.E. Computer Science',
      profession: 'Software Engineer',
      email: 'abdullah@example.com',
    },
    referredBy: {
      fullName: 'Mohammed Ibrahim',
      mobile: '8765432109',
      studentId: 'QRAN0567',
      batch: 'QRAN',
    },
    callResponse: 'Interested',
    studentNature: 'Serious',
    studentCategory: 'Professional',
    followUpBy: 'Ahmed',
    naqeeb: 'Umar',
    naqeebResponse: 'Accepted',
  },
  {
    id: 'SRAT0001',
    classCode: 'SRAT',
    status: 'pending',
    createdAt: '2023-04-17T09:15:00Z',
    updatedAt: '2023-04-17T09:15:00Z',
    studentDetails: {
      fullName: 'Fatima Zahra',
      mobile: '8765432109',
      whatsapp: '8765432109',
    },
    hometownDetails: {
      area: 'Abids',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
    },
    currentResidence: {
      area: 'Abids',
      mandal: 'Hyderabad Central',
      city: 'Hyderabad',
      state: 'Telangana',
    },
    otherDetails: {
      age: 28,
      qualification: 'M.A. Islamic Studies',
      profession: 'Teacher',
      email: 'fatima@example.com',
    },
    referredBy: {
      fullName: 'Ayesha Siddiqui',
      mobile: '7654321098',
      studentId: 'SRAT0342',
      batch: 'SRAT',
    },
  },
];

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
  addApplication: (application: Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateApplication: (id: string, updates: Partial<StudentApplication>) => boolean;
  getApplication: (id: string) => StudentApplication | undefined;
  getApplicationsByClass: (classCode: string) => StudentApplication[];
  validateApplication: (application: Partial<StudentApplication>) => { valid: boolean; errors: string[] };
  deleteApplication: (id: string) => boolean;
  generateApplicationId: (classCode: string) => string;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<StudentApplication[]>(MOCK_APPLICATIONS);
  const [classes] = useState<ClassInfo[]>(MOCK_CLASSES);

  // Generate a unique application ID
  const generateApplicationId = (classCode: string): string => {
    const classApplications = applications.filter(app => app.classCode === classCode);
    const nextNumber = classApplications.length + 1;
    return `${classCode}${nextNumber.toString().padStart(4, '0')}`;
  };

  // Add a new application
  const addApplication = (applicationData: Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = generateApplicationId(applicationData.classCode);
    const now = new Date().toISOString();
    
    const newApplication: StudentApplication = {
      ...applicationData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    setApplications(prev => [...prev, newApplication]);
    toast.success(`Application ${id} created successfully`);
    return id;
  };

  // Update an existing application
  const updateApplication = (id: string, updates: Partial<StudentApplication>): boolean => {
    const index = applications.findIndex(app => app.id === id);
    
    if (index === -1) {
      toast.error(`Application ${id} not found`);
      return false;
    }
    
    const updatedApplication = {
      ...applications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    const newApplications = [...applications];
    newApplications[index] = updatedApplication;
    
    setApplications(newApplications);
    toast.success(`Application ${id} updated successfully`);
    return true;
  };

  // Get a specific application by ID
  const getApplication = (id: string): StudentApplication | undefined => {
    return applications.find(app => app.id === id);
  };

  // Get applications for a specific class
  const getApplicationsByClass = (classCode: string): StudentApplication[] => {
    return applications.filter(app => app.classCode === classCode);
  };

  // Validate an application against the rules
  const validateApplication = (application: Partial<StudentApplication>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (application.studentDetails?.mobile && !mobileRegex.test(application.studentDetails.mobile)) {
      errors.push('Mobile number must be a 10-digit number starting with 6-9');
    }
    
    if (application.studentDetails?.whatsapp && !mobileRegex.test(application.studentDetails.whatsapp)) {
      errors.push('WhatsApp number must be a 10-digit number starting with 6-9');
    }
    
    // Check allowed states
    if (application.hometownDetails?.state && 
        !VALIDATION_RULES.allowedStates.includes(application.hometownDetails.state)) {
      errors.push(`Hometown state must be one of: ${VALIDATION_RULES.allowedStates.join(', ')}`);
    }
    
    if (application.currentResidence?.state && 
        !VALIDATION_RULES.allowedStates.includes(application.currentResidence.state)) {
      errors.push(`Current residence state must be one of: ${VALIDATION_RULES.allowedStates.join(', ')}`);
    }
    
    // Check age range
    if (application.otherDetails?.age) {
      const age = application.otherDetails.age;
      if (age < VALIDATION_RULES.ageRange.min || age > VALIDATION_RULES.ageRange.max) {
        errors.push(`Age should be between ${VALIDATION_RULES.ageRange.min} and ${VALIDATION_RULES.ageRange.max} years`);
      }
    }
    
    // Check for reference details
    if (!application.referredBy?.fullName || !application.referredBy?.mobile) {
      errors.push('Referrer name and mobile number are required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Delete an application
  const deleteApplication = (id: string): boolean => {
    const index = applications.findIndex(app => app.id === id);
    
    if (index === -1) {
      toast.error(`Application ${id} not found`);
      return false;
    }
    
    const newApplications = [...applications];
    newApplications.splice(index, 1);
    
    setApplications(newApplications);
    toast.success(`Application ${id} deleted successfully`);
    return true;
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      classes,
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

export const useApplications = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};
