
export interface Application {
  id: string;
  classCode: string;
  status: string;
  createdAt: string;
  studentDetails?: {
    fullName?: string;
    mobile?: string;
  };
  otherDetails?: {
    email?: string;
  };
}
