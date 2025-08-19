
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
      
      // Process key-value pairs
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        let key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Normalize key for storage
        const normalizedKey = key
          .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
          .replace(/\s+/g, '') // Remove spaces
          .replace(/^\w/, c => c.toLowerCase()); // Make first letter lowercase
        
        // Determine section based on key if not explicitly set
        if (!currentSection) {
          if (key.toLowerCase().includes('name') || key.toLowerCase().includes('mobile') || key.toLowerCase().includes('whatsapp')) {
            currentSection = 'studentDetails';
          } else if (key.toLowerCase().includes('email') || key.toLowerCase().includes('age') || key.toLowerCase().includes('qualification') || key.toLowerCase().includes('profession')) {
            currentSection = 'otherDetails';
          } else if (key.toLowerCase().includes('hometown') || key.toLowerCase().includes('district')) {
            currentSection = 'hometownDetails';
          } else if (key.toLowerCase().includes('residence') || key.toLowerCase().includes('mandal')) {
            currentSection = 'currentResidence';
          } else if (key.toLowerCase().includes('referred') || key.toLowerCase().includes('batch')) {
            currentSection = 'referredBy';
          } else {
            currentSection = 'otherDetails'; // Default section
          }
        }
        
        // Special handling for specific fields
        if (key.toLowerCase().includes('age') && !isNaN(parseInt(value))) {
          parsedData.otherDetails.age = parseInt(value);
        } else if (key.toLowerCase().includes('email')) {
          parsedData.otherDetails.email = value;
        } else if (key.toLowerCase().includes('batch')) {
          // Store batch in referredBy section
          parsedData.referredBy.batch = value;
        } else if (key.toLowerCase().includes('name')) {
          if (currentSection === 'referredBy') {
            parsedData.referredBy.fullName = value;
          } else {
            parsedData.studentDetails.fullName = value;
          }
        } else if (currentSection) {
          parsedData[currentSection][normalizedKey] = value;
        }
      }
    }
    
    // Ensure fullName is properly set
    if (parsedData.studentDetails.name && !parsedData.studentDetails.fullName) {
      parsedData.studentDetails.fullName = parsedData.studentDetails.name;
      delete parsedData.studentDetails.name;
    }
    
    // Extract class code from the beginning if present
    const firstLine = lines[0]?.trim();
    if (firstLine && !firstLine.includes(':') && firstLine.length < 10) {
      parsedData.classCode = firstLine;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing application text:', error);
    return null;
  }
};
