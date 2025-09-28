-- Fix the remaining function search path issue
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Check if there are any security definer views still present
-- The linter might be detecting an edge case we need to address differently
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'public_profiles';