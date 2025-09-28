-- Fix Security Definer View issue by recreating public_profiles view properly
-- Drop the existing view that has security definer properties
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without security definer (uses SECURITY INVOKER by default)
-- This ensures the view respects the querying user's RLS policies
CREATE VIEW public.public_profiles AS
SELECT 
  profiles.id,
  profiles.full_name,
  profiles.avatar_url,
  profiles.role,
  profiles.bio,
  profiles.location,
  profiles.website,
  profiles.social_links,
  profiles.is_verified,
  profiles.created_at,
  profiles.tags,
  profiles.portfolio_url,
  profiles.experience_years,
  profiles.hourly_rate,
  profiles.account_status
FROM profiles
WHERE profiles.account_status = 'approved';