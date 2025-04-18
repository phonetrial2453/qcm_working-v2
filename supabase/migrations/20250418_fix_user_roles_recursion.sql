
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

-- Create a function with the name "has_role" that TypeScript expects
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = $1
    AND role = role_name::app_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the function has the correct permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO anon;
