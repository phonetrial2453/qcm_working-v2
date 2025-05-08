
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  warnings: ValidationError[];
};

export interface StudentDetails {
  fullName: string;
  mobile: string;
  whatsapp?: string;
  [key: string]: any;
}

export interface OtherDetails {
  email: string;
  age?: number | string;
  qualification?: string;
  profession?: string;
  [key: string]: any;
}

export interface HometownDetails {
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  [key: string]: any;
}

export interface CurrentResidence {
  area?: string;
  mandal?: string;
  city?: string;
  state?: string;
  [key: string]: any;
}

export interface ReferredBy {
  fullName?: string;
  mobile?: string;
  studentId?: string;
  batch?: string;
  [key: string]: any;
}

export interface Application {
  id: string;
  classCode: string;
  status: ApplicationStatus;
  studentDetails: StudentDetails;
  otherDetails: OtherDetails;
  hometownDetails: HometownDetails;
  currentResidence: CurrentResidence;
  referredBy: ReferredBy;
  remarks?: string;
  callResponse?: string;
  studentNature?: string;
  studentCategory?: string;
  followUpBy?: string;
  naqeeb?: string;
  naqeebResponse?: string;
  createdAt: string;
  updatedAt: string;
  user_id?: string;
}
