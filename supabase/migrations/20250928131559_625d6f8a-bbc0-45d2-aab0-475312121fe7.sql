-- Completely remove and recreate the public_profiles view to ensure it's not security definer
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Recreate with explicit SECURITY INVOKER (default, but making it explicit)
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker=true) AS
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

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO anon, authenticated;