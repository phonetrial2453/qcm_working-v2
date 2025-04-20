
import { z } from 'zod';

export const applicationSchema = z.object({
  classCode: z.string().min(2, { message: "Class code is required" }),
  studentDetails: z.object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    mobile: z.string().min(10, { message: "Valid mobile number is required" }),
    whatsapp: z.string().optional(),
  }),
  otherDetails: z.object({
    email: z.string().email({ message: "Valid email is required" }),
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
    const sections = text.split('\n\n');
    const parsedData: any = {
      studentDetails: {},
      otherDetails: {},
      currentResidence: {},
      hometownDetails: {},
      referredBy: {},
    };

    parsedData.classCode = sections[0].trim();

    const processLines = (targetObj: any, lines: string[]) => {
      lines.slice(1).forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
          const formattedKey = key.toLowerCase().replace(/\s+/g, '');
          if (formattedKey === 'age') {
            targetObj[formattedKey] = parseInt(value, 10);
          } else {
            targetObj[formattedKey] = value;
          }
        }
      });
    };

    sections.forEach(section => {
      const lines = section.split('\n');
      const sectionTitle = lines[0].trim().toUpperCase();

      switch(sectionTitle) {
        case 'STUDENT DETAILS':
          processLines(parsedData.studentDetails, lines);
          break;
        case 'OTHER DETAILS':
          processLines(parsedData.otherDetails, lines);
          break;
        case 'CURRENT RESIDENCE':
          processLines(parsedData.currentResidence, lines);
          break;
        case 'HOMETOWN DETAILS':
          processLines(parsedData.hometownDetails, lines);
          break;
        case 'REFERRED BY':
          processLines(parsedData.referredBy, lines);
          break;
      }
    });

    return parsedData;
  } catch (error) {
    console.error('Error parsing application text:', error);
    return null;
  }
};
