
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
  }).refine(data => {
    // If email exists, ensure it's a valid email format
    if (data.email) {
      try {
        const emailSchema = z.string().email();
        emailSchema.parse(data.email);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }, {
    message: "Email must be a valid email address",
    path: ["email"],
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

    // Split the text into sections
    const normalizedText = text.replace(/={3,}/g, '===');
    const sections = normalizedText.split('===').filter(Boolean);
    
    // Process each section
    let currentSection: string | null = null;
    
    // If the first section doesn't have a header, assume it's the class code
    if (sections.length > 0 && !sections[0].includes(':')) {
      parsedData.classCode = sections[0].trim();
    }

    // Process remaining text line by line
    let lines = text.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines or dividers
      if (!line || line.match(/^-+$/) || line.match(/^=+$/)) continue;
      
      // Check for section headers
      if (line.toUpperCase().includes('STUDENT DETAILS')) {
        currentSection = 'studentDetails';
        continue;
      } else if (line.toUpperCase().includes('OTHER DETAILS')) {
        currentSection = 'otherDetails';
        continue;
      } else if (line.toUpperCase().includes('HOMETOWN DETAILS')) {
        currentSection = 'hometownDetails';
        continue;
      } else if (line.toUpperCase().includes('CURRENT RESIDENCE')) {
        currentSection = 'currentResidence';
        continue;
      } else if (line.toUpperCase().includes('REFERRED BY')) {
        currentSection = 'referredBy';
        continue;
      }
      
      // Process the line if we're in a section
      if (currentSection) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          let key = line.substring(0, colonIndex).trim()
            .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
            .replace(/\s+/g, '') // Remove spaces
            .replace(/^\w/, c => c.toLowerCase()); // Make first letter lowercase
            
          let value = line.substring(colonIndex + 1).trim();
          
          // Special case for age - convert to number
          if ((key === 'age' || key.toLowerCase().includes('age')) && !isNaN(parseInt(value))) {
            parsedData[currentSection][key] = parseInt(value);
          } 
          // Special case for email - ensure proper format
          else if (key === 'email' || key.toLowerCase().includes('email')) {
            const emailValue = value.trim();
            parsedData[currentSection][key] = emailValue;
          } 
          else {
            parsedData[currentSection][key] = value;
          }
        }
      }
    }
    
    // Special handling for fullName
    if (parsedData.studentDetails.name && !parsedData.studentDetails.fullName) {
      parsedData.studentDetails.fullName = parsedData.studentDetails.name;
      delete parsedData.studentDetails.name;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing application text:', error);
    return null;
  }
};
