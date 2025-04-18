
-- Modify the applications table to use custom IDs instead of UUIDs
ALTER TABLE public.applications 
ALTER COLUMN id TYPE TEXT,
ALTER COLUMN id DROP DEFAULT;

-- Also add a function to store user profile changes
CREATE OR REPLACE FUNCTION public.update_user_profile(
  name text,
  avatar_url text DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get the current user ID
  _user_id := auth.uid();
  
  -- Update the user's metadata
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('name', name, 'avatar_url', avatar_url)
      ELSE 
        raw_user_meta_data || 
        jsonb_build_object('name', name, 'avatar_url', avatar_url)
    END
  WHERE id = _user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;
