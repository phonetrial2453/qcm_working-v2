import { parseApplicationText } from './applicationValidation';

export interface ParsedApplication {
  id: string;
  parsedData: any;
  originalText: string;
  status: 'pending' | 'cancelled' | 'submitted';
}

export const parseMultipleApplications = (text: string): ParsedApplication[] => {
  try {
    // Split by multiple patterns that indicate new applications
    const separators = [
      /\n\s*={5,}\s*\n/g, // === lines
      /\n\s*-{5,}\s*\n/g, // --- lines
      /\n\s*Application\s*\d+/gi, // "Application 1", "Application 2", etc.
      /\n\s*\d+\.\s*/g, // Numbered lists: "1.", "2.", etc.
    ];
    
    let applicationTexts: string[] = [text];
    
    // Try each separator to split the text
    for (const separator of separators) {
      const newTexts: string[] = [];
      for (const chunk of applicationTexts) {
        const split = chunk.split(separator);
        newTexts.push(...split);
      }
      applicationTexts = newTexts;
    }
    
    // Filter out empty or too short texts
    applicationTexts = applicationTexts
      .map(t => t.trim())
      .filter(t => t.length > 50); // Minimum length for a valid application
    
    // If no splitting worked, check if it's a single application
    if (applicationTexts.length === 1) {
      const singleParsed = parseApplicationText(text);
      if (singleParsed) {
        return [{
          id: generateTempId(),
          parsedData: singleParsed,
          originalText: text,
          status: 'pending'
        }];
      }
      return [];
    }
    
    // Parse each application text
    const applications: ParsedApplication[] = [];
    
    for (let i = 0; i < applicationTexts.length; i++) {
      const appText = applicationTexts[i];
      const parsed = parseApplicationText(appText);
      
      if (parsed) {
        applications.push({
          id: generateTempId(),
          parsedData: parsed,
          originalText: appText,
          status: 'pending'
        });
      }
    }
    
    return applications;
  } catch (error) {
    console.error('Error parsing multiple applications:', error);
    return [];
  }
};

const generateTempId = (): string => {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
};