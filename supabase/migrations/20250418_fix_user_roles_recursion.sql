
-- Create or replace a function to get user roles without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  roles TEXT[];
BEGIN
  SELECT ARRAY_AGG(role::TEXT)
  INTO roles
  FROM public.user_roles
  WHERE user_id = $1;
  
  RETURN COALESCE(roles, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function has the correct permissions
GRANT EXECUTE ON FUNCTION public.get_user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles TO anon;
