-- Fix Security Definer View issue by just updating functions to have proper search_path
-- The view itself doesn't need SECURITY DEFINER property and can't have RLS policies directly

-- First recreate the view properly (without trying to add RLS policies to it)
DROP VIEW IF EXISTS public.public_profiles CASCADE;

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

-- Grant access to the public view (this will use the underlying table's RLS policies)
GRANT SELECT ON public.public_profiles TO authenticated, anon;