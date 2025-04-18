
-- Create a table for moderator class assignments
CREATE TABLE IF NOT EXISTS public.moderator_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, class_code)
);

-- Add RLS policies
ALTER TABLE public.moderator_classes ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own class assignments
CREATE POLICY "Users can view their own class assignments" 
  ON public.moderator_classes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow admins to manage all moderator class assignments
CREATE POLICY "Admins can manage moderator class assignments" 
  ON public.moderator_classes 
  USING (public.has_role(auth.uid(), 'admin'));

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.moderator_classes TO authenticated;
