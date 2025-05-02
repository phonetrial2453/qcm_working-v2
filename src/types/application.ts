
export interface Application {
  id: string;
  classCode: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  studentDetails?: {
    fullName?: string;
    mobile?: string;
    whatsapp?: string;
  };
  otherDetails?: {
    email?: string;
    age?: number;
    qualification?: string;
  };
  hometownDetails?: {
    area?: string;
    city?: string;
    district?: string;
    state?: string;
  };
  currentResidence?: {
    area?: string;
    city?: string;
    mandal?: string;
    state?: string;
  };
  referredBy?: {
    fullName?: string;
    mobile?: string;
    studentId?: string;
    batch?: string;
  };
  remarks?: string;
}

export interface ValidationResult {
  valid: boolean;
  warnings: {
    field: string;
    message: string;
  }[];
}
