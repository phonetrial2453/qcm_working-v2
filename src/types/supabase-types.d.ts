
import { Database } from '@/integrations/supabase/types';

// Custom type for classes
export type ClassRecord = Database['public']['Tables']['classes']['Row'];
export type ClassInsert = Database['public']['Tables']['classes']['Insert'];
export type ClassUpdate = Database['public']['Tables']['classes']['Update'];

// Add other types as needed
export type ModeratorClass = Database['public']['Tables']['moderator_classes']['Row'];
