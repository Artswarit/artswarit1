-- Update public_profiles view to include cover_url
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  cover_url,
  role,
  bio,
  location,
  website,
  portfolio_url,
  tags,
  account_status,
  social_links,
  is_verified,
  experience_years,
  hourly_rate,
  created_at
FROM public.profiles;