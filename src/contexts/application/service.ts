
import { supabase } from '@/integrations/supabase/client';
import { Application, ValidationError } from '@/types/application';
import { transformApplicationData, transformValidationRules } from './utils';
import { Class } from '@/types/supabase-types';

export async function fetchApplicationsService() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*');

    if (error) {
      throw error;
    }

    if (data) {
      return data.map(app => transformApplicationData(app));
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching applications:', err);
    throw err;
  }
}

export async function fetchClassesService() {
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
      return transformedClasses as Class[];
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching classes:', err);
    throw err;
  }
}

export async function createApplicationService(applicationData: Partial<Application>, userId?: string): Promise<string | null> {
  try {
    console.log("Creating application with data:", applicationData);
    
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
          user_id: userId
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error('Error creating application:', err);
    return null;
  }
}

export async function updateApplicationService(applicationId: string, applicationData: Partial<Application>): Promise<string | null> {
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
      return null;
    }

    return data.id;
  } catch (err) {
    console.error('Error updating application:', err);
    return null;
  }
}

export async function deleteApplicationService(applicationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (error) {
      console.error('Error deleting application:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting application:', err);
    return false;
  }
}
