
/**
 * Generates a simple application ID based on class code and a suffix
 * @param classCode The class code prefix for the ID
 * @param suffix Numeric suffix for the ID
 * @returns A formatted application ID
 */
export const generateSimpleApplicationId = (classCode: string, suffix: number): string => {
  return `${classCode}-${suffix.toString().padStart(4, '0')}`;
};

/**
 * Generates a unique application ID by checking existing IDs and finding the next available number
 * @param classCode The class code prefix for the ID
 * @param existingIds An array of existing application IDs to avoid duplicates
 * @returns A unique application ID
 */
export const generateUniqueApplicationId = (classCode: string, existingIds: string[] = []): string => {
  // Find the highest suffix for this class code
  let maxSuffix = 0;
  
  existingIds
    .filter(id => id.startsWith(classCode + '-'))
    .forEach(id => {
      // Extract the suffix part after the class code
      const parts = id.split('-');
      // Get the last part of the array as the suffix
      if (parts.length >= 2) {
        const suffix = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(suffix) && suffix > maxSuffix) {
          maxSuffix = suffix;
        }
      }
    });
  
  // Generate a new ID with the next available suffix
  return generateSimpleApplicationId(classCode, maxSuffix + 1);
};
