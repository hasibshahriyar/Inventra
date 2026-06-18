-- Run this script in the Supabase SQL Editor to allow users to delete their own accounts
-- This creates a secure Postgres function that can be called from the client using supabase.rpc('delete_user')

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
