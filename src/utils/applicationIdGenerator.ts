/**
 * Generates a simple application ID using the class code and a sequential number
 * @param classCode The class code (e.g., "NRTH02")
 * @param currentCount The current count of applications for this class
 * @returns A formatted application ID (e.g., "NRTH02-1032")
 */
export const generateSimpleApplicationId = (classCode: string, currentCount: number): string => {
  const formattedCode = classCode.toUpperCase();
  const sequentialNumber = (currentCount + 1).toString().padStart(4, '0');
  return `${formattedCode}-${sequentialNumber}`;
};

/**
 * Extracts the class code from an application ID
 * @param applicationId The application ID (e.g., "NRTH02-1032")
 * @returns The class code (e.g., "NRTH02")
 */
export const extractClassCodeFromId = (applicationId: string): string => {
  // Assuming the format is always [CLASS_CODE][4-DIGIT_NUMBER]
  // This will extract everything except the last 4 characters
  return applicationId.slice(0, -4).toUpperCase();
};
