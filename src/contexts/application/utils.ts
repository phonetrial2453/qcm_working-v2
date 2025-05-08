
import { Json } from '@/integrations/supabase/types';
import { Application, ValidationError } from '@/types/application';

export const transformValidationRules = (rules: Json) => {
  const typedRules = rules as {
    ageRange?: { min?: number; max?: number };
    allowedStates?: string[];
    minimumQualification?: string;
  };
  return typedRules;
};

export const formatApplicationForDisplay = (app: Application) => {
  // Initialize with safe default objects to avoid potential null/undefined errors
  const studentDetails = app.studentDetails || {};
  const otherDetails = app.otherDetails || {};
  const currentResidence = app.currentResidence || {};

  return {
    id: app.id,
    name: (studentDetails as { fullName?: string }).fullName || 'N/A',
    phone: (studentDetails as { mobile?: string }).mobile || 'N/A',
    email: (otherDetails as { email?: string }).email || 'N/A',
    class: app.classCode,
    status: app.status,
    createdAt: app.createdAt,
    address: `${currentResidence.area || ''}, ${currentResidence.city || ''}, ${currentResidence.state || ''}`.trim(),
  };
};

export const transformApplicationData = (app: any): Application => {
  const studentDetails = app.student_details as { [key: string]: any } || {};
  const otherDetails = app.other_details as { [key: string]: any } || {};
  const hometownDetails = app.hometown_details as { [key: string]: any } || {};
  const currentResidence = app.current_residence as { [key: string]: any } || {};
  const referredBy = app.referred_by as { [key: string]: any } || {};
  
  return {
    id: app.id,
    classCode: app.class_code,
    status: app.status,
    createdAt: app.created_at,
    updatedAt: app.updated_at,
    studentDetails: {
      fullName: studentDetails.fullName || '',
      mobile: studentDetails.mobile || '',
      whatsapp: studentDetails.whatsapp || '',
      ...studentDetails
    },
    otherDetails: {
      email: otherDetails.email || '',
      age: otherDetails.age,
      qualification: otherDetails.qualification,
      profession: otherDetails.profession,
      ...otherDetails
    },
    hometownDetails: {
      area: hometownDetails.area,
      city: hometownDetails.city,
      district: hometownDetails.district,
      state: hometownDetails.state,
      ...hometownDetails
    },
    currentResidence: {
      area: currentResidence.area,
      mandal: currentResidence.mandal,
      city: currentResidence.city,
      state: currentResidence.state,
      ...currentResidence
    },
    referredBy: {
      fullName: referredBy.fullName || '',
      mobile: referredBy.mobile || '',
      studentId: referredBy.studentId,
      batch: referredBy.batch,
      ...referredBy
    },
    remarks: app.remarks,
    callResponse: app.call_response,
    studentNature: app.student_nature,
    studentCategory: app.student_category,
    followUpBy: app.followup_by,
    naqeeb: app.naqeeb,
    naqeebResponse: app.naqeeb_response
  };
};
