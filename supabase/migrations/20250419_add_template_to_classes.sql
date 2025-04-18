
-- Add template field to classes table
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS template TEXT;

-- Update RLS policies
ALTER TABLE public.classes DROP POLICY IF EXISTS "Allow public to view classes";
CREATE POLICY "Allow public to view classes" 
  ON public.classes 
  FOR SELECT 
  USING (true);

-- Update any missing RLS policies on moderator_classes
ALTER TABLE public.moderator_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow admins to manage moderator classes" 
  ON public.moderator_classes 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Allow moderators to view their classes" 
  ON public.moderator_classes 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Grant public SELECT permission on classes
GRANT SELECT ON public.classes TO anon;
GRANT SELECT ON public.classes TO authenticated;
