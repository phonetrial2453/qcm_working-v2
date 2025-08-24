import { z } from 'zod';

export const applicationSchema = z.object({
  classCode: z.string().min(2, { message: "Class code is required" }),
  studentDetails: z.object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    mobile: z.string().min(10, { message: "Valid mobile number is required" }),
    whatsapp: z.string().optional(),
  }),
  otherDetails: z.object({
    email: z.string().email({ message: "Valid email is required" }).optional(),
    age: z.number().min(13, { message: "Age must be at least 13" }).optional(),
    qualification: z.string().optional(),
    profession: z.string().optional(),
  }),
  currentResidence: z.object({
    area: z.string().optional(),
    mandal: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
  hometownDetails: z.object({
    area: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
  }),
  referredBy: z.object({
    fullName: z.string().optional(),
    mobile: z.string().optional(),
    studentId: z.string().optional(),
    batch: z.string().optional(),
  }),
  remarks: z.string().optional(),
});

export type ValidationError = {
  field: string;
  message: string;
};

export const parseApplicationText = (text: string) => {
  try {
    // Initialize data structure
    const parsedData: any = {
      studentDetails: {},
      otherDetails: {},
      currentResidence: {},
      hometownDetails: {},
      referredBy: {},
    };

    // Process text line by line to extract all fields from Full Name to Batch#
    const lines = text.split('\n');
    let currentSection: string | null = null;
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines, dividers, decorative text
      if (!line || line.match(/^-+$/) || line.match(/^=+$/) || line.includes('🇶🇦') || line.includes('*')) continue;
      
      // Extract class code from headers like "(QTR-B04)"
      const classCodeMatch = line.match(/\(([A-Z]{3}-[A-Z]\d{2})\)/);
      if (classCodeMatch) {
        parsedData.classCode = classCodeMatch[1];
        continue;
      }
      
      // Check for section headers - updated to match new format
      if (line.toUpperCase().includes('STUDENT DETAILS')) {
        currentSection = 'studentDetails';
        continue;
      } else if (line.toUpperCase().includes('BACK HOME DETAILS')) {
        currentSection = 'hometownDetails';
        continue;
      } else if (line.toUpperCase().includes('CURRENT RESIDENCE')) {
        currentSection = 'currentResidence';
        continue;
      } else if (line.toUpperCase().includes('OTHER DETAILS')) {
        currentSection = 'otherDetails';
        continue;
      } else if (line.toUpperCase().includes('REFERRED BY')) {
        currentSection = 'referredBy';
        continue;
      }
      
      // Process key-value pairs
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        let key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Skip if no value
        if (!value) continue;
        
        // Normalize key for storage
        const normalizedKey = key
          .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
          .replace(/\s+/g, '') // Remove spaces
          .replace(/^\w/, c => c.toLowerCase()); // Make first letter lowercase
        
        // Field mapping based on the new format
        if (key.toLowerCase().includes('full name')) {
          // Auto-format name: capitalize first letter of each word
          const formattedName = value.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          if (currentSection === 'referredBy') {
            parsedData.referredBy.fullName = formattedName;
          } else {
            parsedData.studentDetails.fullName = formattedName;
          }
        } else if (key.toLowerCase().includes('mobile') && key.includes('+974')) {
          parsedData.studentDetails.mobile = value;
        } else if (key.toLowerCase().includes('whatsapp')) {
          parsedData.studentDetails.whatsapp = value;
        } else if (key.toLowerCase().includes('email')) {
          parsedData.otherDetails.email = value;
        } else if (key.toLowerCase().includes('birth year')) {
          const year = parseInt(value);
          if (!isNaN(year)) {
            parsedData.otherDetails.age = new Date().getFullYear() - year;
          }
        } else if (key.toLowerCase().includes('qualification')) {
          parsedData.otherDetails.qualification = value;
        } else if (key.toLowerCase().includes('profession')) {
          parsedData.otherDetails.profession = value;
        } else if (key.toLowerCase().includes('batch')) {
          parsedData.referredBy.batch = value;
        } else if (key.toLowerCase().includes('student id')) {
          parsedData.referredBy.studentId = value;
        } else if (key.toLowerCase().includes('town') || key.toLowerCase().includes('city')) {
          if (currentSection === 'hometownDetails') {
            parsedData.hometownDetails.city = value;
          } else if (currentSection === 'currentResidence') {
            parsedData.currentResidence.city = value;
          }
        } else if (key.toLowerCase().includes('district')) {
          parsedData.hometownDetails.district = value;
        } else if (key.toLowerCase().includes('state')) {
          if (currentSection === 'hometownDetails') {
            parsedData.hometownDetails.state = value;
          } else if (currentSection === 'currentResidence') {
            parsedData.currentResidence.state = value;
          }
        } else if (key.toLowerCase().includes('country')) {
          if (currentSection === 'hometownDetails') {
            parsedData.hometownDetails.country = value;
          } else if (currentSection === 'currentResidence') {
            parsedData.currentResidence.country = value;
          }
        } else if (key.toLowerCase().includes('zone')) {
          parsedData.currentResidence.zone = value;
        } else if (key.toLowerCase().includes('area')) {
          parsedData.currentResidence.area = value;
        } else if (currentSection) {
          // Default field mapping
          parsedData[currentSection][normalizedKey] = value;
        }
      }
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing application text:', error);
    return null;
  }
};