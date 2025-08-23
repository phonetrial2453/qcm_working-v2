import { parseApplicationText } from './applicationValidation';

export interface ParsedApplication {
  id: string;
  parsedData: any;
  originalText: string;
  status: 'pending' | 'cancelled' | 'submitted';
}

export const parseMultipleApplications = (text: string): ParsedApplication[] => {
  try {
    // Split applications using "=== Full Name" as the delimiter
    const fullNamePattern = /(?:^|\n)\s*===\s*Full\s*Name\s*[:=]\s*([^\n]+)/gi;
    const matches = [...text.matchAll(fullNamePattern)];
    
    if (matches.length === 0) {
      // Try parsing as single application
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
    
    const applications: ParsedApplication[] = [];
    
    // If only one match, treat as single application
    if (matches.length === 1) {
      const parsed = parseApplicationText(text);
      if (parsed) {
        applications.push({
          id: generateTempId(),
          parsedData: parsed,
          originalText: text,
          status: 'pending'
        });
      }
    } else {
      // Multiple applications - split by Full Name occurrences
      for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];
        
        const startIndex = currentMatch.index || 0;
        const endIndex = nextMatch ? (nextMatch.index || text.length) : text.length;
        
        const appText = text.substring(startIndex, endIndex).trim();
        
        if (appText.length > 50) { // Minimum length check
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