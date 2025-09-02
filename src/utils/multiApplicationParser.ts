import { parseApplicationText } from './applicationValidation';

export interface DuplicateMatch {
  id: string;
  name: string;
  mobile: string;
}

export interface ParsedApplicationWithDuplicates {
  data: any;
  duplicates: DuplicateMatch[];
}

export const parseMultipleApplications = async (
  text: string,
  checkDuplicates: (mobile: string, email?: string) => Promise<DuplicateMatch[]>
): Promise<ParsedApplicationWithDuplicates[]> => {
  try {
    // Split applications using "=== Full Name" as delimiter
    const sections = text.split(/===\s*Full Name/i).filter(section => section.trim());
    
    if (sections.length === 0) {
      return [];
    }

    const results: ParsedApplicationWithDuplicates[] = [];

    for (const section of sections) {
      // Add back the "Full Name" prefix if it was split
      const applicationText = section.includes('Full Name:') 
        ? section 
        : `Full Name${section}`;

      const parsedData = parseApplicationText(applicationText);
      
      if (parsedData) {
        // Check for duplicates
        const mobile = parsedData.studentDetails?.mobile;
        const email = parsedData.otherDetails?.email;
        
        let duplicates: DuplicateMatch[] = [];
        if (mobile) {
          duplicates = await checkDuplicates(mobile, email);
        }

        results.push({
          data: parsedData,
          duplicates
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing multiple applications:', error);
    return [];
  }
};

export const validateReferrerDetails = (parsedData: any) => {
  const warnings = [];
  const referredBy = parsedData.referredBy || {};

  if (!referredBy.fullName || !referredBy.fullName.trim()) {
    warnings.push({
      field: 'referredBy.fullName',
      message: 'Referrer full name is missing'
    });
  }

  if (!referredBy.mobile || !referredBy.mobile.trim()) {
    warnings.push({
      field: 'referredBy.mobile',
      message: 'Referrer mobile number is missing'
    });
  }

  if (!referredBy.batch || !referredBy.batch.trim()) {
    warnings.push({
      field: 'referredBy.batch',
      message: 'Referrer batch is missing'
    });
  }

  if (!referredBy.studentId || !referredBy.studentId.trim()) {
    warnings.push({
      field: 'referredBy.studentId',
      message: 'Referrer student ID is missing'
    });
  }

  return warnings;
};